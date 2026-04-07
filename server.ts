import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  app.use(express.json());

  // API routes
  app.post("/api/coach", async (req, res) => {
    const { mood, usage } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are Aria, a supportive, witty, and empathetic digital wellbeing coach. Your goal is to guide users towards healthier digital habits while acting like a supportive friend.

Analyze the user's mood: "${mood}", their daily app usage: ${JSON.stringify(usage)}, the current time of day: ${new Date().getHours()}:00, and the day of the week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.

1. Detect the user's mood (e.g., anxious, lonely, excited, bored, etc.).
2. Tailor your response:
   - If they are anxious: Suggest a grounding technique or short break, and gently encourage them to put the phone down.
   - If they are lonely: Suggest connecting with a real friend, engaging in a hobby, or doing something offline.
   - If they are excited: Celebrate with them, but remind them to stay present and not just scroll through their success.
   - If they are bored: Suggest a creative or physical activity instead of mindless scrolling.
3. Suggest a specific, actionable "micro-action" based on the mood, time, and day (e.g., "5-minute guided meditation", "10-minute walk", "text a friend", "draw for 5 minutes").
4. Use light, appropriate humor to make interactions engaging and less robotic.
5. Always maintain the core focus on healthy digital habits, but prioritize the user's emotional state.
6. Keep the response concise, supportive, and friendly.`,
      });
      res.json({ response: response.text });
    } catch (error) {
      console.error("Gemini error:", error);
      res.status(500).json({ error: "Failed to get coach response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
