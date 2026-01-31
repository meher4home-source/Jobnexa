
import { UserProfile } from "../types";

// --- MAGIC SOLUTION: POLLINATIONS.AI (STABLE CONFIG) ---
const POLLINATIONS_URL = "https://text.pollinations.ai/";

// --- HELPER: ROBUST AI CALL ---
async function callAI(messages: Array<{ role: string, content: string }>, jsonMode: boolean = false, retries = 2): Promise<string> {
  
  try {
    const payload = {
      messages: messages,
      model: "openai", 
      seed: Math.floor(Math.random() * 100000),
      jsonMode: jsonMode
    };

    // Timeout increased to 25s for better stability on slow networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(POLLINATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Server Busy: ${response.status}`);

    const text = await response.text();
    
    // Basic validation
    if (!text || text.includes("<html") || text.length < 5) {
        throw new Error("Invalid AI response");
    }

    return text.trim();

  } catch (error: any) {
    if (retries > 0) {
      // Exponential Backoff: Wait 1s, then 2s
      const delay = 1000 * Math.pow(2, 2 - retries);
      await new Promise(res => setTimeout(res, delay));
      return callAI(messages, jsonMode, retries - 1);
    }
    throw error; 
  }
}

// --- HELPER: CLEAN JSON ---
function extractJsonArray(text: string): string {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
        return text.substring(start, end + 1);
    }
    return "[]";
}

// --- FALLBACK DATA GENERATORS (Guaranteed Success) ---
const getFallbackResume = (profile: UserProfile) => `## Professional Summary
Results-oriented ${profile.targetRole} with expertise in ${profile.skills}. Proven track record of driving efficiency and delivering high-quality results in competitive environments.

## Core Skills
* ${profile.skills.split(',').join(', ')}
* Project Management & Team Collaboration
* Strategic Planning & Problem Solving

## Professional Experience
**${profile.targetRole}** | *Confidential Company* | 2021 - Present
* Spearheaded key initiatives that increased operational efficiency by 20%.
* Collaborated with cross-functional teams to meet strict project deadlines.

**Previous Role** | *Previous Company* | 2018 - 2021
* Managed daily operations and ensured compliance with industry standards.
* Mentored junior team members to improve overall team performance.

## Education
**${profile.education || "Bachelor's Degree"}**`;

const getFallbackQuestions = (profile: UserProfile) => JSON.stringify([
    { question: "Tell me about yourself.", answer: "Focus on your professional journey, key skills, and why you are a great fit for this role." },
    { question: `What is your experience with ${profile.skills.split(',')[0]}?`, answer: "Describe a specific project where you used this skill to solve a problem." },
    { question: "Why do you want to work here?", answer: "Align your personal career goals with the company's mission and values." }
]);

// --- EXPORTED FUNCTIONS ---

export const generateResume = async (profile: UserProfile): Promise<string> => {
  const messages = [
    { role: "system", content: "Resume Writer. Markdown. One Page. Structure: Summary, Skills, Experience, Education." },
    { role: "user", content: `Resume for ${profile.targetRole}. Skills: ${profile.skills}. Edu: ${profile.education}.` }
  ];
  
  try {
    return await callAI(messages);
  } catch (e) {
    console.warn("AI Failed, using template.");
    return getFallbackResume(profile);
  }
};

export const generateCoverLetter = async (profile: UserProfile, jobDesc: string): Promise<string> => {
  const messages = [
    { role: "system", content: "Cover Letter. Short. Professional. No placeholders." },
    { role: "user", content: `Role: ${profile.targetRole}. Job: ${jobDesc}. User: ${profile.fullName}.` }
  ];
  try {
    return await callAI(messages);
  } catch (e) {
    return `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${profile.targetRole} position. With my background in ${profile.skills}, I am confident I can contribute effectively to your team.\n\nThank you for considering my application.\n\nSincerely,\n${profile.fullName}`;
  }
};

export const generateInterviewQuestions = async (profile: UserProfile): Promise<string> => {
  const messages = [
    { role: "system", content: "Output JSON Array ONLY: [{\"question\":\"...\",\"answer\":\"...\"}]. Max 3 items." },
    { role: "user", content: `Interview questions for ${profile.targetRole}.` }
  ];

  try {
      const text = await callAI(messages, true);
      const cleanJson = extractJsonArray(text);
      const parsed = JSON.parse(cleanJson);
      
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid JSON");
      return cleanJson;
  } catch (e) {
      console.warn("AI JSON Failed, using fallback.");
      return getFallbackQuestions(profile);
  }
};

export const generateMarketInsights = async (profile: UserProfile): Promise<string> => {
  const messages = [
    { role: "system", content: "Career Analyst. Markdown. Max 50 words. Bullet points." },
    { role: "user", content: `Job market for ${profile.targetRole} in ${profile.targetRegion}.` }
  ];
  try {
    return await callAI(messages);
  } catch (e) {
    return `## Market Outlook: ${profile.targetRegion}\n* **Demand:** High demand for ${profile.targetRole} professionals.\n* **Salary:** Competitive and trending upwards.\n* **Key Insight:** Focus on highlighting ${profile.skills.split(',')[0]} to stand out.`;
  }
};

export const createChatSession = (restoredHistory?: Array<{ role: string, content: string }>) => {
  const systemPrompt = { 
    role: "system", 
    content: "Career Coach. Short answers only." 
  };

  const history = restoredHistory || [systemPrompt];

  return {
    sendMessage: async (input: { message: string }) => {
      history.push({ role: "user", content: input.message });
      try {
        // Keep context very small for speed
        const context = [systemPrompt, ...history.slice(-4)];
        const text = await callAI(context);
        history.push({ role: "assistant", content: text });
        return { text };
      } catch (e) {
        return { text: "I'm having a bit of trouble connecting. Please try asking again in a moment." };
      }
    }
  };
};
