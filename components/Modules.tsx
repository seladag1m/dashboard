
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Zap, FileText, Plus, Loader2, Info, Activity, TrendingUp, AlertTriangle
} from 'lucide-react';
import { Card, Button, Modal } from './UI';
import { MarketBubbleMatrix, CompetitorRadarChart, SalesAreaChart, RealMapWidget } from './Charts';
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
  const [isQuotaLimited, setIsQuotaLimited] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const load = async () => {
      try {
        const result = await fetchRealTimeIntelligence(user, type);
        if (mounted && result) {
          setData((prev: any) => ({ ...prev, ...result }));
          setIsQuotaLimited(false);
        }
      } catch (e: any) {
        if (mounted) setIsQuotaLimited(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user.id, type]);

  return { data, loading, isQuotaLimited };
};

const QuotaWarning = () => (
  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-reveal">
    <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
      <Info size={18} className="shrink-0" />
    </div>
    <div className="text-left">
      <p className="text-xs font-bold text-amber-900 uppercase tracking-widest text-left">Grounding Restricted</p>
      <p className="text-[10px] text-amber-700 leading-relaxed mt-1 text-left">External intelligence proxies are limited. AI is using deep-sector reasoning.</p>
    </div>
  </div>
);

export const CompetitorModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'competitors', { competitors: [] });
  const mapMarkers = useMemo(() => (data.competitors || [])
    .filter((c: any) => c.latitude && c.longitude)
    .map((c: any) => ({
      lat: parseFloat(c.latitude), lng: parseFloat(c.longitude), title: c.name, info: `Location: ${c.location}`
    })), [data.competitors]);

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Competitive Radar</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      <div className="w-full h-[400px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden relative shadow-premium shrink-0">
        <RealMapWidget markers={mapMarkers} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.competitors?.map((comp: any, i: number) => (
          <Card key={i} title={comp.name}>
            <div className="text-left space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map(type => (
                  <div key={type} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{type}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{comp.swot?.[type.toLowerCase()]?.[0] || 'N/A'}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => onAnalyze(`Deep audit ${comp.name}`)} fullWidth>Strategic Audit</Button>
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

  useEffect(() => {
    db.artifacts.listReports(user.id).then(setReports);
  }, [user.id]);

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
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 pb-40 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Strategic Briefs</h2>
        <Button icon={Plus} onClick={handleGenerate} isLoading={isGenerating}>New Brief</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reports.map(r => (
          <div key={r.id} onClick={() => setViewing(r)} className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-premium hover:-translate-y-1 transition-all cursor-pointer text-left h-full">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6"><FileText size={18} /></div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{r.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 italic">"{r.summary}"</p>
          </div>
        ))}
      </div>
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.title || "Brief"}>
        {viewing && <div className="space-y-6 text-left"><SimpleMarkdown>{viewing.content}</SimpleMarkdown></div>}
      </Modal>
    </div>
  );
};

export const MarketingModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [prompt, setPrompt] = useState('');
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    db.artifacts.listMarketingAssets(user.id).then(setAssets);
  }, [user.id]);

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
    <div className="animate-reveal h-full flex flex-col py-10 px-6 lg:px-12 overflow-hidden">
      <div className="border-b pb-8 mb-8 text-left shrink-0"><h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Tactical Deployment</h2></div>
      <div className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden">
        <div className="w-full lg:w-80 shrink-0">
          <textarea className="w-full p-6 rounded-[2rem] bg-slate-950 text-white text-sm h-48 mb-6 outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Describe campaign objective (e.g., Q4 Product Launch)..." value={prompt} onChange={e => setPrompt(e.target.value)} />
          <Button fullWidth onClick={handleGen} isLoading={loading}>Draft with AI</Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-6 pb-20 custom-scrollbar pr-2">
          {assets.map(a => (
            <Card key={a.id} title={a.title}>
              <div className="text-left text-sm text-slate-600 leading-relaxed italic">{a.content}</div>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-brand-blue uppercase">{a.channel}</span>
                {a.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">{t}</span>)}
              </div>
            </Card>
          ))}
          {assets.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
               <Zap size={48} />
               <p className="mt-4 font-bold uppercase tracking-widest text-sm">Awaiting Strategic Signal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fixed Circular Exports with actual implementations
export const MarketModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'market', { matrix: [] });
  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Market Dynamics</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      <div className="h-[500px] bg-white rounded-[3rem] border border-slate-100 p-8 shadow-premium">
        <MarketBubbleMatrix data={data.matrix} />
      </div>
    </div>
  );
};

export const AlertsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'alerts', { alerts: [] });
  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Signal Stream</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      <div className="space-y-6">
        {data.alerts?.map((alert: any, i: number) => (
          <Card key={i} title={alert.title}>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">{alert.category}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{alert.time}</span>
            </div>
            <p className="text-sm text-slate-600 mb-6 text-left">{alert.desc}</p>
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-left">
              <p className="text-[10px] font-bold text-brand-blue uppercase mb-1">Recommended Maneuver</p>
              <p className="text-xs text-slate-700 italic font-medium">{alert.strategicMove}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => onAnalyze(`Mitigation for ${alert.title}`)}>Draft Response</Button>
            </div>
          </Card>
        ))}
        {data.alerts?.length === 0 && !loading && (
          <div className="py-20 text-center opacity-20">
            <AlertTriangle size={48} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-sm">No critical signals detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const SocialPulseModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'social', { sentiment: { label: 'Neutral', score: 50 }, trends: [] });
  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Social Sentiment</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Overall Pulse">
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-slate-900 mb-2">{data.sentiment?.score}%</p>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">{data.sentiment?.label}</p>
          </div>
        </Card>
        <Card title="Growth Momentum" className="md:col-span-2">
           <div className="h-40">
              <SalesAreaChart data={data.trends} />
           </div>
        </Card>
      </div>
    </div>
  );
};
