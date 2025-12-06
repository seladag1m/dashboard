
import { GoogleGenAI } from "@google/genai";
import { Message, User, StreamChunk, StrategicReport } from "../types";

// --- CACHE LAYER ---
const apiCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes cache

// --- SYSTEM INSTRUCTION BUILDER ---
const getSystemInstruction = (user?: User, contextSnapshot?: string, language: string = 'English') => {
  const profile = user ? `
    User Profile:
    - Role: ${user.skillLevel} Consultant
    - Company: ${user.companyName} (${user.industry}, ${user.size} employees)
    - Context: ${user.description || 'N/A'}
    - Region: ${user.region}
    - Primary Goal: ${user.goal}
  ` : '';

  const liveContext = contextSnapshot ? `
    **CURRENT LIVE DASHBOARD DATA:**
    ${contextSnapshot}
    
    *Use this data to provide specific, calculated insights. Reference the numbers directly.*
  ` : '';

  return `
You are CONSULT AI, a top-tier executive consultant specializing in ${user?.industry || 'Business Strategy'}.
${profile}
${liveContext}

**LANGUAGE REQUIREMENT:** You MUST respond in **${language}**.

**CORE DIRECTIVE:**
Answer in the format of an **Executive Brief** in ${language}.
1. **Executive Summary**: 1-2 sentences summarizing the core insight.
2. **Analysis**: Structure: Situation -> Complication -> Resolution.
3. **Recommendation**: Clear, actionable next steps aligned with the goal: "${user?.goal || 'Growth'}".

**VISUALIZATION PROTOCOL:**
If numbers, trends, or comparisons are involved, you **MUST** generate a **Chart Widget**.

**Widget Specifications (Strict JSON):**
1. **Chart Widget**
   \`\`\`json-widget
   {
     "type": "chart",
     "title": "Revenue Growth 2024-2025",
     "data": {
       "chartType": "area",
       "points": [{"label": "Q1 24", "value": 1.2}, ...]
     }
   }
   \`\`\`
   
2. **Framework Widget**
   \`\`\`json-widget
   {
     "type": "framework",
     "title": "SWOT Analysis",
     "data": { "sections": [{"title": "Strengths", "content": ["Item 1"]}] }
   }
   \`\`\`

**CRITICAL TRANSLATION RULE:**
The content INSIDE the widgets (titles, labels, section names, list items) **MUST** be translated into **${language}**.

**Rules:**
- **ALWAYS** append the \`json-widget\` block at the very end if applicable.
- Use succinct, high-impact language in ${language}.
`;
};

// --- API KEY EXTRACTION ---
const getApiKey = (): string | undefined => {
  try {
    // Replaced by Vite at build time
    const key = process.env.API_KEY;
    if (!key) {
        // Only log once or simply return undefined
        return undefined;
    }
    return key;
  } catch (e) {
    return undefined;
  }
};

// --- SOPHISTICATED SIMULATION ENGINE (KEYWORD RESPONDER) ---
const mockChatResponse = async function* (message: string, user?: User): AsyncGenerator<StreamChunk, void, unknown> {
  const msg = message.toLowerCase();
  let fullText = "";
  let widget = "";

  if (msg.includes('swot')) {
    fullText = `### SWOT Analysis for ${user?.companyName || 'Your Business'}\n\nBased on the current market signals in the **${user?.industry || 'Tech'}** sector, here is the strategic assessment.`;
    widget = `\`\`\`json-widget
{
  "type": "framework",
  "title": "SWOT: ${user?.companyName || 'Strategic Position'}",
  "data": { 
    "sections": [
      {"title": "Strengths", "content": ["High customer retention", "Proprietary IP", "Strong brand equity in ${user?.region}"]},
      {"title": "Weaknesses", "content": ["Limited regional presence", "High OpEx compared to peers", "Legacy tech debt"]},
      {"title": "Opportunities", "content": ["AI Integration", "Market expansion in ${user?.region === 'North America' ? 'Europe' : 'North America'}", "Strategic partnerships"]},
      {"title": "Threats", "content": ["New regulatory compliance", "Competitor price wars", "Supply chain volatility"]}
    ] 
  }
}
\`\`\``;
  } 
  else if (msg.includes('pestle')) {
    fullText = `### PESTLE Analysis\n\nExternal macro-environmental factors affecting your growth trajectory in **${user?.region || 'Global Market'}**.`;
    widget = `\`\`\`json-widget
{
  "type": "framework",
  "title": "PESTLE Framework",
  "data": { 
    "sections": [
      {"title": "Political", "content": ["Trade tariffs", "Data sovereignty laws"]},
      {"title": "Economic", "content": ["Inflationary pressure", "Currency fluctuation"]},
      {"title": "Social", "content": ["Remote work trends", "Sustainability focus"]},
      {"title": "Technological", "content": ["Generative AI adoption", "Cloud migration"]}
    ] 
  }
}
\`\`\``;
  }
  else if (msg.includes('growth') || msg.includes('revenue') || msg.includes('sales') || msg.includes('chart')) {
    fullText = `### Growth Projection\n\nCurrent trajectory indicates a **12.4% upside** if the new marketing initiative is executed in Q3.`;
    widget = `\`\`\`json-widget
{
  "type": "chart",
  "title": "Projected Revenue (Millions)",
  "data": {
    "chartType": "area",
    "points": [
      {"label": "Jan", "value": 1.2},
      {"label": "Feb", "value": 1.4},
      {"label": "Mar", "value": 1.3},
      {"label": "Apr", "value": 1.8},
      {"label": "May", "value": 2.1},
      {"label": "Jun", "value": 2.4}
    ]
  }
}
\`\`\``;
  }
  else if (msg.includes('competitor') || msg.includes('rival')) {
    fullText = `### Competitive Landscape\n\nKey rivals in **${user?.industry || 'your sector'}** are pivoting towards aggressive pricing. \n\n**Strategic Response:**\n1. Focus on value-added services.\n2. Avoid direct price competition.\n3. Leverage your high NPS score.`;
  }
  else {
    fullText = `### Executive Insight\n\nI've analyzed your query regarding **"${message}"**.\n\nGiven your goal to **${user?.goal || 'improve revenue'}**, I recommend focusing on channel optimization. The ${user?.industry} market in ${user?.region} is showing signs of consolidation.\n\n**Next Steps:**\n- Conduct a customer sentiment audit.\n- Review Q3 operational efficiency.`;
  }

  const words = fullText.split(' ');
  for (const word of words) {
    await new Promise(r => setTimeout(r, 20)); 
    yield { text: word + " " };
  }

  if (widget) {
    yield { text: "\n\n" };
    yield { text: widget };
  }
};

const mockRealTimeData = (type: string, user: User) => {
  const industry = user?.industry || 'Tech';
  const region = user?.region || 'Global';
  let data: any = {};

  if (type === 'competitors') {
    data = {
      competitors: [
        { id: '1', name: `Alpha ${industry}`, marketShare: 35 + Math.random() * 5, sentiment: 72, growth: 12.5, pricingStatus: 'increased', location: { lat: 40.7128, lng: -74.0060, city: 'New York' } },
        { id: '2', name: `Beta ${industry}`, marketShare: 28 - Math.random() * 5, sentiment: 65, growth: -2.1, pricingStatus: 'stable', location: { lat: 51.5074, lng: -0.1278, city: 'London' } },
        { id: '3', name: `Gamma Innovate`, marketShare: 15 + Math.random() * 2, sentiment: 88, growth: 25.4, pricingStatus: 'decreased', location: { lat: 35.6762, lng: 139.6503, city: 'Tokyo' } }
      ]
    };
  }
  else if (type === 'market') {
    data = {
      metrics: [
        { label: 'TAM', val: '$' + (Math.floor(Math.random() * 50) + 10) + '.2B', change: '+' + (Math.random() * 10).toFixed(1) + '%', sub: 'Total Addressable' },
        { label: 'CAGR', val: (Math.random() * 15 + 5).toFixed(1) + '%', change: '+' + (Math.random() * 2).toFixed(1) + '%', sub: '5 Year Forecast' },
        { label: 'SAM', val: '$' + (Math.floor(Math.random() * 10) + 1) + '.1B', change: '+5%', sub: 'Serviceable Market' },
        { label: 'Share', val: (Math.random() * 20 + 5).toFixed(1) + '%', change: '+1.2%', sub: 'Current Market Share' }
      ],
      dynamics: [
        { name: 'Comp A', x: 20, y: 80, z: 500, sentiment: 85 },
        { name: 'Comp B', x: 80, y: 40, z: 300, sentiment: 45 },
        { name: 'Comp C', x: 50, y: 60, z: 900, sentiment: 60 },
        { name: 'You', x: 65, y: 30, z: 200, sentiment: 92 },
        { name: 'New Entrant', x: 90, y: 10, z: 100, sentiment: 75 },
      ],
      geoPerformance: [
         { lat: 40.7128, lng: -74.0060, radius: 15, color: '#296CFF', fillOpacity: 0.5, title: 'North America', info: 'Demand: High<br>Conv: 3.2%' },
         { lat: 51.5074, lng: -0.1278, radius: 10, color: '#10B981', fillOpacity: 0.5, title: 'Europe', info: 'Demand: Med<br>Conv: 4.1%' },
         { lat: 35.6762, lng: 139.6503, radius: 20, color: '#FBBF24', fillOpacity: 0.5, title: 'Asia Pacific', info: 'Demand: Very High<br>Conv: 2.8%' }
      ],
      personalizedTrends: [
        { name: `AI in ${industry}`, relevance: 98, growth: "+34%", context: `Critical for your goal to ${user.goal}.` },
        { name: "Remote Ops", relevance: 85, growth: "+12%", context: "Aligns with your size." },
        { name: "Green Tech", relevance: 72, growth: "+8%", context: `Emerging standard in ${region}.` }
      ]
    };
  }
  else if (type === 'alerts') {
    data = {
      alerts: [
        { id: '1', type: 'critical', title: 'Competitor Price Drop', desc: `Major player in ${industry} lowered pricing by 15%.`, time: '10m ago', read: false },
        { id: '2', type: 'opportunity', title: 'Emerging Signal', desc: `High demand detected in ${region} for your category.`, time: '1h ago', read: false },
        { id: '3', type: 'warning', title: 'Supply Chain Delay', desc: 'Potential 2-week delay forecast for Q3 shipments.', time: '3h ago', read: false }
      ]
    };
  }
  else if (type === 'overview') {
    data = {
       marketPosition: { score: Math.floor(Math.random() * 30) + 60, rank: "Top 15%", change: "+2.4%", context: `Outperforming ${industry} avg` },
       opportunityIndex: { score: Math.floor(Math.random() * 30) + 60, level: "Very High", topSector: "AI Automation", heatMap: [40, 55, 70, 85, 90, 88, 92] },
       strategyFit: { score: 85, "alignment": "Strong", "gap": "Talent Acquisition" },
       campaignForecast: { score: 88, predictedReach: "1.2M", sentiment: "Positive", trend: [20, 35, 45, 60, 55, 70, 75, 80, 85, 88] },
       marketTrends: [
         { label: "Q1", value: 30 }, { label: "Q2", value: 45 }, { label: "Q3", value: 55 }, { label: "Q4", value: 70 },
         { label: "Q1", value: 65 }, { label: "Q2", value: 85 }
       ],
       sectorDistribution: [
         { subject: 'Tech', A: 120, fullMark: 150 },
         { subject: 'Finance', A: 90, fullMark: 150 }
       ],
       keyInsights: [
         "Simulated Insight: Market consolidation predicted for Q4.", "Simulated Insight: Competitors increasing ad spend."
       ]
    };
  }

  return { ...data, _isSimulated: true };
};

export const fetchRealTimeIntelligence = async (user: User, type: 'competitors' | 'market' | 'alerts' | 'overview') => {
  const apiKey = getApiKey();
  const cacheKey = `intelligence-${type}-${user.industry}-${user.region}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  
  if (!apiKey) {
    console.warn("CONSULT AI: No API Key found. Using high-fidelity simulation.");
    return mockRealTimeData(type, user);
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  let prompt = "";
  // ... Prompts omitted for brevity (same as original, they are safe) ...
  if (type === 'competitors') prompt = `Identify top 3 competitors for ${user.companyName} in ${user.industry}, ${user.region}. Return JSON: { "competitors": [{ "id": "1", "name": "Name", "marketShare": 20, "sentiment": 80, "growth": 5, "pricingStatus": "stable", "location": { "lat": 0, "lng": 0, "city": "City" } }] }`;
  else if (type === 'market') prompt = `Analyze ${user.industry} in ${user.region} for ${user.size} company. Return JSON: { "metrics": [{"label": "TAM", "val": "$1B", "change": "+5%", "sub": "Total"}], "dynamics": [{"name": "A", "x": 50, "y": 50, "z": 100, "sentiment": 50}], "geoPerformance": [{"lat": 0, "lng": 0, "radius": 10, "color": "blue", "fillOpacity": 0.5, "title": "Region", "info": "Info"}], "personalizedTrends": [{"name": "Trend", "relevance": 90, "growth": "+10%", "context": "Context"}] }`;
  else if (type === 'alerts') prompt = `Find news/risks for ${user.industry} in ${user.region}. Return JSON: { "alerts": [{"id": "1", "type": "critical", "title": "Title", "desc": "Desc", "time": "Now"}] }`;
  else if (type === 'overview') prompt = `Generate strategic metrics for ${user.companyName}. Return JSON: { "marketPosition": {"score": 80, "rank": "Top 10", "change": "+1%", "context": "Good"}, "opportunityIndex": {"score": 90, "level": "High", "topSector": "Sector", "heatMap": [1,2,3]}, "strategyFit": {"score": 80, "alignment": "Good", "gap": "None"}, "campaignForecast": {"score": 80, "predictedReach": "1M", "sentiment": "Pos", "trend": [1,2]}, "marketTrends": [{"label": "Q1", "value": 10}], "sectorDistribution": [{"subject": "A", "A": 100, "fullMark": 150}], "keyInsights": ["Insight 1"] }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0.2
      }
    });

    let cleanText = response.text || "";
    // Robust parsing
    if (cleanText.includes('```json')) {
      cleanText = cleanText.split('```json')[1].split('```')[0];
    } else if (cleanText.includes('```')) {
      cleanText = cleanText.split('```')[1].split('```')[0];
    }
    
    try {
      const parsedData = JSON.parse(cleanText.trim());
      apiCache.set(cacheKey, { timestamp: Date.now(), data: parsedData });
      return parsedData;
    } catch (e) {
      return mockRealTimeData(type, user);
    }
  } catch (e) {
    console.warn(`CONSULT AI: API Error for ${type}, using simulation.`);
    return mockRealTimeData(type, user);
  }
};

export const generateChatResponse = async function* (
  history: Message[],
  message: string,
  user: User,
  contextSnapshot?: string,
  useThinking: boolean = false,
  language: string = 'English',
  imageData?: { base64: string, mimeType: string }
): AsyncGenerator<StreamChunk, void, unknown> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    yield* mockChatResponse(message, user);
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = getSystemInstruction(user, contextSnapshot, language);

    const historyContent = history.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const config: any = { systemInstruction };
    if (useThinking) {
        config.thinkingConfig = { thinkingBudget: 1024 }; 
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config,
      history: historyContent
    });

    let result;
    if (imageData) {
       result = await chat.sendMessageStream({ 
         message: {
            parts: [
               { text: message },
               { inlineData: { data: imageData.base64, mimeType: imageData.mimeType } }
            ]
         } as any 
       });
    } else {
       result = await chat.sendMessageStream({ message });
    }
    
    for await (const chunk of result) {
       const text = chunk.text;
       if (text) {
          yield { 
            text, 
            groundingMetadata: chunk.candidates?.[0]?.groundingMetadata as any 
          };
       }
    }

  } catch (error) {
    yield* mockChatResponse(message, user);
  }
};

export const generateStrategicReport = async (user: User): Promise<StrategicReport | null> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      title: `Simulated: Strategic Shift in ${user.industry}`,
      type: "Opportunity",
      impactLevel: "High",
      companiesInvolved: ["Alpha Corp", "Beta Ltd"],
      summary: `Simulation: Key market shift detected in ${user.region}.`,
      content: `# Strategic Impact Report (Simulated)\n\n**Executive Summary**\nThe rapid adoption of AI automation by key players presents a window of opportunity for ${user.companyName}.`
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Using flash model for better availability and speed
    const prompt = `Generate Deep Dive Report for ${user.companyName}, ${user.industry}, ${user.region}. 
    Response MUST be valid JSON with fields: title, type (Risk/Opportunity), impactLevel (High/Medium), companiesInvolved (array of strings), summary, and content (Markdown format).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0.3
      }
    });

    let cleanText = response.text?.trim() || "";
    if (cleanText.includes('```json')) {
        cleanText = cleanText.split('```json')[1].split('```')[0];
    } else if (cleanText.includes('```')) {
        cleanText = cleanText.split('```')[1].split('```')[0];
    }
    
    const data = JSON.parse(cleanText.trim());
    return { id: Date.now().toString(), date: new Date().toLocaleDateString(), ...data };
  } catch (e) {
    console.error("Report Generation Failed", e);
    return null;
  }
};

export const generateMarketingImage = async (prompt: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"; 

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    return "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000&auto=format&fit=crop";
  }
};
