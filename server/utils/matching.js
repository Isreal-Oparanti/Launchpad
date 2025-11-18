const { MongoClient } = require('mongodb');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { HumanMessage } = require('@langchain/core/messages');
const { OpenAIEmbeddings } = require('@langchain/openai');
const User = require('../models/User');

function calculateMatchScore(user, neededRole) {
  let rawScore = 0;
  const userSkills = (user.skills || []).map(s => s.toLowerCase());
  const roleSkills = (neededRole.requiredSkills || []).map(s => s.toLowerCase());
  const userInterests = (user.interests || []).map(i => i.toLowerCase());

  // Skills: +5 per match
  roleSkills.forEach(roleSkill => {
    if (userSkills.includes(roleSkill)) rawScore += 5;
  });

  // Interests in description: +4 per match
  if (neededRole.description) {
    const descLower = neededRole.description.toLowerCase();
    userInterests.forEach(interest => {
      if (descLower.includes(interest)) rawScore += 4;
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

  // Base bonus: +1
  if (user.openToCollaboration) rawScore += 1;

  // Normalize to 100%
  const maxPossible = (roleSkills.length * 5) + (userInterests.length * 4) + 3 + 3 + 1;
  return Math.round((rawScore / maxPossible) * 100) || 0;
}

async function matchUsersToProject(project, topK = 5) {
  console.log(`\n🎯 MATCHING FOR PROJECT: ${project.title}`);
  console.log(`👤 Creator ID: ${project.creator}`);
  console.log(`🎭 Needed Roles: ${JSON.stringify(project.neededRoles.map(r => r.role))}\n`);

  try {
    // ============================================
    // AI MATCHING (Primary Method)
    // ============================================
    if (process.env.USE_AI_MATCHING === 'true') {
      console.log('🤖 Running AI vector search...');
      
      try {
        const embeddings = new OpenAIEmbeddings({
          modelName: 'text-embedding-3-small',
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db(process.env.MONGODB_DB || 'Launchpad');

        try {
          // Build rich query text from project
          const queryText = `
            Project: ${project.title}
            Problem: ${project.problemStatement || ''}
            Solution: ${project.solution || ''}
            Target Market: ${project.targetMarket || ''}
            
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

          // CRITICAL: Get ALL candidates first, then filter
          const allCandidates = await db.collection('users').aggregate([
            {
              $vectorSearch: {
                index: 'vector_index',
                path: 'profileEmbedding',
                queryVector: queryEmbedding,
                limit: 50, // Get more candidates
                numCandidates: 100,
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

          // NOW filter out self-match and validate
          const validMatches = allCandidates.filter(doc => {
            const isCreator = doc._id.toString() === project.creator.toString();
            const hasEmbedding = doc.score != null;
            const isOpenToCollab = true; // Already filtered by vector search
            const hasBasicInfo = doc.fullName || doc.username;

            if (isCreator) {
              console.log(`❌ FILTERED OUT: ${doc.fullName} (self-match)`);
              return false;
            }

            return hasEmbedding && hasBasicInfo;
          }).slice(0, topK);

          console.log(`✅ After filtering: ${validMatches.length} valid matches`);

          if (validMatches.length === 0) {
            console.log('⚠️ No valid AI matches found, falling back to keyword matching');
            return await keywordFallback(project, topK);
          }

          // ============================================
          // GENERATE RICH EXPLANATIONS WITH LLM
          // ============================================
          console.log('🧠 Generating contextual explanations...');

          const llm = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.4,
          });

          // Prepare user profiles for LLM
          const userProfiles = validMatches.map((user, idx) => ({
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
          }));

          const prompt = PromptTemplate.fromTemplate(`
You are an expert matchmaker for startup co-founders and collaborators. 

PROJECT DETAILS:
- Title: {projectTitle}
- Problem: {problemStatement}
- Solution: {solution}
- Stage: {stage}

ROLES NEEDED:
{rolesNeeded}

MATCHED CANDIDATES:
{candidates}

TASK: For each candidate, write a compelling 2-3 sentence explanation of why they're an excellent match. Focus on:
1. Specific skills/expertise alignment with the role requirements
2. Relevant experience or background
3. Cultural/personality fit based on their profile
4. Location or commitment compatibility if relevant

Be specific, professional, and enthusiastic. Avoid generic statements. Don't mention vector scores or technical matching details.

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
            rolesNeeded: project.neededRoles.map(r => 
              `Role: ${r.role}\nSkills: ${r.requiredSkills.join(', ')}\nDescription: ${r.description || 'Not specified'}`
            ).join('\n\n'),
            candidates: JSON.stringify(userProfiles, null, 2)
          });

          const enriched = await llm.invoke([new HumanMessage({ content: formattedPrompt })]);
          console.log('✅ LLM explanations generated');

          let explanations;
          try {
            // Try to parse JSON response
            const content = enriched.content.trim();
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            explanations = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
          } catch (parseErr) {
            console.error('⚠️ Failed to parse LLM response, using fallback');
            explanations = null;
          }

          // Build final matches with explanations
          const finalMatches = validMatches.map((match, idx) => {
            const explanation = explanations?.[idx]?.explanation || 
              generateFallbackExplanation(match, project.neededRoles[0]);

            return {
              userId: match._id,
              userName: match.fullName || match.username || 'Unknown User',
              profilePicture: match.profilePicture || null,
              role: project.neededRoles[0]?.role || 'Collaborator',
              score: Math.round((1 - match.score) * 100), // Convert similarity to percentage
              explanation: explanation,
              skills: match.skills || [],
              location: match.location || null,
              currentPosition: match.currentPosition || null,
            };
          });

          await client.close();
          console.log(`✅ AI matching completed: ${finalMatches.length} matches\n`);
          return finalMatches;

        } catch (innerErr) {
          console.error('❌ Vector search error:', innerErr.message);
          throw innerErr;
        }
      } catch (aiErr) {
        console.error('❌ AI matching failed:', aiErr.message);
        return await keywordFallback(project, topK);
      }
    }

    // ============================================
    // KEYWORD FALLBACK (Backup Method)
    // ============================================
    return await keywordFallback(project, topK);

  } catch (error) {
    console.error('❌ Critical matching error:', error);
    return [];
  }
}

// ============================================
// KEYWORD FALLBACK FUNCTION
// ============================================
async function keywordFallback(project, topK) {
  console.log('🔤 Running keyword-based matching...');

  const users = await User.find({
    openToCollaboration: true,
    _id: { $ne: project.creator } // CRITICAL: Exclude creator
  }).select('fullName username skills interests expertise location currentPosition collaborationProfile bio')
    .lean();

  console.log(`📊 Found ${users.length} open users (excluding creator)`);

  const matches = [];

  project.neededRoles.forEach(role => {
    users.forEach(user => {
      const score = calculateMatchScore(user, role);
      
      if (score >= 20) { // Quality threshold
        const skillsMatch = role.requiredSkills.filter(s => 
          user.skills.some(us => us.toLowerCase() === s.toLowerCase())
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
          location: user.location || null,
          currentPosition: user.currentPosition || null,
        });
      }
    });
  });

  const sortedMatches = matches.sort((a, b) => b.score - a.score).slice(0, topK);
  console.log(`✅ Keyword matching completed: ${sortedMatches.length} matches\n`);
  
  return sortedMatches.length > 0 ? sortedMatches : [{
    userId: null,
    userName: 'No matches found',
    score: 0,
    explanation: 'Try broadening your required skills or updating your project description for better matches.',
  }];
}

// ============================================
// FALLBACK EXPLANATION GENERATOR
// ============================================
function generateFallbackExplanation(user, role, skillsMatch = []) {
  const parts = [];

  // Skills
  if (skillsMatch.length > 0) {
    parts.push(`Strong skills match in ${skillsMatch.slice(0, 3).join(', ')}`);
  } else if (user.skills?.length > 0) {
    parts.push(`Brings expertise in ${user.skills.slice(0, 3).join(', ')}`);
  }

  // Position
  if (user.currentPosition) {
    parts.push(`Currently working as ${user.currentPosition}`);
  }

  // Location
  if (user.location && role.preferredLocation && 
      user.location.toLowerCase().includes(role.preferredLocation.toLowerCase())) {
    parts.push(`Located in ${user.location}`);
  }

  // Commitment
  if (user.collaborationProfile?.commitmentLevel === role.commitment) {
    parts.push(`Available for ${role.commitment.toLowerCase()} commitment`);
  }

  return parts.length > 0 
    ? parts.join('. ') + '.'
    : 'Potential collaborator with relevant background. Review their profile for more details.';
}

module.exports = { matchUsersToProject };