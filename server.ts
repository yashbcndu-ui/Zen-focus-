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
        contents: `You are a supportive AI coach for a digital wellbeing app. 
        Analyze the user's mood: "${mood}" and their daily app usage: ${JSON.stringify(usage)}.
        Provide personalized, emotionally engaging, and varied advice. 
        If they are stressed and have high usage of distracting apps, suggest a short mindfulness exercise with a touch of humor.
        Include insights like 'Scrolling when stressed can sometimes make it worse, like adding fuel to the fire!'.
        Keep it concise and supportive.`,
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
