
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Zap, FileText, Plus, Loader2, Info, Activity, TrendingUp, AlertTriangle, Shield, ExternalLink, Map as MapIcon, Target, Crosshair, ArrowUpRight
} from 'lucide-react';
import { Card, Button, Modal } from './UI';
import { MarketBubbleMatrix, PorterFiveForces, SalesAreaChart, RealMapWidget } from './Charts';
import { User, StrategicReport, MarketingAsset } from '../types';
import { fetchRealTimeIntelligence, generateStrategicReport, generateMarketingCampaign } from '../services/gemini';
import { db } from '../services/database';
import { SimpleMarkdown } from './Markdown';

export const useLiveIntelligence = (
  user: User, 
  type: 'competitors' | 'market' | 'alerts' | 'overview' | 'social', 
  fallback: any
) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fetchRealTimeIntelligence(user, type);
        if (mounted && result) setData(result);
      } catch (e) { console.error(e); }
      finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [user.id, type]);

  return { data, loading };
};

export const CompetitorModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'competitors', { competitors: [] });
  const mapMarkers = useMemo(() => (data.competitors || []).map((c: any) => ({
    lat: parseFloat(c.latitude), lng: parseFloat(c.longitude), title: c.name, info: c.location
  })), [data.competitors]);

  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Competitive Radar</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      <div className="h-[400px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-premium"><RealMapWidget markers={mapMarkers} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.competitors?.map((comp: any, i: number) => (
          <Card key={i} title={comp.name} headerAction={
            <div className="flex gap-2">
               <button onClick={() => window.open(comp.url, '_blank')} className="p-3 bg-slate-950 text-white rounded-2xl hover:bg-brand-blue transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-xl">
                  Visit Site <ArrowUpRight size={14} />
               </button>
            </div>
          }>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map(type => (
                  <div key={type} className={`p-5 rounded-3xl border ${type === 'Strengths' ? 'border-emerald-100 bg-emerald-50/20' : type === 'Threats' ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100 bg-slate-50/30'}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${type === 'Strengths' ? 'text-emerald-500' : type === 'Threats' ? 'text-rose-500' : 'text-slate-400'}`}>{type}</p>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{comp.swot?.[type.toLowerCase()]?.[0] || 'Analyzing rival...'}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" fullWidth onClick={() => onAnalyze(`Deep audit of ${comp.name}`)}>Synthesize Audit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const SocialPulseModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'social', { sentiment: { score: 50, label: 'Stable' }, trends: [], signals: { threats: [], strikeZones: [], opportunities: [], weaknesses: [] } });
  
  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Competitive Pulse</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Social Sentiment" className="md:col-span-1">
          <div className="text-center py-6">
            <p className="text-7xl font-serif italic font-bold text-slate-950">{data.sentiment?.score}%</p>
            <p className="text-xs font-bold text-brand-blue uppercase mt-3 tracking-[0.2em]">{data.sentiment?.label}</p>
          </div>
        </Card>
        <Card title="Engagement Trends" className="md:col-span-2">
          <div className="h-44"><SalesAreaChart data={data.trends} /></div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Strike Zones (Opportunities)" className="border-emerald-100 bg-emerald-50/5">
          <div className="space-y-4">
            {data.signals?.strikeZones?.map((s: string, i: number) => (
              <div key={i} className="flex gap-4 p-5 bg-white rounded-[2rem] border border-emerald-100 text-slate-700 text-sm font-bold shadow-sm group hover:-translate-y-1 transition-transform cursor-default">
                <Crosshair size={20} className="text-emerald-500 shrink-0" /> {s}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Risk Vectors (Threats)" className="border-rose-100 bg-rose-50/5">
          <div className="space-y-4">
            {data.signals?.threats?.map((s: string, i: number) => (
              <div key={i} className="flex gap-4 p-5 bg-white rounded-[2rem] border border-rose-100 text-slate-700 text-sm font-bold shadow-sm group hover:-translate-y-1 transition-transform cursor-default">
                <Shield size={20} className="text-rose-500 shrink-0" /> {s}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export const MarketModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'market', { matrix: [], porters: [], geoDemand: [] });
  
  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Market Dynamics</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <Card title="Porter's Five Forces" headerAction={<Shield size={18} className="text-slate-300" />}>
             <div className="h-[320px]"><PorterFiveForces data={data.porters} /></div>
          </Card>
          <Card title="Institutional Heatmap (Demand Intensity)">
             <div className="h-[380px] bg-white rounded-[2.5rem] overflow-hidden relative border border-slate-50 shadow-premium">
                <div className="absolute top-6 left-6 z-10 bg-slate-950 text-white px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl">Recon Active</div>
                <RealMapWidget markers={data.geoDemand?.map((g: any) => ({ ...g, title: `${g.title} (${g.intensity}%)` }))} />
             </div>
          </Card>
        </div>
        <Card title="Growth Matrix" className="h-full">
           <div className="h-full min-h-[600px]"><MarketBubbleMatrix data={data.matrix} /></div>
        </Card>
      </div>
    </div>
  );
};

export const MarketingModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [prompt, setPrompt] = useState('');
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { db.artifacts.listMarketingAssets(user.id).then(setAssets); }, [user.id]);

  const handleGen = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await generateMarketingCampaign(user, prompt);
      await db.artifacts.saveMarketingAssets(user.id, res);
      setAssets(prev => [...res, ...prev]);
      setPrompt('');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col py-10 px-6 lg:px-12 overflow-hidden bg-slate-50/30">
      <div className="border-b pb-8 mb-10 shrink-0"><h2 className="text-4xl font-serif font-bold text-slate-900 italic">Tactical Deployment</h2></div>
      <div className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden">
        <div className="w-full lg:w-96 shrink-0">
          <Card title="Asset Brief">
            <textarea 
              className="w-full p-6 rounded-[2.5rem] bg-slate-950 text-white text-sm h-56 mb-6 outline-none focus:ring-4 focus:ring-brand-blue/20 transition-all font-medium" 
              placeholder="Deploy asset brief... e.g. 'Social banner for Q4 expansion'" 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
            />
            <Button fullWidth onClick={handleGen} isLoading={loading} size="lg" className="rounded-full shadow-xl">Synthesize Asset</Button>
          </Card>
        </div>
        <div className="flex-1 overflow-y-auto space-y-10 pb-32 custom-scrollbar pr-2">
          {assets.map(a => (
            <Card key={a.id} title={a.title} noPadding>
              <div className="p-8 space-y-6">
                 {a.isImage ? (
                    <div className="aspect-video w-full bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl group cursor-pointer">
                       <img src={a.imageData} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Asset" />
                    </div>
                 ) : (
                    <div className="text-slate-700 font-medium leading-relaxed text-sm bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 italic shadow-sm">"{a.content}"</div>
                 )}
                 <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-2">
                       <span className="px-4 py-1.5 rounded-full bg-brand-blue/10 text-[9px] font-bold text-brand-blue uppercase tracking-widest">{a.channel}</span>
                       {a.tags.map(t => <span key={t} className="px-4 py-1.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t}</span>)}
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{a.timestamp}</span>
                 </div>
              </div>
            </Card>
          ))}
          {assets.length === 0 && !loading && (
             <div className="h-full flex flex-col items-center justify-center opacity-10 py-32">
                <Zap size={64} className="mb-6" />
                <p className="text-2xl font-serif font-bold italic">Awaiting Deployment Mandate</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AlertsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'overview', { alerts: [] });
  
  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar bg-slate-50/30">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Command Signals</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto pb-32">
        {data.alerts?.map((alert: any, i: number) => (
          <Card 
            key={i} 
            title={alert.title} 
            headerAction={
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] ${
                alert.category === 'Threat' ? 'bg-rose-50 text-rose-500 shadow-sm border border-rose-100' : 
                alert.category === 'Opportunity' ? 'bg-blue-50 text-brand-blue shadow-sm border border-blue-100' : 'bg-amber-50 text-amber-500 shadow-sm border border-amber-100'
              }`}>
                {alert.category}
              </span>
            }
          >
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 shadow-xl ${
                  alert.category === 'Threat' ? 'bg-rose-500 text-white' : 
                  alert.category === 'Opportunity' ? 'bg-brand-blue text-white' : 'bg-amber-500 text-white'
                }`}>
                  {alert.category === 'Threat' ? <AlertTriangle size={28} /> : 
                   alert.category === 'Opportunity' ? <Zap size={28} /> : <TrendingUp size={28} />}
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{alert.time || 'SYNCHRONOUS'}</p>
                   <p className="text-slate-700 font-medium leading-relaxed text-base italic">"{alert.desc}"</p>
                </div>
              </div>
              
              <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl group hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Target size={16} className="text-brand-blue" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Tactical Maneuver</p>
                </div>
                <p className="text-sm font-bold text-white leading-relaxed">{alert.strategicMove}</p>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" size="sm" fullWidth className="rounded-2xl" onClick={() => onAnalyze(`Audit vector: ${alert.title}`)}>Analyze Risk</Button>
                <Button variant="secondary" size="sm" fullWidth className="rounded-2xl" onClick={() => onAnalyze(`Draft response for: ${alert.title}`)}>Draft Response</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const ReportsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [reports, setReports] = useState<StrategicReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewing, setViewing] = useState<StrategicReport | null>(null);

  useEffect(() => { db.artifacts.listReports(user.id).then(setReports); }, [user.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateStrategicReport(user);
      await db.artifacts.saveReport(user.id, res);
      setReports(prev => [res, ...prev]);
      setViewing(res);
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Mandate Archive</h2>
        <Button icon={Plus} onClick={handleGenerate} isLoading={isGenerating}>Synthesize Brief</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-40">
        {reports.map(r => (
          <div key={r.id} onClick={() => setViewing(r)} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-premium hover:shadow-float transition-all cursor-pointer group text-left flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="w-14 h-14 bg-slate-950 text-white rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-brand-blue transition-colors shadow-xl"><FileText size={24} /></div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 italic group-hover:text-brand-blue transition-colors line-clamp-2">{r.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic line-clamp-3">"{r.summary}"</p>
            </div>
            <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{r.date}</span>
               <ArrowUpRight size={18} className="text-slate-200 group-hover:text-brand-blue transition-colors" />
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.title || "Board Briefing"}>
        {viewing && <div className="space-y-6"><SimpleMarkdown>{viewing.content}</SimpleMarkdown></div>}
      </Modal>
    </div>
  );
};
