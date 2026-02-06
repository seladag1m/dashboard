
import { GoogleGenAI, Type } from "@google/genai";
import { User, BusinessDNA, StrategicReport, MarketingAsset, Message, Project } from "../types";

const buildSystemInstruction = (dna: BusinessDNA) => `
You are Consult AI, an elite institutional intelligence engine.
Your purpose is to provide high-stakes strategic synthesis for ${dna.companyName}.
BUSINESS PROFILE:
- Sector: ${dna.industry}
- Model: ${dna.businessModel}
- Market: ${dna.operatingMarkets.join(", ")}
- Objectives: ${dna.strategicGoals.join(", ")}
- Status: ${dna.stage}

PROTOCOL:
1. Executive tone. Institutional gravity. 
2. Direct, unsweetened analysis.
3. Structure: CORE INSIGHT -> EVIDENCE -> TACTICAL RESPONSE.
4. Ground all recommendations in current market indices.
`;

const extractJson = (text: string) => {
  if (!text) return {};
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (e) {
    console.error("Institutional Data Parsing Error:", e);
    return {};
  }
};

export const scanAndEnrichDNA = async (dna: BusinessDNA): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform a high-stakes institutional audit of ${dna.website}. 
  Identify Industry, Business Model, Customer Segment, Competitors, and Social handles.
  Return strictly JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: prompt }] },
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  return extractJson(response.text || "{}");
};

export const fetchRealTimeIntelligence = async (user: User, type: 'competitors' | 'market' | 'alerts' | 'overview' | 'social') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptMap = {
    competitors: `Identify top rivals for ${user.companyName}. Return JSON: { "competitors": [{ "name": "string", "url": "string", "latitude": "number", "longitude": "number", "swot": { "strengths": ["string"], "weaknesses": ["string"] } }] }`,
    market: `Analyze market forces for ${user.dna.industry}. Return JSON for bubble charts and porters 5 forces.`,
    social: `Analyze brand sentiment for ${user.companyName}. Return JSON.`,
    alerts: `Detect market anomalies for ${user.companyName}. Return JSON: { "alerts": [{ "title": "string", "desc": "string", "category": "Threat|Opportunity", "strategicMove": "string" }] }`,
    overview: `High-level system status.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: promptMap[type] || promptMap.overview }] },
    config: { 
      systemInstruction: buildSystemInstruction(user.dna),
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  return extractJson(response.text || "{}");
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [{ text: "Synthesize a comprehensive Board Briefing covering market trajectory." }] },
    config: {
      systemInstruction: buildSystemInstruction(user.dna),
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    id: Date.now().toString(),
    title: "Executive Strategic Mandate",
    date: new Date().toLocaleDateString(),
    summary: "Synthesis of current institutional signals.",
    content: response.text || "Mandate generation failed."
  };
};

export const generateMarketingCampaign = async (user: User, prompt: string, includeVisuals: boolean): Promise<MarketingAsset[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Generate campaign asset for: ${prompt}. Return JSON array.` }] },
    config: { 
      systemInstruction: buildSystemInstruction(user.dna),
      responseMimeType: "application/json" 
    }
  });

  let assets = extractJson(response.text || "[]");
  if (!Array.isArray(assets)) assets = [assets];

  if (includeVisuals && assets[0]) {
    try {
      const imgRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Premium consulting visual for ${user.companyName}: ${assets[0].visualPrompt}` }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      const part = imgRes.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) assets[0].imageData = `data:image/png;base64,${part.inlineData.data}`;
    } catch (e) { console.error("Visual generation failed", e); }
  }

  return assets.map(a => ({ ...a, id: Date.now().toString(), timestamp: new Date().toLocaleDateString() }));
};

// Implemented generateMarketingVideo using Veo 3.1 for strategic motion assets
export const generateMarketingVideo = async (user: User, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<MarketingAsset> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A sleek institutional brand video for ${user.companyName}: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Polling logic for video generation operation
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  // Fetching the final MP4 bytes with the required API key
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  const videoUrl = URL.createObjectURL(blob);

  return {
    id: Date.now().toString(),
    channel: 'Social Video',
    title: `Mandate Motion: ${prompt.substring(0, 30)}`,
    content: `Institutional motion asset synthesized for ${user.companyName} using Veo 3.1.`,
    videoUrl: videoUrl,
    timestamp: new Date().toLocaleDateString(),
    tags: ['Motion', 'Strategic', 'Institutional'],
    aspectRatio: aspectRatio
  };
};

// Implemented getExecutiveConsultation for non-streaming advisory responses
export const getExecutiveConsultation = async (user: User, input: string, history: { role: 'user' | 'model'; content: string }[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: input }] });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: buildSystemInstruction(user.dna),
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "Institutional advisory synthesis timed out.";
};

export const generateChatResponse = async (history: Message[], currentMessage: string, user: User, project?: Project) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(m => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: buildSystemInstruction(user.dna),
      thinkingConfig: { thinkingBudget: 20000 },
      tools: [{ googleSearch: {} }]
    }
  });
};
