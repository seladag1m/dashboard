
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, User, StrategicReport, MarketingAsset, Project } from "../types";

let isSearchToolDisabled = false;

const getClient = () => {
  const key = process.env.API_KEY; 
  if (!key) throw new Error("Strategic Engine Offline: API_KEY is missing. Add API_KEY to Vercel Environment Variables.");
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Clean and parse model output for production reliability.
 */
const parseStrictJSON = (text: string) => {
  if (!text) return null;
  const cleanedText = text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    const jsonMatch = cleanedText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        const cleaned = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(cleaned);
      } catch (innerE) {
        return null;
      }
    }
  }
  return null;
};

/**
 * Core generation wrapper with "Search Grounding" fallback.
 */
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
    // Handle quota or service errors by retrying without tools
    if ((errStr.includes("429") || errStr.includes("500") || errStr.includes("quota") || errStr.includes("not found")) && hasTools) {
      isSearchToolDisabled = true;
      const fallbackParams = { ...params };
      if (fallbackParams.config?.tools) {
        fallbackParams.config.tools = fallbackParams.config.tools.filter((t: any) => !t.googleSearch);
        if (fallbackParams.config.tools.length === 0) delete fallbackParams.config.tools;
      }
      return await ai.models.generateContent(fallbackParams);
    }
    throw error;
  }
}

/**
 * Builds the Contextual Prompt based on User DNA.
 */
const buildExecutiveContext = (user: User, project?: Project) => {
  const dna = user.dna;
  return `
    ADVISORY ROLE: You are the Chief Strategic Advisor for ${user.companyName}.
    
    BUSINESS DNA:
    - Sector: ${user.industry} (${dna.subIndustry || 'General'})
    - Model: ${dna.businessModel} targeting ${dna.targetCustomer}
    - Scope: ${dna.marketScope} reach with focus on ${dna.growthRegions.join(', ')}
    - Mandates: ${dna.strategicPriorities.join(', ')}
    - Primary Objective: ${dna.primaryGoal}
    
    ${project ? `PROJECT CONTEXT:
    - Name: ${project.name}
    - Initiative Goal: ${project.goal}
    - Current Focus: ${project.description}` : ''}
    
    PROTOCOL:
    1. Never provide generic advice. 
    2. Reference specific industry trends.
    3. Be executive-level, precise, and data-driven.
    4. If generating assets, align with Tone: ${dna.brandIdentity.tone} and Vibe: ${dna.brandIdentity.vibe}.
  `;
};

export const fetchRealTimeIntelligence = async (user: User, type: string) => {
  const ai = getClient();
  const context = buildExecutiveContext(user);
  
  let prompt = '';
  let responseSchema: any = null;

  switch (type) {
    case 'overview':
      prompt = `${context}\nProvide a high-level reality check on the current business state. Return scores and momentum points based on global market signals.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          realityBar: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, insight: { type: Type.STRING }, confidence: { type: Type.STRING } }, required: ['score', 'insight', 'confidence'] },
          momentum: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { m: { type: Type.STRING }, v: { type: Type.NUMBER } }, required: ['m', 'v'] } },
          context: { type: Type.OBJECT, properties: { activeProject: { type: Type.STRING }, latestReport: { type: Type.STRING }, pulse: { type: Type.STRING }, recentGen: { type: Type.STRING } }, required: ['activeProject', 'latestReport', 'pulse', 'recentGen'] },
          alerts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, title: { type: Type.STRING }, time: { type: Type.STRING }, desc: { type: Type.STRING }, strategicMove: { type: Type.STRING } }, required: ['category', 'title', 'time', 'desc', 'strategicMove'] } }
        },
        required: ['realityBar', 'momentum', 'context', 'alerts']
      };
      break;
    case 'competitors':
      prompt = `${context}\nIdentify 3 real-world competitors for this business. Provide their HQ location and SWOT analysis.`;
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
              required: ['name', 'location', 'swot']
            }
          }
        }
      };
      break;
    case 'market':
      prompt = `${context}\nProvide market dynamics data. Identify momentum, penetration and sentiment for 5 market sectors.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          matrix: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                z: { type: Type.NUMBER },
                sentiment: { type: Type.NUMBER }
              },
              required: ['name', 'x', 'y', 'z', 'sentiment']
            }
          }
        },
        required: ['matrix']
      };
      break;
    case 'alerts':
      prompt = `${context}\nIdentify 3 critical market signals or competitive alerts.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          alerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                time: { type: Type.STRING },
                desc: { type: Type.STRING },
                strategicMove: { type: Type.STRING }
              },
              required: ['category', 'title', 'time', 'desc', 'strategicMove']
            }
          }
        },
        required: ['alerts']
      };
      break;
    case 'social':
      prompt = `${context}\nAnalyze social sentiment and growth trends for the brand.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          sentiment: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              label: { type: Type.STRING }
            },
            required: ['score', 'label']
          },
          trends: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                m: { type: Type.STRING },
                v: { type: Type.NUMBER }
              },
              required: ['m', 'v']
            }
          }
        },
        required: ['sentiment', 'trends']
      };
      break;
    default:
      prompt = `${context}\nGenerate strategic insights.`;
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

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const ai = getClient();
  const context = buildExecutiveContext(user);
  const res = await generateWithHardenedFallback(ai, {
    model: 'gemini-3-pro-preview',
    contents: `${context}\nDraft a comprehensive, board-ready strategic report addressing the primary goal. Use deep reasoning. Return JSON: {title, summary, content (markdown)}`,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 24000 }
    }
  });
  const raw = parseStrictJSON(res.text) || {};
  return {
    id: `rep-${Date.now()}`,
    title: raw.title || "Strategic Briefing",
    date: new Date().toLocaleDateString(),
    type: 'Opportunity',
    impactLevel: 'High',
    summary: raw.summary || "Synthesizing market signals...",
    content: raw.content || "Strategic content unavailable.",
    companiesInvolved: []
  };
};

export const generateMarketingCampaign = async (user: User, userPrompt: string): Promise<MarketingAsset[]> => {
  const ai = getClient();
  const context = buildExecutiveContext(user);
  const res = await generateWithHardenedFallback(ai, {
    model: 'gemini-3-flash-preview',
    contents: `${context}\nUSER REQUEST: "${userPrompt}"\nGenerate 3 distinct marketing assets (e.g., Email, LinkedIn Post, Ad Copy). Return as JSON array of assets.`,
    config: { responseMimeType: "application/json" }
  });
  const assets = parseStrictJSON(res.text) || [];
  return assets.map((a: any) => ({
    id: `ma-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    channel: a.channel || 'LinkedIn',
    title: a.title || 'Campaign Asset',
    content: a.content || 'Content generation failed.',
    tags: a.tags || ['Campaign'],
    status: 'Ready',
    timestamp: new Date().toISOString()
  }));
};

export const generateChatResponse = async function* (history: Message[], currentMessage: string, user: User, project?: Project) {
  const ai = getClient();
  const context = buildExecutiveContext(user, project);
  
  const contents = history.slice(-8).map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const config: any = { 
    systemInstruction: context,
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
    yield { text: "Strategic processing interrupted. Re-establishing connection..." };
  }
};

export const analyzeBusinessWebsite = async (url: string) => {
  const ai = getClient();
  const res = await generateWithHardenedFallback(ai, {
    model: 'gemini-3-pro-preview',
    contents: `Examine the firm at ${url}. Extract strategic DNA. Return only valid JSON.`,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companyName: { type: Type.STRING },
          industry: { type: Type.STRING, description: 'One of: Technology, Financial Services, Healthcare, Retail, Manufacturing, Consulting, Energy' },
          subIndustry: { type: Type.STRING },
          businessModel: { type: Type.STRING, description: 'One of: SaaS, Services, Ecommerce, Marketplace, Manufacturing' },
          customerType: { type: Type.STRING, description: 'One of: B2B, B2C, Hybrid' },
          marketScope: { type: Type.STRING, description: 'One of: Global, Regional, Local' },
          growthRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING, description: 'A one-sentence institutional mission summary' },
          primaryGoal: { type: Type.STRING },
          competitiveIntensity: { type: Type.STRING, description: 'Low, Medium, or High' },
          pricingModel: { type: Type.STRING }
        },
        required: ['companyName', 'industry', 'businessModel', 'summary']
      }
    }
  });
  return parseStrictJSON(res.text) || {};
};
