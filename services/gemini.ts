
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, User, StrategicReport, MarketingAsset, Project } from "../types";

// This flag allows us to gracefully disable tools if the deployment environment rejects them
let isSearchToolDisabled = false;

/**
 * Strictly adheres to @google/genai initialization guidelines.
 * Uses process.env.API_KEY exclusively.
 */
const getClient = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("Strategic Engine Offline: API_KEY environment variable is missing in deployment.");
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Cleans and parses JSON from the model, handling grounding citations
 * and thinking blocks that often occur in production.
 */
const parseStrictJSON = (text: string) => {
  if (!text) return null;
  const cleanedText = text
    .replace(/\[\d+\]/g, '') // Remove grounding citations [1], [2], etc.
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '') // Remove thinking blocks
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    const jsonMatch = cleanedText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0].replace(/,\s*([\]}])/g, '$1'));
      } catch (innerE) {
        return null;
      }
    }
  }
  return null;
};

/**
 * Hardened wrapper for generateContent.
 * If a request fails due to tool restrictions (common in prod), it retries with internal reasoning.
 */
async function generateWithHardenedFallback(params: any) {
  const ai = getClient();
  const hasSearch = params.config?.tools?.some((t: any) => t.googleSearch);
  
  if (isSearchToolDisabled && hasSearch) {
    params.config = { ...params.config };
    params.config.tools = params.config.tools.filter((t: any) => !t.googleSearch);
    if (params.config.tools.length === 0) delete params.config.tools;
  }

  try {
    const response = await ai.models.generateContent(params);
    return response;
  } catch (error: any) {
    const errStr = (error?.message || JSON.stringify(error)).toLowerCase();
    
    // Check for region/quota/environment specific tool failures
    if (errStr.includes("not found") || errStr.includes("500") || errStr.includes("429") || errStr.includes("xhr")) {
      console.warn("Deployment Alert: Grounding tool failed. Switching to internal reasoning protocol.");
      if (hasSearch) isSearchToolDisabled = true;

      const fallbackParams = { ...params };
      if (fallbackParams.config?.tools) {
        fallbackParams.config.tools = fallbackParams.config.tools.filter((t: any) => !t.googleSearch);
        if (fallbackParams.config.tools.length === 0) delete fallbackParams.config.tools;
      }
      
      const aiFallback = getClient();
      return await aiFallback.models.generateContent(fallbackParams);
    }
    throw error;
  }
}

const buildExecutiveContext = (user: User, project?: Project) => {
  return `
    ROLE: Chief Strategic Advisor for ${user.companyName} (${user.industry}).
    DNA: ${user.dna.businessModel} model, Market Scope: ${user.dna.marketScope}.
    MISSION: Provide executive-level data-driven intelligence.
    TONE: Premium, precise, and authoritative.
    PROJECT: ${project ? `Mandate: ${project.name}. Goal: ${project.goal}` : 'General Oversight'}.
  `;
};

export const fetchRealTimeIntelligence = async (user: User, type: string) => {
  const context = buildExecutiveContext(user);
  let prompt = '';
  let responseSchema: any = null;

  switch (type) {
    case 'overview':
      prompt = `${context}\nProvide high-level command status. Return JSON.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          realityBar: { 
            type: Type.OBJECT, 
            properties: { 
              score: { type: Type.NUMBER }, 
              insight: { type: Type.STRING }, 
              confidence: { type: Type.STRING } 
            }, 
            required: ['score', 'insight', 'confidence'] 
          },
          momentum: { 
            type: Type.ARRAY, 
            items: { type: Type.OBJECT, properties: { m: { type: Type.STRING }, v: { type: Type.NUMBER } } } 
          },
          alerts: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                category: { type: Type.STRING }, 
                title: { type: Type.STRING }, 
                desc: { type: Type.STRING }, 
                strategicMove: { type: Type.STRING } 
              } 
            } 
          }
        }
      };
      break;
    case 'competitors':
      prompt = `${context}\nIdentify 3 rivals with their WEBSITE URL and location. Return JSON.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING }, 
                url: { type: Type.STRING }, 
                location: { type: Type.STRING }, 
                latitude: { type: Type.STRING }, 
                longitude: { type: Type.STRING },
                swot: { 
                  type: Type.OBJECT, 
                  properties: { 
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                  } 
                }
              }
            }
          }
        }
      };
      break;
    default:
      prompt = `${context}\nGenerate market data for ${type}. Return JSON.`;
  }

  const res = await generateWithHardenedFallback({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json", 
      responseSchema, 
      tools: isSearchToolDisabled ? [] : [{ googleSearch: {} }] 
    }
  });
  return parseStrictJSON(res.text) || {};
};

export const generateChatResponse = async function* (history: Message[], currentMessage: string, user: User, project?: Project) {
  const context = buildExecutiveContext(user, project);
  const ai = getClient();
  
  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: history.slice(-10).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
    config: { 
      systemInstruction: context, 
      thinkingConfig: { thinkingBudget: 12000 } 
    }
  });
  
  for await (const chunk of stream) {
    yield { text: chunk.text };
  }
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const res = await generateWithHardenedFallback({
    model: 'gemini-3-pro-preview',
    contents: `Draft a Board Manifesto for ${user.companyName}. Return JSON {title, summary, content}.`,
    config: { 
      responseMimeType: "application/json", 
      thinkingConfig: { thinkingBudget: 16000 } 
    }
  });
  const raw = parseStrictJSON(res.text) || {};
  return {
    id: `rep-${Date.now()}`,
    title: raw.title || "Strategic Briefing",
    date: new Date().toLocaleDateString(),
    type: 'Opportunity',
    impactLevel: 'High',
    summary: raw.summary || "Synthesizing mandate...",
    content: raw.content || "Full report content unavailable.",
    companiesInvolved: []
  };
};

export const generateMarketingCampaign = async (user: User, userPrompt: string): Promise<MarketingAsset[]> => {
  const isVisual = /image|picture|photo|banner/i.test(userPrompt);

  if (isVisual) {
    const res = await generateWithHardenedFallback({
      model: 'gemini-2.5-flash-image',
      contents: `High-end commercial visual for ${user.companyName}. Concept: ${userPrompt}.`,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    let base64 = '';
    for (const part of res.candidates[0].content.parts) {
      if (part.inlineData) base64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }

    return [{
      id: `img-${Date.now()}`,
      channel: 'Ad',
      title: 'Visual Prototype',
      content: 'Vision Protocol synthesized asset.',
      isImage: true,
      imageData: base64,
      tags: ['Visual', 'Strategic'],
      status: 'Ready',
      timestamp: new Date().toISOString()
    }];
  }

  const res = await generateWithHardenedFallback({
    model: 'gemini-3-flash-preview',
    contents: `${buildExecutiveContext(user)}\nDraft assets for: "${userPrompt}". Return JSON array.`,
    config: { responseMimeType: "application/json" }
  });
  const assets = parseStrictJSON(res.text) || [];
  return assets.map((a: any) => ({
    ...a,
    id: `ma-${Date.now()}-${Math.random()}`,
    status: 'Ready',
    timestamp: new Date().toISOString()
  }));
};

export const analyzeBusinessWebsite = async (url: string) => {
  const prompt = `Conduct institutional audit of ${url}. Respond ONLY with JSON: {companyName, industry, businessModel, summary, competitiveIntensity}.`;
  try {
    const res = await generateWithHardenedFallback({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        tools: isSearchToolDisabled ? [] : [{ googleSearch: {} }]
      }
    });
    return parseStrictJSON(res.text);
  } catch (e) {
    return null;
  }
};
