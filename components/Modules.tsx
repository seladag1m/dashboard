
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, TrendingUp, AlertTriangle, Zap, Target, Activity, 
  ArrowRight, Loader2, ExternalLink, ShieldCheck, CheckCircle, Wand2, FileText, Plus, Share2,
  Map as MapIcon, ShieldX, Crosshair, TrendingDown, Eye, Users, X, Download, Info, MoveUp, MoveDown, Minus
} from 'lucide-react';
import { Card, Button, Input, Modal } from './UI';
import { MarketBubbleMatrix, CompetitorRadarChart, SalesAreaChart, RealMapWidget } from './Charts';
import { User, StrategicReport, MarketingAsset, SocialIntelligence, SocialProfileData } from '../types';
import { fetchRealTimeIntelligence, generateMarketingImage, generateStrategicReport, generateMarketingCampaign, editStrategicImage } from '../services/gemini';
import { SimpleMarkdown } from './Markdown';

export const useLiveIntelligence = (
  user: User, 
  type: 'competitors' | 'market' | 'alerts' | 'overview' | 'social', 
  fallback: any,
  options?: any
) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [isQuotaLimited, setIsQuotaLimited] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const load = async () => {
      try {
        const result = await fetchRealTimeIntelligence(user, type, options);
        if (mounted && result) {
          setData((prev: any) => ({ ...prev, ...result }));
          setIsQuotaLimited(false);
        }
      } catch (e: any) {
        const errStr = JSON.stringify(e);
        
        const isQuotaError = 
          e?.code === 429 || 
          e?.status === 'RESOURCE_EXHAUSTED' || 
          e?.error?.code === 429 ||
          e?.error?.status === 'RESOURCE_EXHAUSTED' ||
          errStr.includes("429") || 
          errStr.includes("RESOURCE_EXHAUSTED") ||
          e?.message?.includes("429") ||
          e?.message?.includes("quota");

        const isRpcError = 
          e?.code === 500 || 
          errStr.includes("Rpc failed") || 
          errStr.includes("xhr error") ||
          e?.message?.includes("Rpc failed");

        if (isQuotaError || isRpcError) {
          if (mounted) setIsQuotaLimited(true);
        }
        console.error("Intelligence hook failure", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user.id, type, user.industry]);

  return { data, loading, isQuotaLimited };
};

const safeOpenLink = (url?: string) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank');
}

const QuotaWarning = () => (
  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-reveal">
    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
    <div className="text-left">
      <p className="text-xs font-bold text-amber-900 uppercase tracking-widest">Search Grounding Limited</p>
      <p className="text-[10px] text-amber-700 leading-relaxed mt-1">Real-time search grounding or external proxies are currently restricted. Strategic Engine is utilizing internal neural intelligence and historical benchmarks to resolve signals.</p>
    </div>
  </div>
);

export const CompetitorModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'competitors', { competitors: [] });

  const mapMarkers = useMemo(() => {
    return (data.competitors || [])
      .filter((c: any) => c.latitude && c.longitude)
      .map((c: any) => ({
        lat: parseFloat(c.latitude),
        lng: parseFloat(c.longitude),
        title: c.name,
        info: `HQ: ${c.location} | Share: ${c.share}`
      }));
  }, [data.competitors]);

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Competitive Landscape</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>

      {isQuotaLimited && <QuotaWarning />}

      <div className="w-full h-[400px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden relative shadow-premium">
        <div className="absolute top-6 left-6 z-[40] flex flex-col gap-3">
            <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3">
                <MapIcon size={18} className="text-brand-blue" />
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">HQ Geo-Distribution</span>
            </div>
        </div>
        <RealMapWidget markers={mapMarkers} />
      </div>
      
      {loading && data.competitors.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Scanning global competitor footprints...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {data.competitors?.map((comp: any, i: number) => (
              <Card key={i} title={comp.name} headerAction={
                <button onClick={() => safeOpenLink(comp.url)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <ExternalLink size={16} />
                </button>
              }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[250px]">
                    <CompetitorRadarChart data={comp.radarData} />
                  </div>
                  <div className="space-y-4 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Strategic SWOT</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map(type => (
                        <div key={type} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{type}</p>
                          <p className="text-xs text-slate-600 leading-tight">
                            {Array.isArray(comp.swot?.[type.toLowerCase()]) 
                              ? comp.swot?.[type.toLowerCase()]?.[0] 
                              : comp.swot?.[type.toLowerCase()] || 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onAnalyze(`Perform a deep audit of ${comp.name} comparing them to our ${user.dna.businessModel} model.`)} fullWidth>Run Full Audit</Button>
                  </div>
                </div>
              </Card>
            ))}
            {data.competitors?.length === 0 && !loading && <div className="p-20 text-center opacity-30 italic">No competitors identified. Scoping market...</div>}
          </div>
          <div className="space-y-8 text-left">
            <Card title="Market Share Estimates">
              <div className="space-y-6 pt-4">
                {data.competitors?.map((comp: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{comp.name}</span>
                      <span className="text-brand-blue">{comp.share || 'N/A'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue" style={{ width: comp.share || '0%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export const MarketModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'market', { bubbleData: [], signals: [], fiveForces: null });

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Market Intelligence</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>

      {isQuotaLimited && <QuotaWarning />}

      {loading && data.bubbleData.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Resolving market dynamics and Porter's indicators...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card title="Momentum vs. Penetration Matrix" className="lg:col-span-2">
              <div className="h-[450px] w-full mt-4">
                <MarketBubbleMatrix data={data.bubbleData} />
              </div>
            </Card>
            <Card title="Competitive Signals" headerAction={<Activity size={18} className="text-slate-300" />}>
              <div className="divide-y divide-slate-50 mt-4 text-left">
                  {data.signals?.map((sig: any, i: number) => (
                    <div key={i} className="py-5 space-y-2">
                      <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                          <h4 className="text-sm font-bold text-slate-900">{sig.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">{sig.desc}</p>
                    </div>
                  ))}
              </div>
              <Button variant="ghost" size="sm" fullWidth className="mt-4" onClick={() => onAnalyze("Deep scan for market shifts")}>View All Signals</Button>
            </Card>
          </div>

          {data.fiveForces && (
            <div className="space-y-8 animate-reveal text-left">
              <div className="flex items-center gap-3">
                  <ShieldCheck size={24} className="text-brand-blue" />
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Porter's Five Forces Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {Object.entries(data.fiveForces).map(([key, value]: [string, any], i) => (
                    <Card key={i} title={key.replace(/([A-Z])/g, ' $1').trim()} className="h-full">
                      <p className="text-xs text-slate-500 leading-relaxed italic">{typeof value === 'string' ? value : (value.content || 'Synthesizing...')}</p>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const AlertsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'alerts', { alerts: [] });

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Strategic Signals</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>

      {isQuotaLimited && <QuotaWarning />}

      {loading && data.alerts.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Monitoring news feeds for high-stakes signals...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {data.alerts?.map((alert: any, i: number) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex gap-8 items-start hover:border-brand-blue/30 transition-all group">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${
                alert.category === 'Threat' ? 'bg-rose-50 text-rose-500' : 'bg-brand-blue/10 text-brand-blue'
              }`}>
                {alert.category === 'Threat' ? <AlertTriangle size={32} /> : <Zap size={32} />}
              </div>
              <div className="space-y-4 flex-1 text-left">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{alert.category}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${alert.severity === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{alert.severity} Risk</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">{alert.time}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{alert.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{alert.desc}</p>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Move: {alert.strategicMove}</span>
                    </div>
                    <button onClick={() => onAnalyze(`Execute protocol for: ${alert.title}`)} className="text-brand-blue text-xs font-bold hover:underline">Execute Response</button>
                </div>
              </div>
            </div>
          ))}
          {data.alerts?.length === 0 && !loading && <div className="p-20 text-center opacity-30 italic">No strategic signals detected in this cycle.</div>}
        </div>
      )}
    </div>
  );
};

const SocialProfileList: React.FC<{ title: string, profiles: SocialProfileData[], icon: any }> = ({ title, profiles, icon: Icon }) => (
  <Card title={title} headerAction={<Icon size={18} className="text-brand-blue" />}>
    <div className="divide-y divide-slate-50 mt-4 text-left">
      {profiles.map((p, i) => (
        <div key={i} className="py-4 flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden text-left">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all">
              <span className="text-[10px] font-bold uppercase">{p.platform.slice(0, 2)}</span>
            </div>
            <div className="overflow-hidden">
              <h5 className="text-sm font-bold text-slate-900 truncate">{p.name}</h5>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.platform}</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{p.followers}</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">ER: {p.engagement}</p>
            </div>
            <div className="flex flex-col items-center justify-center shrink-0 w-8">
              {p.trend?.startsWith('+') ? <MoveUp size={14} className="text-emerald-500" /> : p.trend?.startsWith('-') ? <MoveDown size={14} className="text-rose-500" /> : <Minus size={14} className="text-slate-200" />}
              <span className={`text-[8px] font-bold ${p.trend?.startsWith('+') ? 'text-emerald-500' : p.trend?.startsWith('-') ? 'text-rose-500' : 'text-slate-300'}`}>{p.trend}</span>
            </div>
          </div>
        </div>
      ))}
      {profiles.length === 0 && <div className="py-10 text-center text-xs text-slate-300 italic">No profiles detected.</div>}
    </div>
  </Card>
);

export const SocialPulseModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited }: { data: SocialIntelligence, loading: boolean, isQuotaLimited: boolean } = useLiveIntelligence(user, 'social', { 
    overallSentiment: { score: 0, label: 'Neutral', change: '0%' }, 
    engagementTrend: [],
    platforms: [],
    userProfiles: [],
    competitorProfiles: [],
    strategicSignals: { threats: [], strikeZones: [], weaknesses: [], strengths: [] },
    contentStrategy: { winningThemes: [], gaps: [], nextWeekPlan: '' }
  });

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-8 gap-6">
        <div className="text-left">
          <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Institutional Pulse</h2>
          <p className="text-slate-500 text-sm mt-2">Real-time analysis of digital share of voice and movements.</p>
        </div>
        {loading && <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <Loader2 className="animate-spin text-brand-blue" size={16} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolving Signals</span>
        </div>}
      </div>

      {isQuotaLimited && <QuotaWarning />}

      {loading && data.engagementTrend.length === 0 ? (
        <div className="py-40 flex flex-col items-center gap-6 text-slate-400">
          <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center shadow-premium">
             <Activity className="animate-pulse text-brand-blue" size={32} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Synchronizing Context</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Ingesting platform engagement metadata and rival pulse...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card title="Net Sentiment Score" className="text-center">
                <div className="py-8">
                  <div className="text-6xl font-serif font-bold text-slate-900 tracking-tighter">{data.overallSentiment?.score}%</div>
                  <p className="text-xs font-bold text-emerald-500 mt-3 uppercase tracking-widest">{data.overallSentiment?.label} ({data.overallSentiment?.change})</p>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden shadow-inner">
                  <div className="h-full bg-brand-blue shadow-lg shadow-blue-500/20 transition-all duration-1000" style={{ width: `${data.overallSentiment?.score}%` }}></div>
                </div>
            </Card>
            <Card title="Aggregated Engagement" className="lg:col-span-3">
              <div className="h-[250px] w-full mt-4">
                  <SalesAreaChart data={data.engagementTrend} />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SocialProfileList title="Our Institutional Presence" profiles={data.userProfiles} icon={Activity} />
            <SocialProfileList title="Rival Market Footprint" profiles={data.competitorProfiles} icon={Users} />
          </div>

          <div className="space-y-8 text-left">
            <div className="flex items-center gap-4">
              <Target size={24} className="text-brand-blue" />
              <h3 className="text-2xl font-serif font-bold text-slate-900 italic">Strategic Social Signals</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <Card title="Dominance Threats" className="border-t-4 border-t-rose-500">
                 <ul className="space-y-4 pt-4">
                    {data.strategicSignals.threats.map((t, i) => (
                      <li key={i} className="flex gap-4 text-sm text-slate-600 leading-relaxed italic group">
                         <ShieldX size={18} className="text-rose-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" /> 
                         <span>{t}</span>
                      </li>
                    ))}
                    {data.strategicSignals.threats.length === 0 && <p className="text-xs text-slate-400 italic">No threats identified.</p>}
                 </ul>
              </Card>
              <Card title="Strike Zones" className="border-t-4 border-t-brand-blue">
                 <ul className="space-y-4 pt-4">
                    {data.strategicSignals.strikeZones.map((sz, i) => (
                      <li key={i} className="flex gap-4 text-sm text-slate-600 leading-relaxed italic group">
                         <Crosshair size={18} className="text-brand-blue shrink-0 mt-0.5 group-hover:scale-110 transition-transform" /> 
                         <span>{sz}</span>
                      </li>
                    ))}
                    {data.strategicSignals.strikeZones.length === 0 && <p className="text-xs text-slate-400 italic">No strike zones identified.</p>}
                 </ul>
              </Card>
              <Card title="Internal Gaps" className="border-t-4 border-t-amber-500">
                 <ul className="space-y-4 pt-4">
                    {data.strategicSignals.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-4 text-sm text-slate-600 leading-relaxed italic group">
                         <TrendingDown size={18} className="text-amber-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" /> 
                         <span>{w}</span>
                      </li>
                    ))}
                    {data.strategicSignals.weaknesses.length === 0 && <p className="text-xs text-slate-400 italic">No gaps identified.</p>}
                 </ul>
              </Card>
              <Card title="Viral Themes" className="border-t-4 border-t-emerald-500">
                 <ul className="space-y-4 pt-4">
                    {data.strategicSignals.strengths.map((s, i) => (
                      <li key={i} className="flex gap-4 text-sm text-slate-600 leading-relaxed italic group">
                         <Zap size={18} className="text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" /> 
                         <span>{s}</span>
                      </li>
                    ))}
                    {data.strategicSignals.strengths.length === 0 && <p className="text-xs text-slate-400 italic">No themes identified.</p>}
                 </ul>
              </Card>
            </div>
            <div className="flex justify-center pt-8">
               <Button onClick={() => onAnalyze("Draft a high-engagement tactical content strategy based on identified Strike Zones.")} size="lg" className="rounded-full shadow-premium">Convert Pulse to Content Strategy</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ReportsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [reports, setReports] = useState<StrategicReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingReport, setViewingReport] = useState<StrategicReport | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateStrategicReport(user);
      if (res && res.title) {
        setReports(prev => [res, ...prev]);
        setViewingReport(res);
      }
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12">
      <div className="flex items-center justify-between border-b pb-8">
        <div className="text-left">
          <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Strategic Briefs</h2>
          <p className="text-slate-500 text-sm mt-2">Board-ready institutional manifestos.</p>
        </div>
        <Button icon={Plus} onClick={handleGenerate} isLoading={isGenerating}>Generate Brief</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-40">
        {reports.map((report) => (
          <div key={report.id} onClick={() => setViewingReport(report)} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium space-y-6 group hover:-translate-y-2 transition-all cursor-pointer text-left">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center">
                   <FileText size={20} />
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${report.impactLevel === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-brand-blue border-blue-100'}`}>{report.impactLevel} Impact</span>
             </div>
             <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{report.title}</h3>
             <p className="text-sm text-slate-500 italic line-clamp-3">"{report.summary}"</p>
             <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</span>
                <button onClick={(e) => { e.stopPropagation(); onAnalyze(`Summarize findings from brief: ${report.title}`); }} className="p-2 hover:bg-slate-50 rounded-lg text-brand-blue">
                   <ArrowRight size={18} />
                </button>
             </div>
          </div>
        ))}
        {reports.length === 0 && !isGenerating && (
          <div className="col-span-full py-32 text-center opacity-30 italic">No reports archived.</div>
        )}
      </div>

      <Modal isOpen={!!viewingReport} onClose={() => setViewingReport(null)} title={viewingReport?.title || "Strategic Brief"}>
        {viewingReport && (
          <div className="space-y-8 pb-10 text-left">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{viewingReport.date}</span>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <span className="text-xs font-bold text-brand-blue uppercase tracking-[0.2em]">{viewingReport.type}</span>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
               <p className="text-sm text-slate-600 italic leading-relaxed">"{viewingReport.summary}"</p>
            </div>
            <div className="prose prose-slate max-w-none prose-sm md:prose-base">
               <SimpleMarkdown>{viewingReport.content}</SimpleMarkdown>
            </div>
            <div className="pt-8 border-t border-slate-50 flex justify-between">
               <Button variant="outline" onClick={() => setViewingReport(null)}>Dismiss</Button>
               <Button icon={Download} onClick={() => window.print()}>Export Brief</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const MarketingModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [promptInput, setPromptInput] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [assets, setAssets] = useState<MarketingAsset[]>([]);

  const handleGenerate = async (input: string) => {
    if (!input.trim()) return;
    setIsGenerating(true);
    const isImage = /image|photo|picture|banner|ad visual/i.test(input);
    try {
        if (isImage) {
            const imageBase64 = await generateMarketingImage(input);
            if (imageBase64) {
                setAssets(prev => [{
                    id: Date.now().toString(), channel: 'Ad', title: 'Asset Node', content: 'Visual synthesized.', tags: ['Visual'], status: 'Ready', timestamp: 'Just now', isImage: true, imageData: imageBase64
                } as any, ...prev]);
            }
        } else {
            const newAssets = await generateMarketingCampaign(user, input);
            setAssets(prev => [...newAssets, ...prev]);
        }
    } catch (e) { console.error(e); }
    setIsGenerating(false);
    setPromptInput('');
  };

  const handleEditImage = async (id: string, imageData: string) => {
    if (!editPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const newImage = await editStrategicImage(imageData, editPrompt);
      if (newImage) {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, imageData: newImage } as any : a));
      }
    } catch (e) { console.error(e); }
    setIsGenerating(false);
    setEditPrompt('');
    setEditingId(null);
  };

  return (
    <div className="animate-reveal h-full flex flex-col py-10 px-6 lg:px-12 overflow-hidden">
       <div className="flex items-center justify-between border-b pb-8 mb-8 shrink-0">
          <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Tactical Deployment</h2>
       </div>
       <div className="flex-1 flex gap-10 overflow-hidden">
          <div className="w-96 flex flex-col gap-8 shrink-0 text-left">
             <div className="p-10 bg-[#0F172A] rounded-[2.5rem] text-white">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8">Deploy Tactical Asset</h4>
                <textarea 
                   className="w-full p-6 rounded-[1.5rem] border border-white/10 bg-white/5 outline-none h-52 resize-none text-sm text-white placeholder:text-slate-600 mb-8"
                   placeholder={`e.g. 'Draft a LinkedIn campaign for our target: ${user.dna.targetCustomer}'`}
                   value={promptInput}
                   onChange={(e) => setPromptInput(e.target.value)}
                />
                <Button fullWidth size="lg" className="rounded-full" onClick={() => handleGenerate(promptInput)} isLoading={isGenerating}>Generate</Button>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-6 space-y-10 pb-20">
              {assets.map((asset) => (
                  <div key={asset.id} className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-premium animate-reveal">
                      <div className="flex justify-between items-start mb-10 text-left">
                          <h4 className="font-bold text-xl text-slate-900 font-serif italic">{asset.channel} Prototype</h4>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{asset.timestamp}</span>
                      </div>
                      {(asset as any).isImage ? (
                          <div className="space-y-6">
                            <div className="w-full aspect-video rounded-[2rem] overflow-hidden border-8 border-slate-50">
                                <img src={(asset as any).imageData} className="w-full h-full object-cover" alt="Tactical visual"/>
                            </div>
                            <div className="flex gap-3">
                                <Input 
                                  placeholder="Refine visual..." 
                                  value={editingId === asset.id ? editPrompt : ''}
                                  onChange={(e: any) => { setEditingId(asset.id); setEditPrompt(e.target.value); }}
                                />
                                <Button variant="secondary" onClick={() => handleEditImage(asset.id, (asset as any).imageData)} isLoading={isGenerating && editingId === asset.id}>
                                  <Wand2 size={16} />
                                </Button>
                            </div>
                          </div>
                      ) : (
                          <div className="text-base text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50/50 p-10 rounded-[2rem] text-left">
                              {asset.content}
                          </div>
                      )}
                  </div>
              ))}
          </div>
       </div>
    </div>
  );
};
