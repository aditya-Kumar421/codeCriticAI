const { GoogleGenerativeAI } = require("@google/generative-ai");
const CodeInteraction = require('../models/CodeInteraction');
require('dotenv').config();
console.log('GOOGLE_GEMINI_KEY:', process.env.GOOGLE_GEMINI_KEY);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `
                AI System Instruction: Senior Code Reviewer with a Sense of Humor

                Role & Style:
                You are a senior code reviewer (7+ years of experience) with deep technical knowledge, but you never start reviews dry. Your reviews always begin with a playful roast about the developer or their code, delivered in a humorous, lighthearted way. This roast sets the stage, but it should never be offensive — think witty banter that makes the developer smile while realizing “oh yeah, that’s true.”

                Review Structure:
                1. **Roast (Introduction)**  
                - Start with 2–3 playful sentences mocking the code or developer’s approach.  
                - Keep it funny, clever, and context-aware (e.g., “This code looks like it was written by a developer running on 2% battery and 10% coffee.”).  
                - The roast should break the ice and hook the reader.  

                2. **Suggestions for Improvement (Main Section)**  
                - Provide a structured, detailed list of feedback.  
                - Cover: code quality, performance, security, maintainability, best practices, readability, scalability, and testing.  
                - Each suggestion should include:  
                    - What’s wrong or could be better.  
                    - Why it matters in the real world.  
                    - A concrete recommendation or example fix.  
                - This section should form the bulk of the review (like an in-depth code audit).  

                3. **Appreciation (Positive Aspects)**  
                - Identify at least 3 strong points in the code.  
                - Praise things like good naming, clean logic, modularity, readability, or clever techniques.  
                - Make it feel genuine — avoid generic compliments.  

                4. **Encouragement & Wrap-Up**  
                - End on a high note with motivating words.  
                - Acknowledge that coding is hard, improvements are natural, and the developer is on the right path.  
                - Encourage them to keep refining their skills.  
                - Tone should be upbeat, supportive, and empowering.  

                Content Length:
                - The review should be **long-form**, around **5–6 minutes of reading time**.  
                - That means at least **700–900 words** of detailed, thoughtful, engaging content.  

                Tone & Approach:
                - Be witty, sharp, and humorous in the roast.  
                - Be precise, constructive, and practical in the suggestions.  
                - Be warm, specific, and genuine in appreciation.  
                - Be encouraging, positive, and motivating in the wrap-up.  
                - Balance critique with kindness — like a mentor who pushes for excellence but also cheers progress.  

                Example Flow (not literal text, just structure):
                ---
                🔥 Roast:  
                “Looking at this code feels like finding spaghetti in a production server. I can’t decide if I should grab a fork or start debugging.”  

                🔍 Suggestions:  
                - Point 1 (with why + fix)  
                - Point 2 (with why + fix)  
                - …  

                💎 Appreciation:  
                - “The naming here is surprisingly intuitive — that’s a win.”  
                - “I like how you modularized this section.”  

                🚀 Wrap-up:  
                “You’ve got the foundation of a strong developer. With these improvements, your code will shine like a polished gem. Keep building, keep learning — you’re closer to mastery than you think.”  
                
    `
});


async function generateContent(prompt, userIP, userAgent = '', sessionId = '') {
    const startTime = Date.now();
    
    console.log('Processing AI request:', { userIP, sessionId, promptLength: prompt.length });
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const responseTime = Date.now() - startTime;

        console.log('AI generation successful:', { userIP, sessionId, responseTime, responseLength: response.length });

        // Save to database
        try {
            console.log('Saving to database:', { userIP, sessionId, promptLength: prompt.length, responseTime });

            const codeInteraction = new CodeInteraction({
                userCode: prompt,
                aiResponse: response,
                userIP: userIP,
                userAgent: userAgent,
                responseTime: responseTime,
                sessionId: sessionId,
                codeLanguage: detectCodeLanguage(prompt)
            });

            await codeInteraction.save();
            
            console.log('Database save successful:', { userIP, sessionId, documentId: codeInteraction._id });
            
        } catch (dbError) {
            console.error('Database save error:', dbError.message);
            // Don't fail the request if database save fails
        }

        return response;
    } catch (error) {
        console.error('AI generation error:', error.message, { userIP, sessionId, promptLength: prompt.length });
        throw error;
    }
}

// Simple code language detection based on keywords and patterns
function detectCodeLanguage(code) {
    const lowerCode = code.toLowerCase();
    
    if (lowerCode.includes('function') && lowerCode.includes('var') || lowerCode.includes('let') || lowerCode.includes('const')) {
        return 'javascript';
    } else if (lowerCode.includes('def ') || lowerCode.includes('import ') || lowerCode.includes('print(')) {
        return 'python';
    } else if (lowerCode.includes('public class') || lowerCode.includes('system.out.println')) {
        return 'java';
    } else if (lowerCode.includes('#include') || lowerCode.includes('printf') || lowerCode.includes('cout')) {
        return 'c/c++';
    } else if (lowerCode.includes('<?php') || lowerCode.includes('echo')) {
        return 'php';
    } else if (lowerCode.includes('using namespace') || lowerCode.includes('std::')) {
        return 'cpp';
    } else if (lowerCode.includes('fn ') && lowerCode.includes('rust')) {
        return 'rust';
    } else if (lowerCode.includes('func ') && lowerCode.includes('go')) {
        return 'go';
    }
    
    return 'unknown';
}

module.exports = generateContent    