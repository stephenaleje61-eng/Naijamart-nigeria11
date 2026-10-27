import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { 
  translateWithIndigenousEngine, 
  simulateIndigenousConversation,
  SupportedLanguage,
  DomainTone
} from './src/locallanguage/services/indigenousEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '2mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// 1. POST /api/translateLocal endpoint
app.post('/api/translateLocal', async (req, res) => {
  const { text, sourceLang = 'en', targetLang = 'yo', tone = 'general' } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text to translate is required.' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ error: 'Text exceeds maximum limit of 2,000 characters.' });
  }

  const ai = getAiClient();
  let aiTranslation: any = null;

  if (ai) {
    try {
      const prompt = `You are an expert indigenous Nigerian and African linguist specializing in Yoruba, Hausa, Igbo, Nigerian Pidgin, Edo, Efik, Fulfulde, Tiv, and Kanuri.
Translate the following text accurately with deep cultural respect and natural idioms:
Source language: ${sourceLang}
Target language: ${targetLang}
Desired tone: ${tone} (e.g. general, market bargaining, business intro, customer care, friendly, respectful to elders)
Text to translate: "${text}"

Output strictly a JSON object with this exact structure:
{
  "translation": "The translated text with proper tonal marks if applicable",
  "explanation": "Short cultural context of the phrase",
  "toneNote": "How this translation matches the requested tone",
  "pronunciation": "Phonetic syllable guide for non-native speakers",
  "alternatives": ["Alternative phrase 1", "Alternative phrase 2"],
  "uncertainty": false
}`;

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI translation request timed out')), 4000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
      const responseText = response.text || '';
      aiTranslation = JSON.parse(responseText);
    } catch {
      // Free tier unavailable or quota reached - gracefully use high-precision indigenous engine
      console.log('[Translate API] Using indigenous linguistic engine (Gemini free tier unavailable or restricted)');
    }
  }

  if (aiTranslation && aiTranslation.translation) {
    return res.status(200).json(aiTranslation);
  }

  // High-precision indigenous Nigerian linguistic engine
  const fallback = translateWithIndigenousEngine(
    text,
    sourceLang as SupportedLanguage,
    targetLang as SupportedLanguage,
    tone as DomainTone
  );
  return res.status(200).json(fallback);
});

// 2. POST /api/conversationLocal endpoint
app.post('/api/conversationLocal', async (req, res) => {
  const { message, language = 'yo', scenarioId = 'market', history = [] } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const ai = getAiClient();
  let aiReply: any = null;

  if (ai) {
    try {
      const prompt = `You are a native conversational partner in a Nigerian roleplay scenario:
Scenario: ${scenarioId}
Target Nigerian language: ${language} (yo: Yoruba, ha: Hausa, ig: Igbo, pcm: Nigerian Pidgin)
User message: "${message}"

Respond strictly as the Nigerian roleplay character in the chosen language.
Format your output strictly as a JSON object:
{
  "nativeReply": "Your reply in the chosen Nigerian language",
  "englishSubtitle": "English translation of your reply",
  "feedback": "Coaching feedback on the user's sentence and cultural phrasing",
  "simplerExplanation": "A simplified breakdown of any difficult native words"
}`;

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI conversation request timed out')), 4000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6
        }
      });

      const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
      aiReply = JSON.parse(response.text || '{}');
    } catch {
      console.log('[Conversation API] Using indigenous roleplay simulator (Gemini free tier unavailable or restricted)');
    }
  }

  if (aiReply && aiReply.nativeReply) {
    return res.status(200).json(aiReply);
  }

  const fallback = simulateIndigenousConversation(
    message,
    language as SupportedLanguage,
    scenarioId,
    history
  );
  return res.status(200).json(fallback);
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NaijaHub & LocalLanguage server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
