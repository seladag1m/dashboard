
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, TrendingUp, AlertTriangle, Zap, Target, Activity, 
  ArrowRight, Loader2, ExternalLink, ShieldCheck, CheckCircle, Wand2, FileText, Plus, Share2,
  Map as MapIcon, ShieldX, Crosshair, TrendingDown, Eye, Users, X, Download, Info, MoveUp, MoveDown, Minus
} from 'lucide-react';
import { Card, Button, Input, Modal } from './UI';
import { MarketBubbleMatrix, CompetitorRadarChart, SalesAreaChart, RealMapWidget } from './Charts';
import { User, StrategicReport, MarketingAsset, SocialIntelligence, SocialProfileData } from '../types';
import { fetchRealTimeIntelligence, generateStrategicReport, generateMarketingCampaign } from '../services/gemini';
import { db } from '../services/database';
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
        const errStr = JSON.stringify(e).toLowerCase();
        if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("500") || errStr.includes("rpc")) {
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

const QuotaWarning = () => (
  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-reveal">
    <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
      <Info size={18} className="shrink-0" />
    </div>
    <div className="text-left">
      <p className="text-xs font-bold text-amber-900 uppercase tracking-widest">Grounding Restricted</p>
      <p className="text-[10px] text-amber-700 leading-relaxed mt-1">External intelligence proxies are restricted. AI is utilizing internal neural knowledge.</p>
    </div>
  </div>
);

export const CompetitorModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'competitors', { competitors: [] });
  const mapMarkers = useMemo(() => (data.competitors || [])
    .filter((c: any) => c.latitude && c.longitude)
    .map((c: any) => ({
      lat: parseFloat(c.latitude), lng: parseFloat(c.longitude), title: c.name, info: `Share: ${c.share}`
    })), [data.competitors]);

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Competitive Landscape</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      <div className="w-full h-[400px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden relative shadow-premium shrink-0">
        <RealMapWidget markers={mapMarkers} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {data.competitors?.map((comp: any, i: number) => (
            <Card key={i} title={comp.name}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-[250px]"><CompetitorRadarChart data={comp.radarData} /></div>
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-2">
                    {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map(type => (
                      <div key={type} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{type}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{Array.isArray(comp.swot?.[type.toLowerCase()]) ? comp.swot[type.toLowerCase()][0] : 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onAnalyze(`Audit ${comp.name}`)} fullWidth>Deep Audit</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MarketModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'market', { bubbleData: [], signals: [] });
  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Market Dynamics</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Momentum Matrix" className="lg:col-span-2 h-[450px]"><MarketBubbleMatrix data={data.bubbleData} /></Card>
        <Card title="Sector Signals">
          <div className="divide-y divide-slate-50 text-left mt-4">
            {data.signals?.map((s: any, i: number) => (
              <div key={i} className="py-4 space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                <p className="text-xs text-slate-500 italic">{s.desc}</p>
              </div>
            ))}
          </div>
        </Card>
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
        <Button icon={Plus} onClick={handleGenerate} isLoading={isGenerating}>Generate Brief</Button>
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
      <div className="border-b pb-8 mb-8 text-left shrink-0"><h2 className="text-4xl font-serif font-bold text-slate-900 italic">Tactical Deployment</h2></div>
      <div className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden">
        <div className="w-full lg:w-80 shrink-0">
          <textarea className="w-full p-6 rounded-[2rem] bg-slate-950 text-white text-sm h-48 mb-6 outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Describe campaign mandate..." value={prompt} onChange={e => setPrompt(e.target.value)} />
          <Button fullWidth onClick={handleGen} isLoading={loading}>Deploy AI</Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-6 pb-20 custom-scrollbar pr-2">
          {assets.map(a => (
            <Card key={a.id} title={a.title}>
              <div className="text-left text-sm text-slate-600 leading-relaxed italic">{a.content}</div>
              <div className="mt-4 flex gap-2">
                {a.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">{t}</span>)}
              </div>
            </Card>
          ))}
          {assets.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
               <Zap size={48} />
               <p className="mt-4 font-bold uppercase tracking-widest text-sm">Awaiting Strategic Prompt</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AlertsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'alerts', { alerts: [] });
  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Strategic Signals</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.alerts?.map((alert: any, i: number) => (
          <Card key={i} title={alert.title}>
            <div className="text-left space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  alert.category === 'Threat' ? 'bg-rose-100 text-rose-600' : 
                  alert.category === 'Opportunity' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {alert.category}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{alert.time}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">"{alert.desc}"</p>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Strategic Move</p>
                <p className="text-xs text-slate-900 font-medium">{alert.strategicMove}</p>
              </div>
              <Button variant="outline" size="sm" fullWidth onClick={() => onAnalyze(`Respond to signal: ${alert.title}`)}>Draft Response</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const SocialPulseModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, isQuotaLimited } = useLiveIntelligence(user, 'social', { 
    overallSentiment: { score: 0, label: 'Neutral', change: '0%' },
    userProfiles: [],
    competitorProfiles: [],
    strategicSignals: { threats: [], strikeZones: [], weaknesses: [], strengths: [] },
    engagementTrend: []
  });

  return (
    <div className="animate-reveal py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic text-left">Social Intelligence</h2>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      {isQuotaLimited && <QuotaWarning />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Sentiment Analysis" headerAction={<div className="flex items-center gap-2"><Activity size={16} className="text-brand-blue" /><span className="text-xl font-bold">{data.overallSentiment?.score}%</span></div>}>
          <div className="h-[200px] mt-4">
            <SalesAreaChart data={data.engagementTrend} />
          </div>
          <p className="text-xs text-slate-500 mt-4 text-left">Current Brand Perception: <strong className="text-slate-900">{data.overallSentiment?.label}</strong> ({data.overallSentiment?.change})</p>
        </Card>

        <Card title="Strategic Signals" className="lg:col-span-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                { label: 'Strike Zones', items: data.strategicSignals?.strikeZones, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Threats', items: data.strategicSignals?.threats, color: 'text-rose-600', bg: 'bg-rose-50' }
              ].map((group, idx) => (
                <div key={idx} className={`${group.bg} p-4 rounded-2xl border border-slate-100/50`}>
                   <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${group.color}`}>{group.label}</h4>
                   <ul className="space-y-2">
                      {group.items?.slice(0, 3).map((item: string, i: number) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300"></span>
                          {item}
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>
           <Button variant="ghost" size="sm" className="mt-6" onClick={() => onAnalyze("Summarize social strategic signals")} fullWidth>Full Analysis</Button>
        </Card>
      </div>
    </div>
  );
};
