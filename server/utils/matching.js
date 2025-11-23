const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { HumanMessage } = require('@langchain/core/messages');
const { OpenAIEmbeddings } = require('@langchain/openai');
const User = require('../models/User');
const Match = require('../models/Match');

// SINGLETON: Reuse embeddings instance
let embeddings = null;
if (process.env.USE_AI_MATCHING === 'true' && process.env.OPENAI_API_KEY) {
  try {
    embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,
      timeout: 15000,
    });
    console.log('✅ OpenAI embeddings initialized');
  } catch (err) {
    console.warn('⚠️ Failed to initialize embeddings:', err.message);
  }
}

function calculateMatchScore(user, neededRole) {
  let rawScore = 0;
  const userSkills = (user.skills || []).map(s => s.toLowerCase());
  const roleSkills = (neededRole.requiredSkills || []).map(s => s.toLowerCase());
  const userInterests = (user.interests || []).map(i => i.toLowerCase());

  // Skills: +5 per match
  let skillMatches = 0;
  roleSkills.forEach(roleSkill => {
    if (userSkills.includes(roleSkill)) {
      rawScore += 5;
      skillMatches++;
    }
  });

  // CRITICAL FIX: Lower threshold - accept users with related skills/interests
  // Even 0 skill matches can be valuable if they have relevant interests/experience
  
  // Interests in description: +4 per match
  if (neededRole.description) {
    const descLower = neededRole.description.toLowerCase();
    userInterests.forEach(interest => {
      if (descLower.includes(interest)) rawScore += 4;
    });
  }

  // Expertise bonus: +3 per relevant expertise
  if (user.expertise && user.expertise.length > 0) {
    const userExpertise = user.expertise.map(e => e.toLowerCase());
    roleSkills.forEach(roleSkill => {
      if (userExpertise.includes(roleSkill)) {
        rawScore += 3;
      }
    });
  }

  // Location: +3
  if (user.location && neededRole.preferredLocation && 
      user.location.toLowerCase().includes(neededRole.preferredLocation.toLowerCase())) {
    rawScore += 3;
  }

  // Commitment: +3
  if (user.collaborationProfile?.commitmentLevel === neededRole.commitment) {
    rawScore += 3;
  }

  // Base bonus: +2 for being open to collaboration
  if (user.openToCollaboration) rawScore += 2;

  // Normalize to 100%
  const maxPossible = (roleSkills.length * 5) + (userInterests.length * 4) + 
                      (roleSkills.length * 3) + 3 + 3 + 2;
  
  const normalizedScore = maxPossible > 0 ? Math.round((rawScore / maxPossible) * 100) : 0;
  
  // CRITICAL FIX: Ensure minimum score for valid profiles
  return normalizedScore > 0 ? Math.max(normalizedScore, 25) : 0;
}

async function matchUsersToProject(project, topK = 5) {
  console.log(`\n🎯 MATCHING FOR PROJECT: ${project.title}`);
  console.log(`👤 Creator ID: ${project.creator}`);
  console.log(`🎭 Needed Roles: ${JSON.stringify(project.neededRoles.map(r => r.role))}\n`);

  try {
    // ============================================
    // AI MATCHING (Primary Method)
    // ============================================
    if (process.env.USE_AI_MATCHING === 'true' && embeddings) {
      console.log('🤖 Running AI vector search...');
      
      try {
        // CRITICAL FIX: Use existing Mongoose connection instead of creating new one
        const db = mongoose.connection.db;
        
        if (!db) {
          console.error('❌ Mongoose connection not ready');
          throw new Error('Database not connected');
        }

        // Build rich query text from project
        const queryText = `
          Project: ${project.title}
          Problem: ${project.problemStatement || ''}
          Solution: ${project.solution || ''}
          Target Market: ${project.targetMarket || ''}
          Category: ${project.category}
          Stage: ${project.stage}
          
          Needed Roles:
          ${project.neededRoles.map(r => `
            - ${r.role}
            - Skills Required: ${r.requiredSkills.join(', ')}
            - Description: ${r.description || 'Not specified'}
            - Location: ${r.preferredLocation || 'Any'}
            - Commitment: ${r.commitment || 'Flexible'}
          `).join('\n')}
        `.trim();

        console.log('📝 Query text length:', queryText.length, 'chars');

        const queryEmbedding = await embeddings.embedQuery(queryText);
        console.log('✅ Query embedding generated');

        // Convert creator ID to ObjectId
        const creatorObjectId = typeof project.creator === 'string' 
          ? new ObjectId(project.creator) 
          : project.creator;

        console.log('🔍 Excluding creator:', creatorObjectId.toString());

        // Vector search with better error handling
        console.log('🔍 Running enhanced vector search...');
        
        const allCandidates = await db.collection('users').aggregate([
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'profileEmbedding',
              queryVector: queryEmbedding,
              limit: 100,
              numCandidates: 200,
            }
          },
          {
            $match: {
              openToCollaboration: true,
              profileEmbedding: { $exists: true, $ne: null },
              _id: { $ne: creatorObjectId }
            }
          },
          {
            $project: {
              fullName: 1,
              username: 1,
              profilePicture: 1,
              skills: 1,
              interests: 1,
              expertise: 1,
              location: 1,
              bio: 1,
              currentPosition: 1,
              collaborationProfile: 1,
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ]).toArray();

        console.log(`📊 Vector search returned ${allCandidates.length} candidates`);

        if (allCandidates.length === 0) {
          console.log('⚠️ No AI matches found, falling back to keyword matching');
          return await keywordFallback(project, topK);
        }

        // Analyze candidates
        const validMatches = allCandidates
          .filter(doc => {
            const docId = doc._id.toString();
            const creatorId = creatorObjectId.toString();
            return docId !== creatorId && (doc.fullName || doc.username);
          })
          .map(doc => {
            const vectorScore = Math.round((1 - doc.score) * 100);
            const userSkills = (doc.skills || []).map(s => s.toLowerCase());
            const roleSkills = project.neededRoles[0]?.requiredSkills || [];
            
            const skillMatches = roleSkills.filter(rs => 
              userSkills.includes(rs.toLowerCase())
            ).length;
            
            const skillBonus = skillMatches * 15;
            const finalScore = Math.min(95, vectorScore + skillBonus);

            return {
              ...doc,
              enhancedScore: finalScore,
              vectorScore: vectorScore,
              skillMatches: skillMatches
            };
          })
          .sort((a, b) => b.enhancedScore - a.enhancedScore)
          .slice(0, topK);

        console.log(`✅ After filtering: ${validMatches.length} valid matches`);

        // Generate LLM explanations
        const finalMatches = await generateLLMExplanations(validMatches, project);

        // Save matches to database
        console.log('💾 Saving AI matches to database...');
        await saveMatchesToDB(project._id, finalMatches);
        console.log('✅ AI matches saved to DB');

        console.log(`✅ AI matching completed: ${finalMatches.length} matches\n`);
        return finalMatches;

      } catch (aiErr) {
        console.error('❌ AI matching failed:', aiErr.message);
        console.error('Stack:', aiErr.stack);
        return await keywordFallback(project, topK);
      }
    }

    // Fallback to keyword matching
    return await keywordFallback(project, topK);

  } catch (error) {
    console.error('❌ Critical matching error:', error);
    return [];
  }
}

// ============================================
// KEYWORD FALLBACK FUNCTION (FIXED)
// ============================================
async function keywordFallback(project, topK) {
  console.log('🔤 Running keyword-based matching...');

  try {
    // Convert creator to ObjectId for proper comparison
    const creatorObjectId = typeof project.creator === 'string' 
      ? new mongoose.Types.ObjectId(project.creator) 
      : project.creator;

    console.log('🔍 Excluding creator:', creatorObjectId.toString());

    // CRITICAL FIX: Use Mongoose properly with ObjectId comparison
    const users = await User.find({
      openToCollaboration: true,
      _id: { $ne: creatorObjectId }
    }).select('fullName username profilePicture skills interests expertise location currentPosition collaborationProfile bio')
      .lean()
      .exec();

    console.log(`📊 Found ${users.length} open users (excluding creator)`);

    if (users.length === 0) {
      console.log('❌ No users available for matching');
      return [{
        userId: null,
        userName: 'No matches found',
        score: 0,
        explanation: 'No users are currently open to collaboration. Try again later.',
        matchType: 'keyword'
      }];
    }

    const matches = [];

    // CRITICAL FIX: Generate matches for EACH needed role
    project.neededRoles.forEach(role => {
      console.log(`\n📋 Matching for role: ${role.role}`);
      console.log(`   Required skills: ${role.requiredSkills.join(', ')}`);
      
      users.forEach(user => {
        const score = calculateMatchScore(user, role);
        
        // CRITICAL FIX: Lower threshold to 20% to include more candidates
        if (score >= 20) {
          const skillsMatch = role.requiredSkills.filter(s => 
            (user.skills || []).some(us => us.toLowerCase() === s.toLowerCase())
          );
          
          const explanation = generateFallbackExplanation(user, role, skillsMatch);

          matches.push({
            userId: user._id,
            userName: user.fullName || user.username,
            profilePicture: user.profilePicture || null,
            role: role.role,
            score,
            explanation,
            skills: user.skills || [],
            expertise: user.expertise || [],
            location: user.location || null,
            currentPosition: user.currentPosition || null,
            matchType: 'keyword'
          });
        }
      });
    });

    console.log(`\n📊 Total matches before sorting: ${matches.length}`);

    // Sort by score and take top K
    const sortedMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    
    console.log(`✅ Keyword matching completed: ${sortedMatches.length} matches`);

    if (sortedMatches.length > 0) {
      sortedMatches.forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.userName}: ${m.score}% - ${m.role}`);
      });

      // Save matches to database
      console.log('💾 Saving keyword matches to database...');
      await saveMatchesToDB(project._id, sortedMatches);
      console.log('✅ Matches saved to DB');
      
      return sortedMatches;
    }

    // No matches found
    console.log('⚠️ No matches met the threshold');
    return [{
      userId: null,
      userName: 'No matches found',
      score: 0,
      explanation: 'Try broadening your required skills or updating your project description for better matches.',
      matchType: 'keyword'
    }];

  } catch (error) {
    console.error('❌ Keyword matching error:', error);
    return [{
      userId: null,
      userName: 'Error finding matches',
      score: 0,
      explanation: 'An error occurred while searching for matches. Please try again.',
      matchType: 'keyword'
    }];
  }
}

// ============================================
// LLM EXPLANATION GENERATOR
// ============================================
async function generateLLMExplanations(matches, project) {
  if (!process.env.OPENAI_API_KEY || matches.length === 0) {
    return matches.map(m => ({
      ...m,
      explanation: generateFallbackExplanation(m, project.neededRoles[0])
    }));
  }

  try {
    console.log('🧠 Generating contextual explanations...');

    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.4,
    });

    const userProfiles = matches.map((user, idx) => ({
      index: idx,
      name: user.fullName || user.username,
      position: user.currentPosition || 'Not specified',
      skills: user.skills || [],
      expertise: user.expertise || [],
      interests: user.interests || [],
      location: user.location || 'Not specified',
      bio: user.bio || 'No bio available',
      commitment: user.collaborationProfile?.commitmentLevel || 'Not specified',
      lookingFor: user.collaborationProfile?.lookingFor || [],
      vectorScore: user.vectorScore,
      skillMatches: user.skillMatches
    }));

    const prompt = PromptTemplate.fromTemplate(`
You are an expert matchmaker for startup co-founders and collaborators. 

PROJECT DETAILS:
- Title: {projectTitle}
- Problem: {problemStatement}
- Solution: {solution}
- Stage: {stage}
- Category: {category}

ROLES NEEDED:
{rolesNeeded}

MATCHED CANDIDATES:
{candidates}

TASK: For each candidate, write a compelling 2-3 sentence explanation of why they're an excellent match. Focus on:
1. Specific skills/expertise alignment with the role requirements
2. Relevant experience or background
3. Cultural/personality fit based on their profile
4. Location or commitment compatibility if relevant
5. Any transferable skills that could be valuable

Be specific, professional, and enthusiastic. If a candidate doesn't have exact skill matches but has relevant background, explain why they could still be a great fit.

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks):
[
  {{"explanation": "First candidate explanation here"}},
  {{"explanation": "Second candidate explanation here"}},
  {{"explanation": "Third candidate explanation here"}}
]
`);

    const formattedPrompt = await prompt.format({
      projectTitle: project.title,
      problemStatement: project.problemStatement || 'Not specified',
      solution: project.solution || 'Not specified',
      stage: project.stage || 'Not specified',
      category: project.category || 'Not specified',
      rolesNeeded: project.neededRoles.map(r => 
        `Role: ${r.role}\nSkills: ${r.requiredSkills.join(', ')}\nDescription: ${r.description || 'Not specified'}`
      ).join('\n\n'),
      candidates: JSON.stringify(userProfiles, null, 2)
    });

    const enriched = await llm.invoke([new HumanMessage({ content: formattedPrompt })]);
    
    let explanations;
    try {
      let content = enriched.content.trim();
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        explanations = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed', explanations.length, 'explanations');
      } else {
        throw new Error('No JSON array found');
      }
    } catch (parseErr) {
      console.error('⚠️ JSON parse failed, using fallback');
      explanations = null;
    }

    return matches.map((match, idx) => ({
      userId: match._id,
      userName: match.fullName || match.username || 'Unknown User',
      profilePicture: match.profilePicture || null,
      role: project.neededRoles[0]?.role || 'Collaborator',
      score: match.enhancedScore,
      explanation: explanations?.[idx]?.explanation || 
        generateFallbackExplanation(match, project.neededRoles[0]),
      skills: match.skills || [],
      expertise: match.expertise || [],
      location: match.location || null,
      currentPosition: match.currentPosition || null,
      matchType: 'ai',
      vectorSimilarity: match.vectorScore,
      skillMatches: match.skillMatches
    }));

  } catch (err) {
    console.error('⚠️ LLM explanation generation failed:', err.message);
    return matches.map(m => ({
      ...m,
      explanation: generateFallbackExplanation(m, project.neededRoles[0])
    }));
  }
}

// ============================================
// FALLBACK EXPLANATION GENERATOR (IMPROVED)
// ============================================
function generateFallbackExplanation(user, role, skillsMatch = []) {
  const parts = [];

  // Skills match
  if (skillsMatch.length > 0) {
    parts.push(`Strong skills match in ${skillsMatch.slice(0, 3).join(', ')}`);
  } else if (user.skills?.length > 0) {
    parts.push(`Brings expertise in ${user.skills.slice(0, 3).join(', ')}`);
  }

  // Expertise
  if (user.expertise?.length > 0) {
    parts.push(`Experienced in ${user.expertise.slice(0, 2).join(' and ')}`);
  }

  // Position
  if (user.currentPosition) {
    parts.push(`Currently working as ${user.currentPosition}`);
  }

  // Location
  if (user.location && role.preferredLocation && 
      user.location.toLowerCase().includes(role.preferredLocation.toLowerCase())) {
    parts.push(`Based in ${user.location}`);
  }

  // Commitment
  if (user.collaborationProfile?.commitmentLevel === role.commitment) {
    parts.push(`Available for ${role.commitment.toLowerCase()} commitment`);
  }

  return parts.length > 0 
    ? parts.join('. ') + '.'
    : 'Potential collaborator with relevant background. Review their profile for more details.';
}

// ============================================
// SAVE MATCHES TO DATABASE
// ============================================
async function saveMatchesToDB(projectId, matches) {
  try {
    const matchDocuments = matches
      .filter(m => m.userId) // Skip null matches
      .map(match => ({
        project: projectId,
        user: match.userId,
        role: match.role,
        score: match.score,
        explanation: match.explanation,
        matchedSkills: match.skills || [],
        matchType: match.matchType || 'ai',
        status: 'pending',
        matchedAt: new Date()
      }));

    if (matchDocuments.length > 0) {
      await Match.insertMany(matchDocuments, { ordered: false });
      console.log(`💾 Saved ${matchDocuments.length} matches to database`);
    }
  } catch (err) {
    if (err.code === 11000) {
      console.log('⚠️ Some matches already exist (duplicate key)');
    } else {
      console.error('❌ Failed to save matches:', err.message);
    }
  }
}

// ============================================
// FETCH SAVED MATCHES
// ============================================
async function getProjectMatches(projectId) {
  try {
    console.log(`📥 Fetching matches for project: ${projectId}`);
    const matches = await Match.find({ project: projectId })
      .populate('user', 'fullName username profilePicture skills location currentPosition title expertise interests collaborationProfile')
      .sort({ score: -1, matchedAt: -1 })
      .lean();

    console.log(`✅ Retrieved ${matches.length} cached matches from database`);

    return matches.map(m => ({
      userId: m.user?._id,
      userName: m.user?.fullName || m.user?.username || 'Unknown User',
      profilePicture: m.user?.profilePicture || null,
      role: m.role,
      score: m.score,
      explanation: m.explanation,
      skills: m.user?.skills || [],
      location: m.user?.location,
      currentPosition: m.user?.currentPosition,
      title: m.user?.title,
      expertise: m.user?.expertise || [],
      interests: m.user?.interests || [],
      matchType: m.matchType,
      status: m.status,
      matchedAt: m.matchedAt,
    }));
  } catch (err) {
    console.error('❌ Failed to fetch matches:', err.message);
    return [];
  }
}

module.exports = { matchUsersToProject, getProjectMatches };