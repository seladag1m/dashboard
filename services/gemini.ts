
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, User, StrategicReport, MarketingAsset, Project } from "../types";

let isSearchToolDisabled = false;

// Helper to initialize the client strictly per guidelines
const getClient = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("Strategic Engine Offline: API_KEY is missing.");
  return new GoogleGenAI({ apiKey: key });
};

const parseStrictJSON = (text: string) => {
  if (!text) return null;
  // Strip grounding citations, thinking blocks, and markdown noise
  const cleanedText = text
    .replace(/\[\d+\]/g, '') 
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

async function generateWithHardenedFallback(params: any) {
  const ai = getClient();
  const hasTools = !!(params.config?.tools && params.config.tools.length > 0);
  
  if (isSearchToolDisabled && hasTools) {
    params.config = { ...params.config };
    params.config.tools = params.config.tools.filter((t: any) => !t.googleSearch);
    if (params.config.tools.length === 0) delete params.config.tools;
  }

  try {
    const response = await ai.models.generateContent(params);
    return response;
  } catch (error: any) {
    const errStr = (error?.message || JSON.stringify(error)).toLowerCase();
    
    // Specifically handle environment or tool-specific failures by falling back to core reasoning
    if (errStr.includes("xhr error") || errStr.includes("500") || errStr.includes("not found") || errStr.includes("429")) {
      console.warn("Strategic Engine: External grounding failure. Deploying internal reasoning protocols.");
      if (hasTools) isSearchToolDisabled = true;

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
  const dna = user.dna;
  return `
    ROLE: Chief Strategic Advisor & AI Intel Engine for ${user.companyName}.
    SECTOR: ${user.industry}. DNA: ${dna.businessModel}, Scope: ${dna.marketScope}.
    MISSION: Provide high-fidelity, premium strategic intelligence.
    BRAND TONE: Executive, precise, data-driven, and elite.
    PROJECT: ${project ? `Current Mandate: ${project.name}. Goal: ${project.goal}` : 'General Oversight'}.
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
            items: { 
              type: Type.OBJECT, 
              properties: { 
                m: { type: Type.STRING }, 
                v: { type: Type.NUMBER } 
              } 
            } 
          },
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
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                    threats: { type: Type.ARRAY, items: { type: Type.STRING } } 
                  } 
                }
              }
            }
          }
        }
      };
      break;
    case 'market':
      prompt = `${context}\nGenerate Porter's 5 Forces scores (0-100) and identify geo-demand intensity zones. Return JSON.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          porters: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                factor: { type: Type.STRING }, 
                score: { type: Type.NUMBER }, 
                insight: { type: Type.STRING } 
              } 
            } 
          },
          geoDemand: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                lat: { type: Type.NUMBER }, 
                lng: { type: Type.NUMBER }, 
                intensity: { type: Type.NUMBER }, 
                title: { type: Type.STRING } 
              } 
            } 
          },
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
              } 
            } 
          }
        }
      };
      break;
    case 'social':
      prompt = `${context}\nPerform Social Intelligence Audit comparing ${user.companyName} vs Rivals. Identify Strike Zones and Risk Vectors. Return JSON.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          sentiment: { 
            type: Type.OBJECT, 
            properties: { 
              score: { type: Type.NUMBER }, 
              label: { type: Type.STRING } 
            } 
          },
          trends: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                m: { type: Type.STRING }, 
                v: { type: Type.NUMBER } 
              } 
            } 
          },
          signals: {
            type: Type.OBJECT,
            properties: {
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
              strikeZones: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      };
      break;
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

export const generateMarketingCampaign = async (user: User, userPrompt: string): Promise<MarketingAsset[]> => {
  const isVisual = /image|picture|photo|banner|graphic|visual/i.test(userPrompt);

  if (isVisual) {
    const res = await generateWithHardenedFallback({
      model: 'gemini-2.5-flash-image',
      contents: `Generate a high-end commercial visual for ${user.companyName} (${user.industry}). Request: ${userPrompt}. Tone: ${user.dna.brandIdentity.tone}. Premium consulting aesthetic.`,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    let base64 = '';
    for (const part of res.candidates[0].content.parts) {
      if (part.inlineData) base64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }

    return [{
      id: `img-${Date.now()}`,
      channel: 'Ad',
      title: 'Strategic Visual Prototype',
      content: 'Synthesized via Vision Protocol for board review.',
      isImage: true,
      imageData: base64,
      tags: ['Visual', 'Deployment', 'Premium'],
      status: 'Ready',
      timestamp: new Date().toISOString()
    }];
  }

  const res = await generateWithHardenedFallback({
    model: 'gemini-3-flash-preview',
    contents: `${buildExecutiveContext(user)}\nDraft marketing assets for: "${userPrompt}". Return JSON array.`,
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
  const prompt = `Conduct a real-time crawl of ${url} using Google Search. Extract institutional data.
  Respond ONLY with a JSON object in this format:
  {
    "companyName": "String",
    "industry": "One of: Technology, Financial Services, Healthcare, Retail, Manufacturing, Consulting, Logistics",
    "businessModel": "One of: SaaS, Services, Ecommerce, Marketplace, Hybrid",
    "summary": "One sentence summary",
    "competitiveIntensity": "Low, Medium, or High",
    "socials": {
      "linkedin": "Full LinkedIn company URL",
      "twitter": "Full Twitter/X URL",
      "instagram": "Full Instagram URL"
    }
  }`;

  try {
    const res = await generateWithHardenedFallback({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        tools: isSearchToolDisabled ? [] : [{ googleSearch: {} }]
      }
    });
    const parsed = parseStrictJSON(res.text);
    if (!parsed || !parsed.companyName) throw new Error("Incomplete extraction");
    return parsed;
  } catch (e) {
    console.error("Website Analysis failed", e);
    return null;
  }
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const res = await generateWithHardenedFallback({
    model: 'gemini-3-pro-preview',
    contents: `Board Manifesto for ${user.companyName}. Sector: ${user.industry}. Return JSON {title, summary, content}.`,
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
    content: raw.content || "Report content not generated.",
    companiesInvolved: []
  };
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
