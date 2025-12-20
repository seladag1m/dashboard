
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, User, StrategicReport, MarketingAsset, Project } from "../types";

// Session-level flag to avoid repeated 429 errors from Search Grounding
let isSearchToolDisabled = false;

const getClient = () => {
  const key = process.env.API_KEY; 
  if (!key) throw new Error("API_KEY is missing");
  return new GoogleGenAI({ apiKey: key });
};

const parseJSON = (text: string) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        const cleaned = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(cleaned);
      } catch (innerE) {
        console.error("JSON extraction parse failed:", innerE);
      }
    }
  }
  return null;
};

/**
 * Robust wrapper to handle Google Search quota exhaustion (Error 429).
 * Detects quota limits and disables the tool for the remainder of the session.
 */
async function generateWithFallback(ai: any, params: any) {
  // If search is already known to be exhausted, remove it from params before trying
  const hasTools = !!(params.config?.tools && params.config.tools.length > 0);
  
  if (isSearchToolDisabled && hasTools) {
    params.config = { ...params.config };
    params.config.tools = params.config.tools.filter((t: any) => !t.googleSearch);
    if (params.config.tools.length === 0) delete params.config.tools;
  }

  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const errStr = JSON.stringify(error);
    const isQuotaError = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED");
    
    // Fallback if quota is hit AND tools were present
    if (isQuotaError && hasTools) {
      console.warn("Search Grounding or Tool quota exceeded. Disabling search for this session and falling back.");
      isSearchToolDisabled = true;
      
      const fallbackParams = { ...params };
      if (fallbackParams.config) {
        fallbackParams.config = { ...fallbackParams.config };
        if (fallbackParams.config.tools) {
          fallbackParams.config.tools = fallbackParams.config.tools.filter((t: any) => !t.googleSearch);
          if (fallbackParams.config.tools.length === 0) delete fallbackParams.config.tools;
        }
      }
      // Retry without tools
      return await ai.models.generateContent(fallbackParams);
    }
    throw error;
  }
}

const getSystemInstruction = (user: User, project?: Project) => {
  const dna = user.dna;
  const priorities = dna.strategicPriorities.join(', ');
  
  const depthInstruction = dna.confidenceLevel === 'Low' 
    ? "Provide EXTREME detail and foundational logic. Explain every strategic choice from first principles."
    : dna.confidenceLevel === 'Medium'
    ? "Provide balanced strategic synthesis. Offer high-level direction with supporting tactical detail."
    : "Provide elite, ultra-concise executive synthesis. Focus on high-stakes leverage points and immediate strike zones. Challenge existing assumptions with contrarian logic.";

  return `You are CONSULT AI, an elite strategic advisor for ${user.companyName}.
  
  STRICT CONTEXT (BUSINESS DNA):
  - Company: ${user.companyName}
  - Sector: ${user.industry} / ${dna.subIndustry || 'General'}
  - Business Model: ${dna.businessModel} (${dna.targetCustomer})
  - Market Footprint: ${dna.marketScope} (${dna.growthRegions.join(', ')})
  - Core Mandates: ${priorities}
  - Primary Objective: ${dna.primaryGoal}
  - Competitive Intensity: ${dna.competitiveIntensity}
  - Exec Confidence Level: ${dna.confidenceLevel}
  
  ADVISORY PROTOCOLS:
  1. DNA ALIGNMENT: Every insight must be filtered through the client's DNA.
  2. DEPTH CALIBRATION: ${depthInstruction}
  3. GROUNDING: Use Search if available. Otherwise, use high-fidelity sector proxies and neural knowledge.
  4. TONALITY: Precise, executive, and forward-looking.
  
  ARTIFACT PROTOCOL:
  Use exactly "ARTIFACT:" followed by JSON for charts/frameworks.`;
};

export const fetchRealTimeIntelligence = async (user: User, type: string, options?: any) => {
  const ai = getClient();
  const dna = user.dna;
  let prompt = '';
  let responseSchema: any = null;

  switch (type) {
    case 'overview':
      prompt = `Analyze ${user.companyName} in the ${user.industry} sector. Provide realityBar, momentum, context and alerts.`;
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
      prompt = `Identify top 3-5 competitors for ${user.companyName}. Provide HQ lat/lng and SWOT/radar data.`;
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

    case 'market':
      prompt = `Audit ${user.industry} market. Include Porter's Five Forces and matrix data.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          bubbleData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, z: { type: Type.NUMBER }, sentiment: { type: Type.NUMBER } }, required: ['name', 'x', 'y', 'z', 'sentiment'] } },
          signals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, desc: { type: Type.STRING } }, required: ['title', 'desc'] } },
          fiveForces: { type: Type.OBJECT, properties: { threatOfNewEntrants: { type: Type.STRING }, bargainingPowerOfBuyers: { type: Type.STRING }, bargainingPowerOfSuppliers: { type: Type.STRING }, threatOfSubstituteProducts: { type: Type.STRING }, intensityOfCompetitiveRivalry: { type: Type.STRING } }, required: ['threatOfNewEntrants', 'bargainingPowerOfBuyers', 'bargainingPowerOfSuppliers', 'threatOfSubstituteProducts', 'intensityOfCompetitiveRivalry'] }
        },
        required: ['bubbleData', 'signals', 'fiveForces']
      };
      break;

    case 'alerts':
      prompt = `Scan for signals for ${user.companyName}.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          alerts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, severity: { type: Type.STRING }, title: { type: Type.STRING }, desc: { type: Type.STRING }, strategicMove: { type: Type.STRING }, time: { type: Type.STRING } }, required: ['category', 'severity', 'title', 'desc', 'strategicMove', 'time'] } }
        },
        required: ['alerts']
      };
      break;

    case 'social':
      prompt = `Assess pulse of ${user.companyName}.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          overallSentiment: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, label: { type: Type.STRING }, change: { type: Type.STRING } }, required: ['score', 'label', 'change'] },
          shareOfVoice: { type: Type.OBJECT, properties: { you: { type: Type.NUMBER }, competitors: { type: Type.NUMBER } }, required: ['you', 'competitors'] },
          userProfiles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, platform: { type: Type.STRING }, followers: { type: Type.STRING }, trend: { type: Type.STRING }, engagement: { type: Type.STRING } }, required: ['name', 'platform', 'followers', 'trend', 'engagement'] } },
          competitorProfiles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, platform: { type: Type.STRING }, followers: { type: Type.STRING }, trend: { type: Type.STRING }, engagement: { type: Type.STRING } }, required: ['name', 'platform', 'followers', 'trend', 'engagement'] } },
          strategicSignals: { type: Type.OBJECT, properties: { threats: { type: Type.ARRAY, items: { type: Type.STRING } }, strikeZones: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['threats', 'strikeZones', 'weaknesses', 'strengths'] },
          platforms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, followers: { type: Type.STRING }, engagementRate: { type: Type.STRING }, trend: { type: Type.STRING }, winningThemes: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['name', 'followers', 'engagementRate', 'trend', 'winningThemes'] } },
          engagementTrend: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { m: { type: Type.STRING }, v: { type: Type.NUMBER } }, required: ['m', 'v'] } },
          contentStrategy: { type: Type.OBJECT, properties: { winningThemes: { type: Type.ARRAY, items: { type: Type.STRING } }, gaps: { type: Type.ARRAY, items: { type: Type.STRING } }, nextWeekPlan: { type: Type.STRING } }, required: ['winningThemes', 'gaps', 'nextWeekPlan'] }
        },
        required: ['overallSentiment', 'shareOfVoice', 'platforms', 'userProfiles', 'competitorProfiles', 'strategicSignals', 'engagementTrend', 'contentStrategy']
      };
      break;

    default:
      prompt = `Analyze ${user.companyName}.`;
  }

  const config: any = { responseMimeType: "application/json", responseSchema: responseSchema };
  if (!isSearchToolDisabled) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await generateWithFallback(ai, {
    model: 'gemini-3-flash-preview',
    contents: `CONTEXT: ${JSON.stringify(dna)}\nTASK: ${prompt}`,
    config
  });
  
  const data = parseJSON(response.text || "{}") || {};
  if (type === 'competitors') data.competitors = data.competitors || [];
  if (type === 'market') { data.bubbleData = data.bubbleData || []; data.signals = data.signals || []; }
  if (type === 'alerts') data.alerts = data.alerts || [];
  if (type === 'social') {
    data.platforms = data.platforms || [];
    data.engagementTrend = data.engagementTrend || [];
    data.userProfiles = data.userProfiles || [];
    data.competitorProfiles = data.competitorProfiles || [];
    data.strategicSignals = data.strategicSignals || { threats: [], strikeZones: [], weaknesses: [], strengths: [] };
  }
  return data;
};

export const searchBusinessDatabase = async (query: string) => {
  const ai = getClient();
  const config: any = { responseMimeType: "application/json" };
  if (!isSearchToolDisabled) config.tools = [{ googleSearch: {} }];

  try {
    const response = await generateWithFallback(ai, {
      model: 'gemini-3-flash-preview',
      contents: `Search for official business data for "${query}". Return strictly JSON: { "results": [{ "name": "...", "url": "...", "industry": "...", "location": "..." }] }`,
      config
    });
    return parseJSON(response.text || "{}") || { results: [] };
  } catch (e) {
    console.warn("Search tool failure, returning empty results.", e);
    return { results: [] };
  }
};

export const analyzeBusinessWebsite = async (url: string) => {
  const ai = getClient();
  const config: any = { responseMimeType: "application/json" };
  if (!isSearchToolDisabled) config.tools = [{ googleSearch: {} }];

  try {
    const response = await generateWithFallback(ai, {
      model: 'gemini-3-flash-preview',
      contents: `Audit the website ${url}. Return JSON: { "summary": "...", "targetMarket": "...", "keyOfferings": [] }`,
      config
    });
    return parseJSON(response.text || "{}") || {};
  } catch (e) {
    console.warn("Website analysis failure.", e);
    return {};
  }
};

export const generateChatResponse = async function* (history: Message[], currentMessage: string, user: User, project?: Project) {
  const ai = getClient();
  const isComplex = currentMessage.length > 80 || /analyze|strategy|market|audit|competitor|framework|chart/i.test(currentMessage);
  
  const contents = history.slice(-8).map(m => {
    const parts: any[] = [{ text: m.content }];
    if (m.attachments && m.attachments.length > 0) {
      m.attachments.forEach(file => {
        if (file.mimeType.startsWith('image/')) {
          parts.push({ inlineData: { data: file.content, mimeType: file.mimeType } });
        } else {
          parts.push({ text: `[FILE: ${file.name}] ${file.content.substring(0, 10000)}` });
        }
      });
    }
    return { role: m.role, parts };
  });

  const config: any = { 
    systemInstruction: getSystemInstruction(user, project),
    thinkingConfig: isComplex ? { thinkingBudget: 16000 } : undefined
  };
  
  if (!isSearchToolDisabled) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const stream = await ai.models.generateContentStream({ model: 'gemini-3-pro-preview', contents, config });
    for await (const chunk of stream) { yield { text: chunk.text }; }
  } catch (error: any) {
    const errStr = JSON.stringify(error);
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Chat Quota reached. Disabling search for session.");
      isSearchToolDisabled = true;
      delete config.tools;
      const stream = await ai.models.generateContentStream({ model: 'gemini-3-pro-preview', contents, config });
      for await (const chunk of stream) { yield { text: chunk.text }; }
    } else { throw error; }
  }
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport> => {
  const ai = getClient();
  const config: any = { 
    thinkingConfig: { thinkingBudget: 24000 },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING }, title: { type: Type.STRING }, date: { type: Type.STRING }, type: { type: Type.STRING }, impactLevel: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING }, companiesInvolved: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['id', 'title', 'date', 'type', 'impactLevel', 'summary', 'content', 'companiesInvolved']
    }
  };

  if (!isSearchToolDisabled) config.tools = [{ googleSearch: {} }];

  const response = await generateWithFallback(ai, {
    model: 'gemini-3-pro-preview',
    contents: `Generate a board-ready strategic manifesto for ${user.companyName}. goal: ${user.dna.primaryGoal}. content must be Markdown.`,
    config
  });
  
  const raw = parseJSON(response.text || "{}") || {};
  const report: StrategicReport = {
    id: raw.id || Date.now().toString(),
    title: raw.title || "Strategic Brief",
    date: raw.date || new Date().toLocaleDateString(),
    type: raw.type || "Opportunity",
    impactLevel: raw.impactLevel || "High",
    summary: raw.summary || "Summary generation failed.",
    content: raw.content || "Content generation failed.",
    companiesInvolved: raw.companiesInvolved || []
  };
  return report;
};

export const generateMarketingCampaign = async (user: User, prompt: string): Promise<MarketingAsset[]> => {
  const ai = getClient();
  const config: any = { 
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, channel: { type: Type.STRING }, title: { type: Type.STRING }, content: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } }, status: { type: Type.STRING }, timestamp: { type: Type.STRING } }, required: ['id', 'channel', 'title', 'content', 'tags', 'status', 'timestamp'] }
    }
  };

  if (!isSearchToolDisabled) config.tools = [{ googleSearch: {} }];

  const response = await generateWithFallback(ai, {
    model: 'gemini-3-flash-preview',
    contents: `Create 3 marketing assets for ${user.companyName} based on: ${prompt}.`,
    config
  });
  return parseJSON(response.text || "[]") || [];
};

export const generateMarketingImage = async (prompt: string): Promise<string | null> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `High-end consulting visual: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`; }
  return null;
};

export const editStrategicImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } }, { text: `Modify: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`; }
  return null;
};
