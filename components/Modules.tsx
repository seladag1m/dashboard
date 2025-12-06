
import React, { useState, useEffect } from 'react';
import { SimpleMarkdown } from './Markdown';
import { 
  Globe, TrendingUp, AlertTriangle, CheckCircle, Zap, Send, 
  MapPin, RefreshCcw, ArrowRight, Target, Shield, Users, Clock,
  Filter, Download, MoreHorizontal, Bell, Plus, Image as ImageIcon, Loader2,
  FileText, Search, ChevronRight, X, Activity, Maximize2
} from 'lucide-react';
import { Card, Button, Input, Select } from './UI';
import { PerformancePulseChart, MarketBubbleMatrix, RealMapWidget, RevenueBarChart } from './Charts';
import { CompetitorData, Alert, MarketingCampaign, User, StrategicReport } from '../types';
import { fetchRealTimeIntelligence, generateMarketingImage, generateStrategicReport } from '../services/gemini';

// --- REAL TIME DATA HOOK ---
export const useLiveIntelligence = (user: User, type: 'competitors' | 'market' | 'alerts' | 'overview', initialData: any) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initial Fetch from AI
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchRealTimeIntelligence(user, type);
      if (mounted && result) {
        // Merge result with structure or replace
        setData((prev: any) => ({ ...prev, ...result }));
        setLastUpdated(new Date());
      }
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [user.id, user.industry, user.companyName, user.region, user.goal, type]); // Re-fetch if user profile changes

  // Random Walk Simulation for "Live" feel on top of real data
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setData((prev: any) => {
        const next = JSON.parse(JSON.stringify(prev));
        
        // 1. Simulating Market Bubble Movement (Charts)
        if (next.dynamics) {
           next.dynamics = next.dynamics.map((d: any) => ({
             ...d,
             x: Math.min(100, Math.max(0, d.x + (Math.random() - 0.5) * 2)), 
             y: Math.min(100, Math.max(0, d.y + (Math.random() - 0.5) * 1.5))
           }));
        }

        // 2. Simulating Geo Performance Pulse (Maps)
        if (next.geoPerformance) {
           next.geoPerformance = next.geoPerformance.map((g: any) => ({
              ...g,
              radius: Math.max(5, Math.min(25, g.radius + (Math.random() - 0.5) * 2))
           }));
        }

        // 3. Simulating Main Overview Metrics (KPIs)
        // Add tiny fluctuations to scores to make them feel "live"
        if (next.marketPosition && next.marketPosition.score) {
           const change = Math.random() > 0.7 ? (Math.random() - 0.5) : 0; // Occasional shift
           next.marketPosition.score = Math.min(100, Math.max(0, Math.round(next.marketPosition.score + change)));
        }
        if (next.opportunityIndex && next.opportunityIndex.score) {
           const change = Math.random() > 0.7 ? (Math.random() - 0.5) : 0;
           next.opportunityIndex.score = Math.min(100, Math.max(0, Math.round(next.opportunityIndex.score + change)));
           // Pulse the heatmap
           next.opportunityIndex.heatMap = next.opportunityIndex.heatMap.map((v: number) => 
              Math.min(100, Math.max(0, v + (Math.random() - 0.5) * 5))
           );
        }
        if (next.campaignForecast && next.campaignForecast.score) {
           // Pulse the trend line
           next.campaignForecast.trend = next.campaignForecast.trend.map((v: number) => 
              Math.min(100, Math.max(0, v + (Math.random() - 0.5) * 8))
           );
        }

        return next;
      });
    }, 2000); // 2s update interval
    return () => clearInterval(interval);
  }, [loading]);

  return { data, loading, lastUpdated };
};

// --- COMPETITOR ANALYSIS MODULE ---
export const CompetitorModule: React.FC<{ user: User, onAnalyze: (context: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'competitors', {
    competitors: [
      { id: '1', name: 'Scanning...', marketShare: 30, sentiment: 50, growth: 0, pricingStatus: 'stable' }
    ]
  });

  const handleAIAnalysis = () => {
    const context = `Current Competitor Data (${user.industry}): ${JSON.stringify(data.competitors)}`;
    onAnalyze(context);
  };

  const markers = data.competitors?.map((c: any) => {
    const marketShare = parseFloat(String(c.marketShare || 0));
    const growth = parseFloat(String(c.growth || 0));

    return {
      lat: c.location?.lat,
      lng: c.location?.lng,
      title: c.name,
      info: `
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
           <span style="color: #71717A;">Market Share:</span> 
           <span style="font-weight:600; color:#18181B">${isNaN(marketShare) ? '0.0' : marketShare.toFixed(1)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
           <span style="color: #71717A;">Sentiment:</span> 
           <span style="font-weight:600; color:#18181B">${c.sentiment}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
           <span style="color: #71717A;">Growth:</span> 
           <span style="font-weight:600; color:${growth > 0 ? '#10B981' : '#F43F5E'}">${growth > 0 ? '+' : ''}${isNaN(growth) ? '0.0' : growth.toFixed(1)}%</span>
        </div>
        <div style="margin-top:8px; font-size:10px; color:#A1A1AA; text-align:right; border-top: 1px dashed #E4E4E7; padding-top: 4px;">
           ${c.location?.city || 'Global HQ'}
        </div>
      `
    };
  }).filter((m: any) => m.lat && m.lng) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h2 className="text-2xl font-serif font-bold text-zinc-900">Competitor Intelligence</h2>
             {loading ? <Loader2 size={16} className="animate-spin text-zinc-400"/> : (
               <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
             )}
          </div>
          <p className="text-zinc-500 text-sm">Real-time analysis of {user.industry} rivals in {user.region}.</p>
        </div>
        <Button size="sm" icon={Zap} variant="accent" onClick={handleAIAnalysis}>AI Insights</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Global Footprint" className="lg:col-span-2 min-h-[400px] p-0 overflow-hidden">
          <div className="h-[400px] w-full">
             <RealMapWidget markers={markers} />
          </div>
        </Card>
        
        <div className="space-y-6">
           <Card title="Real-Time Performance Pulse">
             <div className="h-[200px] relative w-full">
                {/* Live Pulse Indicator Overlay */}
                <div className="absolute top-0 right-0 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-zinc-100 shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Live Stream</span>
                </div>
                
                {/* Custom Legend Overlay */}
                <div className="absolute top-0 left-0 z-10 flex items-center gap-3">
                   <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-[10px] font-bold text-zinc-500">You</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-zinc-400 opacity-50"></div>
                      <span className="text-[10px] font-bold text-zinc-400">Market</span>
                   </div>
                </div>

                <PerformancePulseChart />
             </div>
           </Card>
           
           <Card title="Competitor Status">
             <div className="space-y-0 divide-y divide-zinc-50 max-h-[250px] overflow-y-auto">
               {data.competitors?.map((c: any, i: number) => {
                 const marketShare = parseFloat(String(c.marketShare || 0));
                 const growth = parseFloat(String(c.growth || 0));
                 
                 return (
                   <div key={i} className="flex justify-between items-center p-3 hover:bg-zinc-50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-xs font-bold text-zinc-700">
                         {c.name ? c.name[0] : '?'}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-zinc-900">{c.name}</p>
                         <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                            {c.location?.city || 'Global'}
                            <span className={`w-1.5 h-1.5 rounded-full ${c.pricingStatus === 'increased' ? 'bg-rose-500' : 'bg-emerald-500'} ml-1`}></span>
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-zinc-900">{isNaN(marketShare) ? '0.0' : marketShare.toFixed(1)}%</p>
                       <p className={`text-[10px] font-bold ${growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {growth > 0 ? '+' : ''}{isNaN(growth) ? '0.0' : growth.toFixed(1)}%
                       </p>
                     </div>
                   </div>
                 );
               })}
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

// --- MARKET ANALYSIS MODULE ---
export const MarketModule: React.FC<{ user: User, onAnalyze: (context: string) => void }> = ({ user, onAnalyze }) => {
  const [region, setRegion] = useState(user.region || 'Global');
  
  const { data, loading } = useLiveIntelligence(user, 'market', {
    metrics: [
      { label: 'TAM', val: 'Loading...', change: '...', sub: 'Total Addressable' },
      { label: 'CAGR', val: 'Loading...', change: '...', sub: '5 Year' },
      { label: 'SAM', val: 'Loading...', change: '...', sub: 'Serviceable' },
      { label: 'Penetration', val: 'Loading...', change: '...', sub: 'Current Share' },
    ],
    // Mock data structure for Bubble Matrix
    dynamics: [
      { name: 'Comp A', x: 20, y: 80, z: 500, sentiment: 85 },
      { name: 'Comp B', x: 80, y: 40, z: 300, sentiment: 45 },
      { name: 'Comp C', x: 50, y: 60, z: 900, sentiment: 60 },
      { name: 'You', x: 65, y: 30, z: 200, sentiment: 92 },
      { name: 'New Entrant', x: 90, y: 10, z: 100, sentiment: 75 },
    ],
    // Mock data structure for Geo Map
    geoPerformance: [
       { lat: 40.7128, lng: -74.0060, radius: 15, color: '#2563EB', fillOpacity: 0.5, title: 'North America', info: 'Demand: High<br>Conv: 3.2%<br>Trend: +5%' },
       { lat: 51.5074, lng: -0.1278, radius: 10, color: '#10B981', fillOpacity: 0.5, title: 'Europe', info: 'Demand: Med<br>Conv: 4.1%<br>Trend: +2%' },
       { lat: 35.6762, lng: 139.6503, radius: 20, color: '#F59E0B', fillOpacity: 0.5, title: 'Asia Pacific', info: 'Demand: Very High<br>Conv: 2.8%<br>Trend: +8%' }
    ],
    personalizedTrends: [
       { name: "Analyzing Profile...", relevance: 0, growth: "...", context: "Building your strategic radar..." }
    ]
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end flex-wrap gap-4">
         <div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900">Market Dynamics</h2>
          <p className="text-zinc-500 text-sm">Real-time stats for {user.industry} in {region}.</p>
        </div>
        <div className="flex gap-2">
           <select className="bg-white border border-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100" value={region} onChange={(e) => setRegion(e.target.value as any)}>
              <option>Global</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Asia Pacific</option>
           </select>
           <Button variant="outline" size="sm" icon={Filter}>Filter</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.metrics?.map((k: any, i: number) => (
          <Card key={i} className="group cursor-default relative overflow-hidden">
             {loading && <div className="absolute inset-0 bg-white/60 z-10 animate-pulse"></div>}
             <div className="flex justify-between items-start">
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{k.label}</p>
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{k.change}</span>
             </div>
             <div className="mt-3">
               <span className="text-2xl font-serif font-bold text-zinc-900 block truncate">{k.val}</span>
               <span className="text-[10px] text-zinc-400">{k.sub}</span>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NEW: PERSONALIZED TRENDS CARD */}
        <Card title={`Trends tailored for ${user.companyName}`} className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.personalizedTrends?.map((trend: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-bg-soft border border-bg-neutral hover:border-accent/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-text-primary text-sm line-clamp-1" title={trend.name}>{trend.name}</h4>
                        <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-bg-neutral text-emerald-600 shadow-sm">{trend.growth}</span>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center gap-2 text-[10px] text-text-light mb-1">
                            <span>Strategic Fit</span>
                            <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                <div className="h-full bg-accent transition-all duration-1000 ease-out" style={{width: `${trend.relevance || 0}%`}}></div>
                            </div>
                            <span className="font-medium text-text-secondary">{trend.relevance || 0}%</span>
                        </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{trend.context}</p>
                    <button className="mt-3 text-xs font-bold text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onAnalyze(`Tell me more about the trend "${trend.name}" and why it is relevant to my goal of ${user.goal}`)}>
                        Deep Dive <ArrowRight size={12} />
                    </button>
                </div>
            ))}
            </div>
        </Card>

        {/* MARKET BUBBLE MATRIX */}
        <Card title="Market Dynamics Matrix" className="h-[400px] lg:col-span-2">
           <div className="h-full w-full flex flex-col">
              <div className="flex-1 min-h-0 w-full h-full relative">
                 {/* Explicitly adding a style to the chart container to ensure Recharts can calculate size */}
                 <div className="absolute inset-0">
                    <MarketBubbleMatrix data={data.dynamics} />
                 </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-50 pt-2 shrink-0">
                 <div className="flex gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Positive Sentiment</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Neutral</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Negative</span>
                 </div>
                 <span>Bubble Size = Revenue Traction</span>
              </div>
           </div>
        </Card>

        {/* GEO MARKET MAP */}
        <Card title="Geo-Market Performance" className="h-[400px] p-0 overflow-hidden relative">
           <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-zinc-100 shadow-sm text-xs">
              <div className="font-bold text-zinc-700 mb-1">Demand Intensity</div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="w-2 h-2 rounded-full bg-blue-600"></span> <span>Stable</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span>Growing</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-amber-500"></span> <span>Volatile</span>
              </div>
           </div>
           <div className="w-full h-full">
               <RealMapWidget circles={data.geoPerformance} />
           </div>
        </Card>

      </div>
    </div>
  );
};

// --- ALERTS MODULE ---
export const AlertsModule: React.FC<{ user: User, onAnalyze: (context: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'alerts', {
    alerts: [
      { id: '1', type: 'info', title: 'Scanning market...', desc: 'Initializing real-time feeds...', time: 'Now', read: false },
    ]
  });

  const getColor = (type: string) => {
     switch(type) {
        case 'critical': return 'rose';
        case 'opportunity': return 'emerald';
        case 'warning': return 'amber';
        default: return 'blue';
     }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-serif font-bold text-zinc-900">Signal Intelligence</h2>
             <p className="text-zinc-500 text-sm">Real-time threat and opportunity detection.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" icon={Bell}>Configure</Button>
             <Button variant="ghost" size="sm">Mark all read</Button>
          </div>
       </div>
       
       <div className="grid grid-cols-1 gap-4">
          {data.alerts?.map((alert: any) => (
             <div key={alert.id} className={`p-5 bg-white rounded-xl border ${alert.read ? 'border-zinc-100' : 'border-blue-100 shadow-md'} hover:shadow-lg transition-all relative overflow-hidden group animate-slide-up`}>
                <div className={`absolute top-0 left-0 w-1 h-full bg-${getColor(alert.type)}-500`}></div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                   <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-${getColor(alert.type)}-50 text-${getColor(alert.type)}-600 mt-1`}>
                         {alert.type === 'critical' ? <AlertTriangle size={18} /> : 
                          alert.type === 'opportunity' ? <TrendingUp size={18} /> : 
                          alert.type === 'warning' ? <Shield size={18} /> : <Bell size={18} />}
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-bold ${alert.read ? 'text-zinc-700' : 'text-zinc-900'}`}>{alert.title}</h3>
                            {!alert.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                         </div>
                         <p className="text-sm text-zinc-500">{alert.desc}</p>
                         <p className="text-xs text-zinc-300 mt-2 flex items-center gap-1"><Clock size={10}/> {alert.time}</p>
                      </div>
                   </div>
                   <div className="flex gap-2 sm:self-center self-end">
                      <Button size="sm" variant="outline" onClick={() => onAnalyze(`Context: Alert received - ${alert.title}. ${alert.desc}. What should I do?`)}>
                         AI Assist
                      </Button>
                      <Button size="sm" variant="secondary">Dismiss</Button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// --- REPORTS MODULE ---
export const ReportsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [reports, setReports] = useState<StrategicReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<StrategicReport | null>(null);

  // Load initial mock report
  useEffect(() => {
    setReports([
      {
         id: '0',
         title: 'Q3 Competitive Landscape Shift',
         date: new Date().toLocaleDateString(),
         type: 'Market Shift',
         impactLevel: 'High',
         companiesInvolved: ['Competitor X', 'Competitor Y'],
         summary: 'Analysis of recent mergers affecting the mid-market segment in your region.',
         content: `# Q3 Competitive Landscape Shift\n\n**Executive Summary**\nRecent consolidation in the industry has created a new dominant player.\n\n### Strategic Implications\n1. Pricing pressure is expected to increase.\n2. Opportunity to capture dissatisfied legacy customers.\n\n### Recommended Action\n* Launch targeted retention campaign.\n* Review pricing tiers.`
      }
    ]);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    // Use user.language if present, otherwise default to English
    const newReport = await generateStrategicReport(user, user.language || 'English');
    if (newReport) {
      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
    }
    setGenerating(false);
  };

  const handleExportReport = () => {
    if (!selectedReport) return;
    
    const content = `
${selectedReport.title}
Date: ${selectedReport.date}
Impact: ${selectedReport.impactLevel}
Type: ${selectedReport.type}
Companies: ${selectedReport.companiesInvolved.join(', ')}

SUMMARY
${selectedReport.summary}

----------------------------------------

${selectedReport.content}
    `;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReport.title.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedReport) {
    return (
       <div className="animate-fade-in bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 sticky top-0 z-10 backdrop-blur-md">
             <button onClick={() => setSelectedReport(null)} className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all">
                   <ChevronRight size={16} className="rotate-180" />
                </div>
                Back to Reports
             </button>
             <div className="flex gap-2">
                <Button size="sm" variant="outline" icon={Download} onClick={handleExportReport}>Export Report</Button>
                <Button size="sm" variant="secondary" icon={Zap} onClick={() => onAnalyze(`I have questions about the report: "${selectedReport.title}". Specifically regarding...`)}>Ask AI</Button>
             </div>
          </div>
          
          <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto">
             <div className="mb-8 pb-8 border-b border-zinc-100">
                <div className="flex gap-3 mb-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedReport.impactLevel === 'Critical' ? 'bg-rose-100 text-rose-700' : selectedReport.impactLevel === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedReport.impactLevel} Impact
                   </span>
                   <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600">
                      {selectedReport.type}
                   </span>
                </div>
                <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-4 leading-tight">{selectedReport.title}</h1>
                <div className="flex items-center gap-6 text-sm text-zinc-400 font-medium">
                   <span className="flex items-center gap-2"><Clock size={14} /> {selectedReport.date}</span>
                   <span className="flex items-center gap-2"><Target size={14} /> {selectedReport.companiesInvolved.join(', ')}</span>
                </div>
             </div>
             
             <div className="prose prose-zinc prose-lg max-w-none">
                <SimpleMarkdown>{selectedReport.content}</SimpleMarkdown>
             </div>
          </div>
       </div>
    );
  }

  return (
     <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
              <h2 className="text-3xl font-serif font-bold text-zinc-900">Strategic Reporting</h2>
              <p className="text-zinc-500 mt-2 max-w-2xl">
                 Deep-dive intelligence reports generated by scanning live market events, competitor moves, and regulatory shifts affecting {user.companyName}.
              </p>
           </div>
           <Button size="lg" icon={generating ? Loader2 : FileText} onClick={handleGenerate} disabled={generating} className="shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform">
              {generating ? 'Analyzing Market...' : 'Generate New Report'}
           </Button>
        </div>

        {generating && (
           <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center animate-pulse">
              <Loader2 size={32} className="text-blue-600 animate-spin mb-4" />
              <h3 className="font-bold text-blue-900 text-lg">Scanning Global Markets</h3>
              <p className="text-blue-600 text-sm mt-1">Analyzing competitor moves, regulatory filings, and news feeds...</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {reports.map((report) => (
              <div key={report.id} onClick={() => setSelectedReport(report)} className="bg-white rounded-2xl border border-zinc-200 p-6 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${report.type === 'Risk' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                       {report.type === 'Risk' ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <span className="text-xs font-bold text-zinc-400">{report.date}</span>
                 </div>
                 
                 <h3 className="text-xl font-bold text-zinc-900 font-serif mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{report.title}</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{report.summary}</p>
                 
                 <div className="pt-4 border-t border-zinc-50 flex items-center justify-between mt-auto">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${report.impactLevel === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-600'}`}>
                       {report.impactLevel} Impact
                    </span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       Read Full Report <ArrowRight size={12} />
                    </span>
                 </div>
              </div>
           ))}
        </div>
     </div>
  );
};

// --- MARKETING BUILDER MODULE ---
export const MarketingModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  
  const [campaignName, setCampaignName] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  
  const handleGenerateVisual = async () => {
    if (!campaignName) return;
    setIsGeneratingImg(true);
    const prompt = `Professional marketing ${platform} image for a ${user.industry} company named ${user.companyName}. 
    Campaign theme: ${campaignName}. Style: Modern, Premium, Corporate. High quality.`;
    
    const base64 = await generateMarketingImage(prompt);
    setGeneratedImage(base64);
    setIsGeneratingImg(false);
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `campaign_${campaignName.replace(/\s+/g, '_').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-end">
          <div>
             <h2 className="text-2xl font-serif font-bold text-zinc-900">Campaign Studio</h2>
             <p className="text-zinc-500 text-sm">Generate assets based on live market data.</p>
          </div>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Builder */}
          <div className="lg:col-span-2 space-y-6">
             <Card>
                <div className="flex gap-4 border-b border-zinc-100 pb-4 mb-4">
                   <button onClick={() => setActiveTab('generate')} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'generate' ? 'text-zinc-900 border-zinc-900' : 'text-zinc-400 border-transparent'}`}>Generator</button>
                   <button onClick={() => setActiveTab('visuals')} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'visuals' ? 'text-zinc-900 border-zinc-900' : 'text-zinc-400 border-transparent'}`}>Visuals <span className="text-[10px] bg-accent/10 text-accent px-1.5 rounded ml-1">AI</span></button>
                </div>

                {activeTab === 'generate' && (
                  <div className="space-y-5 animate-fade-in">
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Campaign Name" placeholder="e.g. Q3 Growth Push" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                        <div>
                           <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Platform</label>
                           <Select options={['LinkedIn', 'Twitter / X', 'Email Newsletter', 'Instagram Story']} value={platform} onChange={e => setPlatform(e.target.value)} />
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Target Segments (AI Suggested)</label>
                        <div className="flex flex-wrap gap-2">
                           {['SME Owners', 'Tech CTOs', 'Marketing VPs', 'Enterprise'].map(tag => (
                              <button key={tag} className="px-3 py-1.5 rounded-full border border-zinc-200 text-xs font-medium hover:border-blue-500 hover:text-blue-600 transition-colors bg-white">
                                 {tag}
                              </button>
                           ))}
                           <button className="px-3 py-1.5 rounded-full border border-dashed border-zinc-300 text-xs text-zinc-400 hover:border-zinc-400 hover:text-zinc-600"><Plus size={12} /></button>
                        </div>
                     </div>

                     <Input label="Core Message" placeholder="Describe the value proposition or offer..." />
                     
                     <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2"><Zap size={12}/> AI Context Injection</h4>
                        <p className="text-xs text-blue-600 mb-3">The AI will use your live competitor data to position this campaign effectively.</p>
                        <div className="flex gap-2">
                           <span className="px-2 py-1 bg-white rounded-md text-[10px] text-blue-500 border border-blue-200">Competitor Pricing</span>
                           <span className="px-2 py-1 bg-white rounded-md text-[10px] text-blue-500 border border-blue-200">Regional Trends</span>
                        </div>
                     </div>

                     <div className="pt-2 flex justify-end">
                        <Button size="lg" icon={Zap} variant="accent" onClick={() => onAnalyze("Generate a marketing campaign for " + user.companyName + " targeting the selected segments. Use the live market data to differentiate.")}>
                           Generate Copy
                        </Button>
                     </div>
                  </div>
                )}
                
                {activeTab === 'visuals' && (
                  <div className="space-y-6 animate-fade-in">
                     <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-sm text-zinc-600">
                        Generate high-quality, royalty-free visuals tailored to your brand identity ({user.industry}) and the current campaign.
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Campaign Context" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Enter campaign name first" />
                        <Input label="Style Preset" placeholder="Corporate, Minimalist, Vibrant..." />
                     </div>

                     <div className="flex justify-end">
                       <Button onClick={handleGenerateVisual} disabled={isGeneratingImg || !campaignName} icon={ImageIcon} variant="primary">
                          {isGeneratingImg ? <Loader2 className="animate-spin" /> : 'Generate Visual'}
                       </Button>
                     </div>
                  </div>
                )}
             </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
             <div className="bg-zinc-100/50 rounded-2xl p-6 h-full min-h-[400px] flex flex-col border border-zinc-200/50">
                <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-4">Live Preview</h4>
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400 overflow-hidden">
                   {generatedImage ? (
                      <div className="relative w-full h-full animate-fade-in group">
                         <img src={generatedImage} alt="Generated" className="w-full h-auto rounded-xl shadow-lg" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" icon={Download} onClick={handleDownloadImage}>Save</Button>
                         </div>
                      </div>
                   ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                            <Send size={24} className="opacity-50" />
                        </div>
                        <p className="text-sm font-medium">Generated content will appear here.</p>
                        <p className="text-xs mt-2 opacity-70">AI is ready to create.</p>
                      </>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
