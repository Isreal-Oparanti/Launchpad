// utils/matching.js - FINAL VERSION: AI First (Raw Aggregation, No Crash), Bold Fallback, Self-Exclusion, Structured Explanations
const { MongoClient } = require('mongodb');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { HumanMessage } = require('@langchain/core/messages');
const { OpenAIEmbeddings } = require('@langchain/openai');
const User = require('../models/User');
const Match = require('../models/Match');

function calculateMatchScore(user, neededRole) {
  let rawScore = 0;
  const userSkills = (user.skills || []).map(s => s.toLowerCase());
  const roleSkills = (neededRole.requiredSkills || []).map(s => s.toLowerCase());
  const userInterests = (user.interests || []).map(i => i.toLowerCase());

  // Skills: +40% per match (core fit)
  const skillMatches = roleSkills.filter(roleSkill => userSkills.includes(roleSkill));
  rawScore += (skillMatches.length / Math.max(roleSkills.length, 1)) * 40;

  // Interests in description: +30% per match
  if (neededRole.description) {
    const descLower = neededRole.description.toLowerCase();
    const interestMatches = userInterests.filter(interest => descLower.includes(interest));
    rawScore += (interestMatches.length / Math.max(userInterests.length, 1)) * 30;
  }

  // Location: +15% if match
  if (user.location && neededRole.preferredLocation && user.location.toLowerCase().includes(neededRole.preferredLocation.toLowerCase())) {
    rawScore += 15;
  }

  // Commitment: +15% if match
  if (user.collaborationProfile?.commitmentLevel === neededRole.commitment) {
    rawScore += 15;
  }

  return Math.round(rawScore);  // 0-100%
}

async function matchUsersToProject(project, topK = 5) {
  let rawMatches = [];

  try {
    // AI FIRST (Raw MongoDB aggregation—no LangChain Document crash)
    let aiMatches = [];
    if (process.env.USE_AI_MATCHING === 'true') {
      console.log('Running AI matching first...');
      try {
        const embeddings = new OpenAIEmbeddings({
          modelName: 'text-embedding-3-small',
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db(process.env.MONGODB_DB || 'Launchpad');

        try {
          const queryText = `
            Needed Roles: ${project.neededRoles.map(r => `
              Role: ${r.role}
              Skills: ${r.requiredSkills.join(', ')}
              Location: ${r.preferredLocation || ''}
              Commitment: ${r.commitment || ''}
              Equity: ${r.equity || ''}
              Description: ${r.description || ''}
            `).join('\n')}
            Problem: ${project.problemStatement || ''}
            Solution: ${project.solution || ''}
          `.trim();

          const queryEmbedding = await embeddings.embedQuery(queryText);

          const results = await db.collection('users').aggregate([
            {
              $vectorSearch: {
                index: 'vector_index',
                path: 'profileEmbedding',
                queryVector: queryEmbedding,
                limit: topK,
                numCandidates: 50,
              }
            },
            {
              $match: {
                openToCollaboration: true,
                _id: { $ne: project.creator },  // EXCLUDE SELF
                profileEmbedding: { $ne: null, $exists: true, $type: 'array' },
              }
            },
            {
              $addFields: {
                score: { $meta: 'vectorSearchScore' }
              }
            },
            {
              $project: {
                fullName: 1,
                username: 1,
                profilePicture: 1,
                skills: 1,
                interests: 1,
                location: 1,
                collaborationProfile: 1,
                bio: 1,
                score: 1
              }
            },
            { $sort: { score: -1 } },
            { $limit: topK }
          ]).toArray();

          if (results.length > 0) {
            const llm = new ChatOpenAI({
              modelName: 'gpt-4o-mini',
              openAIApiKey: process.env.OPENAI_API_KEY,
              temperature: 0.3,
            });

            const prompt = PromptTemplate.fromTemplate(`
              Project summary: {projectSummary}
              Retrieved matches (with raw scores): {matches}
              Generate 1-2 sentence explanations for each match: Why they fit the project's needs, and a next step (e.g., "Message them to discuss equity").
              Output JSON array of {explanation: "..."} only—no other text.
            `);

            const projectSummary = `Title: ${project.title || 'Untitled'} | Needs: ${project.neededRoles.map(r => r.role).join(', ')}`;
            const formattedPrompt = await prompt.format({
              projectSummary,
              matches: JSON.stringify(results.map((doc, i) => ({ name: doc.fullName, score: doc.score * 100 })))
            });

            const enriched = await llm.invoke([new HumanMessage({ content: formattedPrompt })]);

            let explanations;
            try {
              explanations = JSON.parse(enriched.content);
            } catch {
              explanations = results.map(() => 'Good fit based on profile similarity. Reach out to discuss!');
            }

            aiMatches = results.map((doc, idx) => ({
              userId: doc._id,
              userName: doc.fullName || doc.username || 'Unknown User',
              role: 'AI-Matched Role',
              score: Math.round((1 - doc.score) * 100),
              skills: Array.isArray(doc.skills) ? doc.skills.join(', ') : '',
              rawScore: doc.score,
              explanation: explanations[idx] || `AI match (score ${doc.score * 100}%). Next: Message them about your project.`
            }));

            console.log(`AI found ${aiMatches.length} matches`);
          } else {
            console.log('No AI matches—using fallback');
          }
        } finally {
          await client.close();
        }
      } catch (aiErr) {
        console.error('AI block failed:', aiErr.message);
        aiMatches = [];
      }
    }

    // Fallback: Keyword (Always run if no AI or low quality)
    if (aiMatches.length === 0) {
      console.log('Running enhanced keyword fallback...');
      const users = await User.find({ 
        openToCollaboration: true,
        _id: { $ne: project.creator }  // EXCLUDE SELF
      }).select('fullName username skills interests location collaborationProfile openToCollaboration').lean();

      const matches = [];
      project.neededRoles.forEach(role => {
        users.forEach(user => {
          const score = calculateMatchScore(user, role);
          if (score >= 20) {  // Quality threshold
            const skillsMatch = role.requiredSkills.filter(s => user.skills.some(us => us.toLowerCase() === s.toLowerCase()));
            const interestsMatch = user.interests.filter(i => role.description.toLowerCase().includes(i.toLowerCase()));
            const locationStr = user.location && role.preferredLocation ? ` + ${user.location} match` : '';
            const commitmentStr = user.collaborationProfile?.commitmentLevel === role.commitment ? ` + ${role.commitment} commitment` : '';
            const explanation = `Score ${score}% - Skills: ${skillsMatch.join(', ')}${interestsMatch.length > 0 ? ` + Interests: ${interestsMatch.join(', ')}` : ''}${locationStr}${commitmentStr}`;
            matches.push({
              userId: user._id,
              userName: user.fullName || user.username,
              role: role.role,
              score,
              explanation,
            });
          }
        });
      });

      rawMatches = matches.sort((a, b) => b.score - a.score).slice(0, topK);
      if (rawMatches.length === 0) {
        rawMatches = [{ userId: null, userName: 'No matches', score: 0, explanation: 'Broaden skills for better results.' }];
      }
      console.log(`Fallback found ${rawMatches.length} matches`);
    } else {
      rawMatches = aiMatches;
      console.log(`AI found ${rawMatches.length} matches`);
    }

    // ReAct Agent Layer (optional, simplified – one reasoning call)
    if (process.env.USE_AGENT === 'true') {
      const agentLLM = new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.2,
      });

      const agentPrompt = PromptTemplate.fromTemplate(`
        You are a collaboration agent. Reason step-by-step about these matches for the project: {project}
        Matches: {matches}
        Output: 1. Overall assessment (e.g., "3 strong fits"). 2. Top recommendation. 3. If low matches, suggest refinements.
        Keep under 80 words.
      `);

      const formattedAgentPrompt = await agentPrompt.format({
        project: JSON.stringify(project),
        matches: JSON.stringify(rawMatches)
      });
      const agentResponse = await agentLLM.invoke([new HumanMessage({ content: formattedAgentPrompt })]);

      if (rawMatches.length > 0) {
        rawMatches[0].agentReasoning = agentResponse.content;
      } else {
        rawMatches.push({ userId: null, userName: 'Agent Suggestion', score: 0, explanation: agentResponse.content });
      }
    }

    return rawMatches;
  } catch (error) {
    console.error('Matching error:', error);
    return [];
  }
}

module.exports = { matchUsersToProject };


// AI: LangChain's null crash is deep (metadata in aggregation). Fix: Skip LangChain, use raw MongoDB vector search (faster, no crash). I'll include it.



// // utils/matching.js - FULL UPDATED (Fixed bugs, save all matches to DB, no crashes)
// const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
// const { OpenAIEmbeddings } = require('@langchain/openai');
// const { ChatOpenAI } = require('@langchain/openai');
// const { PromptTemplate } = require('@langchain/core/prompts');
// const { HumanMessage } = require('@langchain/core/messages');
// const { MongoClient } = require('mongodb');
// const User = require('../models/User');
// const Match = require('../models/Match');  // Your existing model

// function calculateMatchScore(user, neededRole) {
//   let score = 0;
//   const userSkillsLower = (user.skills || []).map(s => s.toLowerCase());
//   const roleSkillsLower = (neededRole.requiredSkills || []).map(s => s.toLowerCase());

//   roleSkillsLower.forEach(roleSkill => {
//     if (userSkillsLower.includes(roleSkill)) score += 2;
//   });

//   if (neededRole.description) {
//     const descLower = neededRole.description.toLowerCase();
//     (user.interests || []).forEach(interest => {
//       if (descLower.includes(interest.toLowerCase())) score += 1;
//     });
//   }

//   if (user.openToCollaboration) score += 1;
//   return score;
// }

// async function matchUsersToProject(project, topK = 5) {
//   let rawMatches = [];

//   try {
//     if (process.env.USE_AI_MATCHING === 'true') {
//       console.log('Starting AI vector search...');
//       const embeddings = new OpenAIEmbeddings({
//         modelName: 'text-embedding-3-small',
//         openAIApiKey: process.env.OPENAI_API_KEY,
//       });

//       const llm = new ChatOpenAI({
//         modelName: 'gpt-4o-mini',
//         openAIApiKey: process.env.OPENAI_API_KEY,
//         temperature: 0.3,
//       });

//       const prompt = PromptTemplate.fromTemplate(`
//         Project summary: {projectSummary}
//         Retrieved matches (with raw scores): {matches}
//         Generate 1-2 sentence explanations for each match: Why they fit the project's needs, and a next step (e.g., "Message them to discuss equity"). 
//         If no matches, suggest "Broaden skills in description for better results."
//         Output as JSON array of {explanation: "..."} for each match.
//       `);

//       const client = await MongoClient.connect(process.env.MONGODB_URI);
//       const db = client.db(process.env.MONGODB_DB || 'Launchpad');

//       try {
//         const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
//           collection: db.collection('users'),
//           indexName: 'vector_index',
//           embeddingKey: 'profileEmbedding',
//           textKey: 'bio',
//           client,
//         });

//         const queryText = `
//           Needed Roles: ${project.neededRoles.map(role => `
//             Role: ${role.role}
//             Skills: ${role.requiredSkills.join(', ')}
//             Location: ${role.preferredLocation || ''}
//             Commitment: ${role.commitment || ''}
//             Equity: ${role.equity || ''}
//             Description: ${role.description || ''}
//           `).join('\n')}
//           Problem: ${project.problemStatement || ''}
//           Solution: ${project.solution || ''}
//         `.trim();

//         const queryEmbedding = await embeddings.embedQuery(queryText);

//         let results = [];
//         try {
//           results = await vectorStore.similaritySearchVectorWithScore(queryEmbedding, topK);
//         } catch (searchError) {
//           console.error('Vector search error:', searchError.message);
//           results = [];
//         }

//         // Filter out invalid docs
//         const validResults = results.filter(([doc]) => doc && doc.metadata && doc.metadata._id && Array.isArray(doc.metadata.profileEmbedding) && doc.metadata.profileEmbedding.length > 0);

//         const rawMatchesTemp = validResults.map(([doc, score]) => ({
//           userId: doc.metadata._id,
//           userName: doc.metadata.fullName || doc.metadata.username || 'Unknown User',
//           role: 'Matched Role',
//           score: Math.round((1 - score) * 100),  // Convert to similarity score
//           skills: doc.metadata.skills ? doc.metadata.skills.join(', ') : '',
//           rawScore: score.toFixed(2)
//         }));

//         if (rawMatchesTemp.length === 0) {
//           console.log('No valid vector matches found, falling back to keyword');
//         } else {
//           // RAG: Generate enriched explanations
//           const projectSummary = `Title: ${project.title || 'Untitled'} | Needs: ${project.neededRoles.map(r => r.role).join(', ')}`;
//           const formattedPrompt = await prompt.format({
//             projectSummary,
//             matches: JSON.stringify(rawMatchesTemp)
//           });
//           const enriched = await llm.invoke([new HumanMessage({ content: formattedPrompt })]);

//           let explanations;
//           try {
//             explanations = JSON.parse(enriched.content);
//           } catch {
//             explanations = rawMatchesTemp.map(() => 'Good fit based on profile similarity. Reach out to discuss!');
//           }

//           rawMatches = rawMatchesTemp.map((match, idx) => ({
//             ...match,
//             explanation: explanations[idx]?.explanation || `Semantic match (score ${match.rawScore}). Next: Message them about your project.`
//           }));
//         }
//       } finally {
//         await client.close();
//       }
//     }

//     // FALLBACK: KEYWORD MATCHING
//     if (rawMatches.length === 0) {
//       console.log('Running keyword fallback...');
//       const users = await User.find({ openToCollaboration: true }).select('fullName username skills interests collaborationProfile openToCollaboration');
      
//       const matches = [];
      
//       project.neededRoles.forEach(role => {
//         users.forEach(user => {
//           const score = calculateMatchScore(user, role);
//           if (score > 0) {
//             matches.push({
//               userId: user._id,
//               userName: user.fullName || user.username,
//               role: role.role,
//               score,
//               explanation: `Matches due to overlapping skills: ${user.skills.filter(s => role.requiredSkills.map(rs => rs.toLowerCase()).includes(s.toLowerCase())).join(', ')}`
//             });
//           }
//         });
//       });
      
//       matches.sort((a, b) => b.score - a.score);
//       const uniqueMatches = [...new Map(matches.map(m => [m.userId, m])).values()].slice(0, topK);
      
//       rawMatches = uniqueMatches.length > 0 ? uniqueMatches : [{ userId: null, userName: 'No matches', score: 0, explanation: 'Broaden your needed roles for better results.' }];
//     }

//     // ReAct Agent Layer (optional, simplified – one reasoning call)
//     if (process.env.USE_AGENT === 'true') {
//       const agentLLM = new ChatOpenAI({
//         modelName: 'gpt-4o-mini',
//         openAIApiKey: process.env.OPENAI_API_KEY,
//         temperature: 0.2,
//       });

//       const agentPrompt = PromptTemplate.fromTemplate(`
//         You are a collaboration agent. Reason step-by-step about these matches for the project: {project}
//         Matches: {matches}
//         Output: 1. Overall assessment (e.g., "3 strong fits"). 2. Top recommendation. 3. If low matches, suggest refinements.
//         Keep under 100 words.
//       `);

//       const formattedAgentPrompt = await agentPrompt.format({
//         project: JSON.stringify(project),
//         matches: JSON.stringify(rawMatches)
//       });
//       const agentResponse = await agentLLM.invoke([new HumanMessage({ content: formattedAgentPrompt })]);

//       // Append reasoning
//       if (rawMatches.length > 0) {
//         rawMatches[0].agentReasoning = agentResponse.content;
//       } else {
//         rawMatches.push({ userId: null, userName: 'Agent Suggestion', score: 0, explanation: agentResponse.content });
//       }
//     }

//     return rawMatches;
//   } catch (error) {
//     console.error('Matching error:', error);
//     return [];
//   }
// }

// module.exports = { matchUsersToProject };