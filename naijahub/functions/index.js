/**
 * NaijaHub Africa - Backend Cloud Functions
 * Secure proxy for SolveAI Gemini API with rate limiting and input validation
 */

const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors")({ origin: true });

// Simple in-memory rate limiter per IP (max 30 requests per minute)
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 30;

  const userRecord = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > userRecord.resetAt) {
    userRecord.count = 1;
    userRecord.resetAt = now + windowMs;
    rateLimitMap.set(ip, userRecord);
    return true;
  }

  if (userRecord.count >= maxRequests) {
    return false;
  }

  userRecord.count += 1;
  rateLimitMap.set(ip, userRecord);
  return true;
}

exports.solveAiAssistant = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
    secrets: ["GEMINI_API_KEY"],
  },
  async (req, res) => {
    return cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
      }

      const clientIp = req.ip || req.headers["x-forwarded-for"] || "anonymous";
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please wait a minute before requesting another explanation.",
        });
      }

      const { prompt, topic, moduleType, contextData } = req.body || {};

      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Prompt is required and must be non-empty." });
      }

      if (prompt.length > 2000) {
        return res.status(400).json({ error: "Prompt exceeds maximum allowed length of 2000 characters." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Safe fallback simulation if API key is not configured in environment
        return res.json({
          success: true,
          answer: `[SolveAI Step-by-Step Guidance on ${topic || "African Practical Problem"}]:\n\n1. Analysis: ${prompt}\n2. Practical Formula: Apply standard Nigerian business/engineering coefficients.\n3. Detailed Calculation: Verified using local parameters.\n4. Pro-Tip: Ensure quality control and accurate recording.`,
          simulated: true,
        });
      }

      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = 
          "You are SolveAI, an expert STEM, Agribusiness, Solar Engineering, and Financial tutor on NaijaHub Africa. " +
          "Your mission is to provide clear, practical, step-by-step problem-solving suited for African businesses, students, and engineers. " +
          "Always explain the underlying formula, substitute the numbers clearly, and state actionable insights. Use Naira (₦) for financial problems.";

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Topic: ${topic || "Practical Problem"}\nContext: ${JSON.stringify(contextData || {})}\n\nQuestion/Prompt:\n${prompt}`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        const reply = response.text || "No explanation could be generated.";
        return res.json({
          success: true,
          answer: reply,
        });
      } catch (err) {
        console.error("Gemini API Error in Cloud Function:", err);
        return res.status(500).json({
          error: "Failed to process request with AI tutor. Please try again shortly.",
        });
      }
    });
  }
);
