
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { User, BusinessDNA, Signal, StrategicReport, MarketingAsset, Project, Message } from "../types";

const buildSystemInstruction = (dna: BusinessDNA) => `
You are Consult AI, the Elite Strategic Intelligence Engine for ${dna.companyName}.
Your responses are personalized based on the following BUSINESS DNA:
- Industry: ${dna.industry}
- Business Model: ${dna.businessModel}
- Target Customer: ${dna.customerSegment}
- Markets: ${dna.operatingMarkets.join(", ")}
- Strategic Goals: ${dna.strategicGoals.join(", ")}
- Growth Stage: ${dna.stage}
- Market Context: ${dna.enrichedData?.marketContext || 'Scanning...'}

RULES:
1. NEVER be chatty. Use an executive, high-stakes tone.
2. Structure output: CONTEXT -> INSIGHT -> RECOMMENDATION -> RISK.
3. Every suggestion must leverage the specific industry and market context.
4. If asked about rivals, refer to: ${dna.manualCompetitors.join(", ")}.
`;

export const scanAndEnrichDNA = async (dna: BusinessDNA): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform a high-stakes institutional audit of the website: ${dna.website}. 
  Search the web specifically for "${dna.companyName}" to gather precise data points.
  Identify: 
  1. Primary Industry (e.g., Fintech, Healthcare).
  2. Business Model (SaaS, Services, Ecommerce, Marketplace, Manufacturing).
  3. Primary Customer Type (B2B, B2C, Hybrid, B2G).
  4. Top 3-5 Competitors/Rivals found on the web.
  5. Likely Growth Stage (Early, Scaling, Mature).
  6. Strategic Context summary (1-2 sentences).
  7. Verified Social Media Handles (LinkedIn URL, Twitter/X handle, Instagram handle).
  
  Return strictly valid JSON: 
  { 
    "industry": "string",
    "businessModel": "string",
    "customerSegment": "string",
    "rivals": ["string"],
    "stage": "string",
    "marketContext": "string",
    "competitorIntel": "string",
    "socialLinks": {
      "linkedin": "string",
      "twitter": "string",
      "instagram": "string"
    }
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const fetchRealTimeIntelligence = async (user: User, type: 'competitors' | 'market' | 'alerts' | 'overview' | 'social') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptMap = {
    competitors: `Analyze active movements and strengths/weaknesses of rivals for ${user.companyName}. Return JSON: { competitors: [{name, url, location, latitude, longitude, swot: {strengths, weaknesses, opportunities, threats}}] }`,
    market: `Analyze regional demand and market dynamics for ${user.companyName}. Return JSON: { matrix: [{x, y, z, sentiment}], porters: [{factor, score}], geoDemand: [{lat, lng, title}] }`,
    social: `Analyze brand authority and social sentiment for ${user.companyName} and its rivals: ${user.dna.manualCompetitors.join(', ')}. 
    Return JSON: { 
      brand: { sentiment: {score, label}, analysis: {strengths:[], weaknesses:[], threats:[], strikeZones:[]} },
      competitors: [{ name, sentiment: {score, label}, analysis: {strengths:[], weaknesses:[], threats:[], strikeZones:[]} }],
      trends: [{m, v}] 
    }`,
    alerts: `Detect high-priority market anomalies or competitor threats for ${user.companyName}. Return JSON: { alerts: [{title, desc, category, strategicMove, time}] }`,
    overview: `Provide a high-level system state summary for ${user.companyName}.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: promptMap[type] || promptMap.overview,
    config: { 
      systemInstruction: buildSystemInstruction(user.dna),
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: "Synthesize a comprehensive Board Briefing covering market trajectory, competitor encroachment, and tactical recommendations.",
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
    summary: "High-stakes synthesis of current market signals and institutional direction.",
    content: response.text || "Report generation failed."
  };
};

export const generateMarketingCampaign = async (user: User, prompt: string, includeVisuals: boolean): Promise<MarketingAsset[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const campaignRes = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a market-ready campaign asset for: ${prompt}. Return JSON array of ONE asset: [{channel, title, content, tags, visualPrompt}]`,
    config: { 
      systemInstruction: buildSystemInstruction(user.dna),
      responseMimeType: "application/json" 
    }
  });

  const assets: any[] = JSON.parse(campaignRes.text || "[]");
  
  if (includeVisuals && assets[0]) {
    const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imgRes = await freshAi.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: `High-end, premium consulting aesthetic corporate marketing visual for ${user.companyName} (Industry: ${user.dna.industry}): ${assets[0].visualPrompt}. Clean, modern, professional.` }],
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });
    
    for (const part of imgRes.candidates[0].content.parts) {
      if (part.inlineData) {
        assets[0].imageData = `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  return assets.map(a => ({
    ...a,
    id: Date.now().toString(),
    timestamp: new Date().toLocaleDateString()
  }));
};

export const generateMarketingVideo = async (user: User, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<MarketingAsset> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A high-end cinematic corporate branding video for ${user.companyName} (${user.dna.industry}): ${prompt}. Ultra-clean, professional, premium motion graphics.`,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    operation = await freshAi.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;

  return {
    id: Date.now().toString(),
    channel: 'Social Video',
    title: 'Tactical Motion Asset',
    content: prompt,
    videoUrl: videoUrl,
    timestamp: new Date().toLocaleDateString(),
    tags: ['Motion', 'Premium', 'Cinematic'],
    aspectRatio: aspectRatio
  };
};

export const getExecutiveConsultation = async (user: User, query: string, history: any[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction: buildSystemInstruction(user.dna),
      thinkingConfig: { thinkingBudget: 15000 },
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
};

export const generateChatResponse = async (history: Message[], currentMessage: string, user: User, project?: Project) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents = history.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const systemInstruction = buildSystemInstruction(user.dna) + 
    (project ? `\n\nCURRENT PROJECT FOCUS: ${project.name}\nObjective: ${project.objective}\nDescription: ${project.description}` : '');

  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }]
    }
  });
};
