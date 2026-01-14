
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { User, BusinessDNA, StrategicReport, MarketingAsset, Project, Message, ProjectFile } from "../types";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

const buildSystemInstruction = (dna: BusinessDNA) => `
You are Consult AI, the Elite Strategic Intelligence Engine for ${dna.companyName}.
Your mandate: Provide board-level strategic advisory based on the following BUSINESS DNA:
- Industry: ${dna.industry}
- Target Customer: ${dna.customerSegment}
- Growth Stage: ${dna.stage}
- Rivals: ${dna.manualCompetitors?.join(", ") || 'Sector incumbents'}
- Tone: ${dna.toneOfVoice || 'Executive & Precise'}

MODUS OPERANDI:
- Monitor high-stakes anomalies: Competitor moves, Keyword spikes, Market shifts, Demand changes, Existential risks, and Alpha opportunities.
- For MARKETING: Generate high-fidelity, brand-matched assets: Social Posts, Email Sequences, Landing Page Copy, Ads, Content Calendars, and Full Campaigns.
- BRAND-MATCHING: Every output must strictly reflect ${dna.companyName}'s value proposition, tone, and customer persona.
- AI Action: Always conclude an anomaly alert with a "Recommended Strategic Move".
- Style: Premium, institutional, high-stakes, data-driven.
`;

const extractJSON = (text: string): any => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        let jsonStr = match[0].replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(jsonStr);
      }
    } catch (e2) {
      console.error("JSON Extraction failed", text);
    }
  }
  return null;
};

export const fetchRealTimeIntelligence = async (user: User, type: 'competitors' | 'market' | 'alerts' | 'overview' | 'social') => {
  const ai = getAI();
  const promptMap = {
    competitors: `Audit top rivals for ${user.companyName}. Formulate a "Suggested Strategic Move" for each. Return JSON: { 
      "competitors": [{
        "name": "string", "hqLocation": "string", "latitude": number, "longitude": number, "recentMove": "string",
        "analysis": { "strengths": ["string"], "weaknesses": ["string"], "opportunities": ["string"], "strikeZone": "string", "suggestedStrategicMove": "string", "threatLevel": "High" | "Medium" | "Low" }
      }] 
    }`,
    market: `Market Matrix Audit for ${user.companyName}. Return JSON: { 
      "matrix": [{ "x": number, "y": number, "z": number, "sentiment": number, "label": "string" }], 
      "porters": [{ "factor": "string", "score": number, "analysis": "string" }], 
      "vectors": [{ "title": "string", "description": "string", "impact": "High" | "Medium" | "Low", "trend": "Rising" | "Falling" | "Stable" }],
      "bottomLine": "string"
    }`,
    social: `Benchmarking for ${user.companyName} vs Rivals. Use Social Blade-style indices. Return JSON: { 
      "userStatus": [{ "platform": "string", "status": "string", "winningTheme": "string", "suggestion": "string" }],
      "benchmarking": [{ "entity": "string", "engagement": number, "growth": number, "sentiment": number }],
      "narrativeSummary": "string"
    }`,
    alerts: `ACTIVE MONITORING for ${user.companyName}. SCAN FOR: 
    1. Competitor moves (Alert)
    2. Market trend shifts (Alert)
    3. Keyword spikes (Alert)
    4. Product demand changes (Alert)
    5. AI-detected danger/threats (Alert)
    6. AI-detected opportunities (Alert)
    
    Return JSON: { 
      "alerts": [{ 
        "title": "string", 
        "desc": "string", 
        "category": "Competitor Move" | "Trend Shift" | "Keyword Spike" | "Demand Change" | "Threat" | "Opportunity", 
        "strategicMove": "string (Actionable recommended move)", 
        "priority": "High" | "Medium" | "Critical",
        "time": "HH:MM:SS"
      }] 
    }`,
    overview: `System state summary. JSON: { overview: "string", keyMetrics: [{label, value, trend}] }`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: promptMap[type] || promptMap.overview }] }],
    config: { 
      systemInstruction: buildSystemInstruction(user.dna),
      tools: [{ googleSearch: {} }]
    }
  });
  return extractJSON(response.text || "") || {};
};

export const generateMarketingCampaign = async (user: User, prompt: string, type: string): Promise<MarketingAsset[]> => {
  const ai = getAI();
  const campaignRes = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Act as a Head of Growth for ${user.companyName}.
    TASK: Generate a high-fidelity ${type} mandate.
    MANDATE TYPES: 
    - Full Campaign: Integrated strategy.
    - Social Posts: Platform optimized copy (LinkedIn, Twitter).
    - Email Sequence: 3+ sequenced emails.
    - Landing Page Copy: Authority-driven layout copy.
    - Ads: Multi-platform high-conversion headlines & body.
    - Content Calendar: 7-day roadmap.
    
    FOCUS: ${prompt}.
    MANDATORY BRAND-MATCH: Colors, Tone (${user.dna.toneOfVoice}), Customer Persona (${user.dna.customerSegment}).
    
    Return JSON array: [{"channel": "Email" | "LinkedIn" | "Twitter" | "Instagram" | "Web", "title": "string", "content": "string", "tags": ["string"], "visualPrompt": "string"}]` }] }],
    config: { 
      systemInstruction: buildSystemInstruction(user.dna),
      responseMimeType: "application/json" 
    }
  });

  let assets: any[] = extractJSON(campaignRes.text || "") || [];
  
  if (assets.length > 0) {
    const visualPrompt = assets[0].visualPrompt || prompt;
    const imgRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: `Minimalist, premium institutional marketing visual for ${user.companyName}: ${visualPrompt}. High-end corporate photography style.` }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    
    for (const part of imgRes.candidates[0].content.parts) {
      if (part.inlineData) {
        assets[0].imageData = `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  return assets.map(a => ({
    ...a,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleDateString()
  }));
};

// ... remaining service methods unchanged ...
export const searchStockTicker = async (query: string): Promise<any[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Search stock ticker for: "${query}". JSON array: [{"symbol": "string", "name": "string", "exchange": "string"}]` }] }],
    config: { tools: [{ googleSearch: {} }] }
  });
  return extractJSON(response.text || "") || [];
};

export const fetchStockIntelligence = async (ticker: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Stock intel for ${ticker}. JSON: {"summary": "string", "sentiment": "Bullish" | "Bearish", "marketStatus": "Open", "signals": [], "history": []}` }] }],
    config: { tools: [{ googleSearch: {} }] }
  });
  return extractJSON(response.text || "") || {};
};

export const scanAndEnrichDNA = async (dna: Partial<BusinessDNA>): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Audit website: ${dna.website}. JSON DNA mapping.` }] }],
    config: { tools: [{ googleSearch: {} }] }
  });
  return extractJSON(response.text || "") || {};
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: "Synthesize Board Briefing." }] }],
    config: { systemInstruction: buildSystemInstruction(user.dna) }
  });
  return { id: Date.now().toString(), title: "Executive Mandate", date: new Date().toLocaleDateString(), summary: "Strategic synthesis.", content: response.text || "" };
};

export const getExecutiveConsultation = async (user: User, query: string, history: any[] = [], attachments: ProjectFile[] = []) => {
  const ai = getAI();
  const parts: any[] = attachments.map(f => ({ inlineData: { data: f.content, mimeType: f.mimeType } }));
  parts.push({ text: query });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })), { role: 'user', parts: parts }],
    config: { systemInstruction: buildSystemInstruction(user.dna) }
  });
  return response.text;
};

export const generateChatResponse = async (history: Message[], currentMessage: string, user: User, project?: Project) => {
  const ai = getAI();
  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
    config: { systemInstruction: buildSystemInstruction(user.dna) }
  });
};
