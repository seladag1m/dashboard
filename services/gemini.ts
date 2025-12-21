
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, User, StrategicReport, MarketingAsset, Project } from "../types";

let isSearchToolDisabled = false;

const getClient = () => {
  const key = process.env.API_KEY; 
  if (!key) throw new Error("API_KEY is missing. Ensure it is set in the environment.");
  return new GoogleGenAI({ apiKey: key });
};

const parseStrictJSON = (text: string) => {
  if (!text) return null;
  // Strip potential "thinking" or markdown noise
  const cleanedText = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    const jsonMatch = cleanedText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        const cleaned = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(cleaned);
      } catch (innerE) {
        console.error("JSON recovery failed:", innerE);
      }
    }
  }
  return null;
};

async function generateWithHardenedFallback(ai: any, params: any) {
  const hasTools = !!(params.config?.tools && params.config.tools.length > 0);
  
  if (isSearchToolDisabled && hasTools) {
    params.config = { ...params.config };
    params.config.tools = params.config.tools.filter((t: any) => !t.googleSearch);
    if (params.config.tools.length === 0) delete params.config.tools;
  }

  try {
    const response = await ai.models.generateContent(params);
    if (!response.text) throw new Error("Empty response from Strategic Engine.");
    return response;
  } catch (error: any) {
    const errStr = JSON.stringify(error).toLowerCase();
    const isQuota = errStr.includes("429") || errStr.includes("quota");
    const isRpc = errStr.includes("500") || errStr.includes("rpc") || errStr.includes("xhr") || errStr.includes("unknown");

    if ((isQuota || isRpc) && hasTools) {
      console.warn("Infrastructure failure. Retrying with baseline reasoning...");
      isSearchToolDisabled = true;
      const fallbackParams = { ...params };
      if (fallbackParams.config) {
        fallbackParams.config = { ...fallbackParams.config };
        if (fallbackParams.config.tools) {
          fallbackParams.config.tools = fallbackParams.config.tools.filter((t: any) => !t.googleSearch);
          if (fallbackParams.config.tools.length === 0) delete fallbackParams.config.tools;
        }
      }
      return await ai.models.generateContent(fallbackParams);
    }
    throw error;
  }
}

const getSystemInstruction = (user: User, project?: Project) => {
  const dna = user.dna;
  return `You are CONSULT AI, an elite institutional advisor for ${user.companyName}.
  STRATEGIC DNA:
  - Sector: ${user.industry} / ${dna.subIndustry || 'General'}
  - Model: ${dna.businessModel} (${dna.targetCustomer})
  - Market: ${dna.marketScope}
  - Core Mandates: ${dna.strategicPriorities.join(', ')}
  - Primary Goal: ${dna.primaryGoal}
  
  ${project ? `CURRENT MANDATE (PROJECT):
  - Name: ${project.name}
  - Goal: ${project.goal}
  - Description: ${project.description}` : 'GENERAL ADVISORY MODE'}

  ADVISORY PROTOCOL: Be precise, contrarian where necessary, and executive-level. Use Markdown for reports.
  ARTIFACT PROTOCOL: Use "ARTIFACT:" followed by a valid JSON object for charts/frameworks.`;
};

export const fetchRealTimeIntelligence = async (user: User, type: string, options?: any) => {
  const ai = getClient();
  let prompt = '';
  let responseSchema: any = null;

  switch (type) {
    case 'overview':
      prompt = `Strategic overview for ${user.companyName} in ${user.industry}. Return scores and active pulse metrics.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          realityBar: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, insight: { type: Type.STRING }, confidence: { type: Type.STRING } }, required: ['score', 'insight', 'confidence'] },
          momentum: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { m: { type: Type.STRING }, v: { type: Type.NUMBER } }, required: ['m', 'v'] } },
          context: { type: Type.OBJECT, properties: { activeProject: { type: Type.STRING }, latestReport: { type: Type.STRING }, pulse: { type: Type.STRING }, recentGen: { type: Type.STRING } }, required: ['activeProject', 'latestReport', 'pulse', 'recentGen'] },
          alerts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, title: { type: Type.STRING }, time: { type: Type.STRING } }, required: ['category', 'title', 'time'] } }
        },
        required: ['realityBar', 'momentum', 'context', 'alerts']
      };
      break;
    case 'competitors':
      prompt = `Identify 3 competitors for ${user.companyName}. Provide HQ city, lat/lng, and SWOT.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING }, url: { type: Type.STRING }, location: { type: Type.STRING }, share: { type: Type.STRING }, latitude: { type: Type.STRING }, longitude: { type: Type.STRING },
                swot: { type: Type.OBJECT, properties: { strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }, threats: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['strengths', 'weaknesses', 'opportunities', 'threats'] },
                radarData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, A: { type: Type.NUMBER }, B: { type: Type.NUMBER }, fullMark: { type: Type.NUMBER } }, required: ['subject', 'A', 'B', 'fullMark'] } }
              },
              required: ['name', 'url', 'location', 'share', 'latitude', 'longitude', 'swot', 'radarData']
            }
          }
        },
        required: ['competitors']
      };
      break;
    default:
      prompt = `Analyze ${user.companyName}.`;
  }

  const config: any = { responseMimeType: "application/json", responseSchema };
  if (!isSearchToolDisabled) config.tools = [{ googleSearch: {} }];

  const res = await generateWithHardenedFallback(ai, {
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config
  });
  return parseStrictJSON(res.text) || {};
};

export const generateChatResponse = async function* (history: Message[], currentMessage: string, user: User, project?: Project) {
  const ai = getClient();
  const contents = history.slice(-10).map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const config: any = { 
    systemInstruction: getSystemInstruction(user, project),
    thinkingConfig: { thinkingBudget: 16000 }
  };
  if (!isSearchToolDisabled) config.tools = [{ googleSearch: {} }];

  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents,
      config
    });
    for await (const chunk of stream) yield { text: chunk.text };
  } catch (e) {
    console.error("Stream failed:", e);
    yield { text: "Protocol interrupted. Retrying..." };
  }
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const ai = getClient();
  const res = await generateWithHardenedFallback(ai, {
    model: 'gemini-3-pro-preview',
    contents: `Generate a board-ready strategic manifesto for ${user.companyName}. Goal: ${user.dna.primaryGoal}. Return as JSON with title, summary, and long markdown content.`,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 24000 }
    }
  });
  const raw = parseStrictJSON(res.text) || {};
  return {
    id: Date.now().toString(),
    title: raw.title || "Strategic Briefing",
    date: new Date().toLocaleDateString(),
    type: 'Opportunity',
    impactLevel: 'High',
    summary: raw.summary || "Synthesizing market signals...",
    content: raw.content || "Content generation failed.",
    companiesInvolved: []
  };
};

export const generateMarketingCampaign = async (user: User, prompt: string): Promise<MarketingAsset[]> => {
  const ai = getClient();
  const res = await generateWithHardenedFallback(ai, {
    model: 'gemini-3-flash-preview',
    contents: `Draft 3 marketing assets for ${user.companyName} (${user.industry}) based on this request: "${prompt}". Return as JSON array of assets.`,
    config: {
      responseMimeType: "application/json"
    }
  });
  const assets = parseStrictJSON(res.text) || [];
  return assets.map((a: any) => ({
    id: a.id || `ma-${Date.now()}-${Math.random()}`,
    channel: a.channel || 'Email',
    title: a.title || 'Asset Title',
    content: a.content || 'Content...',
    tags: a.tags || [],
    status: 'Ready',
    timestamp: new Date().toISOString()
  }));
};

export const analyzeBusinessWebsite = async (url: string) => {
  const ai = getClient();
  const res = await generateWithHardenedFallback(ai, {
    model: 'gemini-3-flash-preview',
    contents: `Extract strategic DNA from website ${url}.`,
    config: { responseMimeType: "application/json" }
  });
  return parseStrictJSON(res.text) || {};
};

export const generateMarketingImage = async (prompt: string) => {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `Elite consulting visual for: ${prompt}`,
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};
