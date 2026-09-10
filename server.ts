import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI to prevent server crashes if the API key is not yet configured
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Global server API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Route: AI Coach Chat
app.post("/api/coach/chat", async (req, res) => {
  try {
    const { messages, userProfile, habits } = req.body;
    
    // We can handle missing API key gracefully by simulating a high-quality local behavioral science coach fallback
    if (!process.env.GEMINI_API_KEY) {
      // Return a simulated premium psychological response
      const lastMessage = messages[messages.length - 1]?.text || "";
      
      // Let's find any recently completed habit with an emotional rating to make the simulation incredibly smart
      let recentFeelingContext = "";
      if (habits && habits.length > 0) {
        const completedWithFeelings = habits.filter((h: any) => 
          Object.values(h.records || {}).some((r: any) => r.completed && r.experienceFeeling)
        );
        if (completedWithFeelings.length > 0) {
          const mainHabit = completedWithFeelings[0];
          const rec = Object.values(mainHabit.records).find((r: any) => r.completed && r.experienceFeeling) as any;
          recentFeelingContext = ` I noticed you recently completed your "${mainHabit.name}" habit and logged it as "${rec.experienceFeeling}"${rec.reflectionAnswer ? ` with the recall reflection: "${rec.reflectionAnswer}"` : ''}. That is a profound act of self-awareness!`;
        }
      }

      let simulatedResponse = `Hello! I am Dr. Gethro, your Vicfungo Behavioral Growth Coach.${recentFeelingContext} I see your Gemini API Key is not yet configured in Secrets, but I am still here to help using local psychological modules. Your focus on building lasting habits is backed by behavioral science: Habit Stacking and identity shifting are perfect strategies. Tell me more about what we can explore today!`;
      
      if (lastMessage.toLowerCase().includes("stress") || lastMessage.toLowerCase().includes("tired")) {
        simulatedResponse = "It's completely normal to feel tired or stressed. Under high cognitive load, our brains default to old pathways. To lock in your habit today, try 'Friction Reduction'—make the action so tiny it takes less than 2 minutes. For example, if you want to meditate, just take 3 deep breaths. What tiny version of your habit can we commit to right now?";
      } else if (lastMessage.toLowerCase().includes("fail") || lastMessage.toLowerCase().includes("broke")) {
        simulatedResponse = "A broken streak is never a failure; it is a data point. The gold standard rule of habits is 'Never Miss Twice.' Let's look at what got in your way yesterday and stack a trigger to prevent it today. I am here to coach you, not police you. Let's practice reflective learning.";
      }
      
      return res.json({
        text: simulatedResponse,
        insights: [
          {
            title: "Never Miss Twice",
            description: "Missing once is a variance; missing twice is a new habit. Complete your habit today to lock in your identity shift.",
            category: "Behavioral",
            principle: "Identity Shift"
          }
        ]
      });
    }

    const ai = getAiClient();
    
    // Build context about user habits and psychological profile
    const profileSummary = userProfile 
      ? `User's psychological style: ${userProfile.growthPersona || 'Balanced Growth seeker'}. 
         Focus areas: ${userProfile.focusAreas?.join(', ') || 'General growth'}.
         Onboarding Answers: ${JSON.stringify(userProfile.quizAnswers || {})}.`
      : 'General user seeking personal growth.';

    const habitsSummary = habits && habits.length > 0
      ? `Active Habits:\n${habits.map((h: any) => {
          const recentRecords = Object.entries(h.records || {})
            .slice(-3) // last 3 records
            .map(([date, rec]: [string, any]) => {
              return `- Date ${date}: Completed=${rec.completed}${rec.experienceFeeling ? `, Feeling=${rec.experienceFeeling}` : ''}${rec.reflectionAnswer ? `, Recall Reflection="${rec.reflectionAnswer}"` : ''}`;
            }).join('\n');
          return `* ${h.name} (${h.category}, difficulty: ${h.difficulty}, current streak: ${h.currentStreak}d)
Recent Entries:\n${recentRecords || '  No completion logs yet.'}`;
        }).join('\n\n')}`
      : 'No habits created yet. Guide them to create their first habit using Behavioral Design Principles.';

    const systemInstruction = `You are Dr. Gethro, a world-class behavioral psychologist, executive coach, and personal growth mentor for the Vicfungo app. 
Your tone is warm, professional, highly motivating, empathetic, and grounded in real psychological science (e.g., James Clear, BJ Fogg, Carol Dweck).

CRITICAL DIRECTIVE: "Coach, not police." 
Do NOT act as a strict validator or police officer verifying if they completed their habits "perfectly" or accusing them of dishonesty. 
Instead, your primary objective is to encourage reflection, curiosity, and self-awareness. 
Help them look at their habits with a growth mindset. For example, if they logged a habit as 'challenging' or 'boring', treat this as valuable, non-judgmental feedback to help them tweak their system, rather than a failure of discipline.

Context:
${profileSummary}
${habitsSummary}

Guidelines:
1. Provide actionable advice. Focus heavily on behavioral tactics like Habit Stacking, Friction Reduction, Identity-Based Habits, and Temptation Bundling.
2. Integrate their emotional experience logs (e.g., if they find a habit 'boring', suggest ways to bundle it; if 'challenging', suggest micro-stepping; celebrate 'energizing' experiences).
3. Be brief, scannable, and highly engaging. Use bolding and short lists.
4. Keep the conversation encouraging. Celebrate small wins and guide reflective learning.
5. Respond in JSON format strictly matching the provided schema, which includes both the main conversational text and 1-2 curated "Insights" or actionable suggestions that the user can immediately practice.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The conversational response text, structured in markdown format."
            },
            insights: {
              type: Type.ARRAY,
              description: "1-2 actionable psychological insights or exercises specifically tailored to this moment in the conversation.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  principle: { type: Type.STRING, description: "e.g., Habit Stacking, Friction Reduction, Identity Shift" }
                },
                required: ["title", "description", "category", "principle"]
              }
            }
          },
          required: ["text", "insights"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ 
      error: "Could not generate AI response", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// API Route: AI Insights Generator
app.post("/api/coach/insights", async (req, res) => {
  try {
    const { habits, userProfile } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        insights: [
          {
            title: "Reduce Friction for Habit Loops",
            description: "You have active growth goals. Make the first action of your hardest habits take less than 2 minutes.",
            category: "Efficiency",
            principle: "Friction Reduction",
            impact: "High"
          },
          {
            title: "Identity Alignment",
            description: "Focus on who you want to become rather than what you want to achieve. Every action is a vote for that person.",
            category: "Identity",
            principle: "Identity Shift",
            impact: "Medium"
          }
        ]
      });
    }

    const ai = getAiClient();
    const systemPrompt = `Analyze the user's habits and psychological style. Generate 2 personalized, highly actionable behavioral psychology insights for their dashboard.
User Profile: ${JSON.stringify(userProfile || {})}
Habits: ${JSON.stringify(habits || [])}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        systemInstruction: "You are a professional habit design scientist. Output exactly 2 high-impact psychological insights based on user data.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  principle: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                },
                required: ["title", "description", "category", "principle", "impact"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ error: "Could not generate insights" });
  }
});

// Serve frontend assets using Vite middleware or static delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
