
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Loader2, Target, ArrowRight, ChevronLeft, Sparkles, Send, History, Trash2, Cpu, BookOpen, Presentation, Scale, Shield, Zap, Globe, MapPin, Building2, Crosshair, BarChart3, Linkedin, Twitter, Instagram, Users, FileText, PanelLeftOpen, PanelLeftClose, Layout, Search, Megaphone, Palette, Rocket, Database, Settings as SettingsIcon, Save, ShieldCheck, Image, Share2, Paperclip, X, TrendingUp, AlertTriangle, TrendingDown, Radio, Activity, BarChart, Flag, Quote, Eye, Trophy, ArrowUpRight, Compass, RefreshCw, Lock, Mail, ExternalLink, Calendar, Copy, Download, Layers, LayoutGrid, Megaphone as AdIcon, Mail as EmailIcon, Calendar as CalendarIcon, Type as TextIcon, Image as ImageIcon, Maximize2
} from 'lucide-react';
import { Card, Button, Skeleton, Input, Modal, Select } from './UI';
import { MarketBubbleMatrix, PorterFiveForces, SalesAreaChart, RealMapWidget, StockAlphaChart, BenchmarkGroupedBarChart } from './Charts';
import { User, StrategicReport, MarketingAsset, Message, ArtifactData, BusinessDNA, ProjectFile } from '../types';
import { fetchRealTimeIntelligence, generateStrategicReport, generateMarketingCampaign, getExecutiveConsultation, fetchStockIntelligence, searchStockTicker } from '../services/gemini';
import { db, Consultation } from '../services/database';
import { SimpleMarkdown } from './Markdown';
import { ArtifactRenderer } from './Artifacts';

export const useLiveIntelligence = (user: User, type: 'competitors' | 'market' | 'alerts' | 'overview' | 'social', fallback: any) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchRealTimeIntelligence(user, type);
        if (mounted && result && Object.keys(result).length > 0) setData(result);
      } catch (e) { console.error(e); }
      finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [user.id, type]);
  return { data, loading, refetch: () => fetchRealTimeIntelligence(user, type).then(setData) };
};

const ModuleSkeleton = () => (
  <div className="p-12 lg:p-20 space-y-12 animate-fade-in bg-white">
    <Skeleton height="20px" width="180px" className="rounded-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <Skeleton height="500px" className="rounded-[24px]" />
      <Skeleton height="500px" className="rounded-[24px]" />
    </div>
  </div>
);

// --- STOCK INTELLIGENCE MODULE ---
export const StockIntelligenceModule: React.FC<{ user: User }> = ({ user }) => {
  const [intel, setIntel] = useState<any>(null);
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('1D');
  const tickRef = useRef<any>(null);

  useEffect(() => {
    if (!user.dna.stockTicker) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchStockIntelligence(user.dna.stockTicker!);
        setIntel(res);
        setLiveHistory(res.history || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.dna.stockTicker, range]);

  useEffect(() => {
    if (liveHistory.length > 0 && !loading && intel?.marketStatus !== 'Closed') {
      tickRef.current = setInterval(() => {
        setLiveHistory(prev => {
          const last = prev[prev.length - 1];
          if (!last) return prev;
          const newVal = last.v + (Math.random() - 0.5) * 1.2;
          const next = [...prev, { m: `${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}`, v: newVal, vol: Math.floor(Math.random() * 500) + 100 }];
          return next.length > 50 ? next.slice(1) : next;
        });
      }, 3000);
    }
    return () => clearInterval(tickRef.current);
  }, [loading, liveHistory.length === 0, intel?.marketStatus]);

  if (!user.dna.stockTicker) {
    return (
      <div className="h-full flex items-center justify-center p-20 text-center font-inter text-slate-900">
        <div className="max-w-md space-y-8 animate-reveal">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
            <TrendingUp size={32} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight italic">No Equity Linked</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"Link corporate stock in calibration to enable equity signals."</p>
        </div>
      </div>
    );
  }

  if (loading) return <ModuleSkeleton />;

  const currentPrice = liveHistory[liveHistory.length - 1]?.v || 0;
  const firstPrice = liveHistory[0]?.v || 1;
  const change = currentPrice - firstPrice;
  const changePct = (change / firstPrice) * 100;

  return (
    <div className={`h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-16 bg-white text-left custom-scrollbar font-inter`}>
       <header className="border-b border-[#F1F5F9] pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-slate-950 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest">{user.dna.stockTicker}</span>
             <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${intel?.marketStatus === 'Closed' ? 'bg-slate-100' : 'bg-emerald-50'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${intel?.marketStatus === 'Closed' ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></div>
                <span className="text-[9px] font-bold uppercase tracking-widest">{intel?.marketStatus || 'Active'}</span>
             </div>
          </div>
          <div className="flex items-baseline gap-6 text-slate-900">
            <h2 className="text-6xl font-mono font-bold text-slate-950 tracking-tighter">${currentPrice.toFixed(2)}</h2>
            <div className={`text-xl font-mono font-bold ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePct.toFixed(2)}%)
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:items-end gap-6 text-slate-900">
           <div className="flex bg-slate-50 p-1 rounded-xl border border-[#F1F5F9]">
              {['1D', '5D', '1M', '6M', '1Y'].map(r => (
                <button key={r} onClick={() => setRange(r)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${range === r ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}>{r}</button>
              ))}
           </div>
        </div>
      </header>
      <div className="h-[600px] w-full"><StockAlphaChart data={[...liveHistory]} sentiment={intel?.sentiment} /></div>
    </div>
  );
};

// --- CONSULTANT MODULE ---
export const ConsultantModule: React.FC<{ user: User, initialQuery?: string | null, onQueryConsumed?: () => void }> = ({ user, initialQuery, onQueryConsumed }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (initialQuery) { handleConsult(initialQuery); if (onQueryConsumed) onQueryConsumed(); } }, [initialQuery]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [history, loading]);

  const handleConsult = async (q?: string) => {
    const finalQuery = q || query;
    if (!finalQuery.trim() || loading) return;
    setHistory(prev => [...prev, { role: 'user', content: finalQuery }]);
    setQuery('');
    setLoading(true);
    try {
      const response = await getExecutiveConsultation(user, finalQuery, history);
      setHistory(prev => [...prev, { role: 'model', content: response || 'Data Unavailable.' }]);
    } catch (e) { setHistory(prev => [...prev, { role: 'model', content: 'Protocol error.' }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex bg-white font-inter text-left overflow-hidden">
      <aside className={`bg-white border-r border-[#F1F5F9] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-[320px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2"><Layout size={14} className="text-slate-900" /><span className="text-[10px] font-bold uppercase tracking-[0.3em]">Protocols</span></div>
        </div>
        <div className="flex-1 p-6 space-y-1">
          {[{ icon: Crosshair, label: 'Sector Offensive', query: 'Develop a counter-strategy for our main competitor strike zones.' }, { icon: Scale, label: 'Risk Audit', query: 'Identify existential risks.' }].map((p, i) => (
            <button key={i} onClick={() => handleConsult(p.query)} className="w-full p-4 rounded-xl text-left hover:bg-slate-50 transition-all flex items-center gap-4">
              <p.icon size={16} className="text-slate-400" /><span className="text-[11px] font-medium text-slate-600">{p.label}</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col relative h-full bg-white">
        <div className="absolute top-6 left-6 z-30">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-10 h-10 bg-white border border-[#F1F5F9] rounded-xl flex items-center justify-center text-slate-400"><PanelLeftClose size={18} /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 lg:px-48 py-32 space-y-24 custom-scrollbar text-slate-900">
          {history.length === 0 && <div className="max-w-2xl mx-auto py-24 space-y-12 animate-fade-in"><h3 className="text-5xl font-bold tracking-tighter">Strategic Synthesis</h3><p className="text-lg text-slate-500 italic">Initialize high-stakes reasoning...</p></div>}
          {history.map((m, i) => (
            <div key={i} className={`flex gap-10 animate-reveal ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white text-slate-300' : 'bg-slate-950 text-white'}`}>{m.role === 'user' ? <Plus size={14} /> : <Zap size={14} />}</div>
              <div className="flex-1">
                <div className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  {m.role === 'user' ? <p className="text-2xl font-bold text-slate-950 italic">"{m.content}"</p> : <div className="space-y-12 ai-briefing"><SimpleMarkdown>{m.content}</SimpleMarkdown></div>}
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="flex gap-10 animate-pulse"><div className="w-8 h-8 rounded-lg bg-slate-50 border"></div><div className="flex-1 space-y-4"><div className="h-4 w-1/3 bg-slate-50 rounded-full"></div><div className="h-4 w-full bg-slate-50 rounded-full"></div></div></div>}
        </div>
        <div className="p-12 border-t border-[#F1F5F9] bg-white">
          <div className="max-w-4xl mx-auto flex gap-4 items-center">
            <div className="flex-1 relative">
              <input className="w-full h-16 bg-white border border-[#F1F5F9] rounded-2xl px-14 py-6 text-base font-medium focus:border-slate-300 outline-none" placeholder="Strategic query..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleConsult()} />
              <div className="absolute right-3 top-1/2 -translate-y-1/2"><button onClick={() => handleConsult()} disabled={loading || !query.trim()} className="h-10 w-10 flex items-center justify-center bg-slate-950 text-white rounded-xl active:scale-95 transition-all">{loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPETITOR MODULE ---
export const CompetitorModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'competitors', { competitors: [] });
  const [selectedComp, setSelectedComp] = useState<any>(null);
  if (loading) return <ModuleSkeleton />;
  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 bg-white text-left custom-scrollbar text-slate-900 font-inter">
      <header className="border-b border-[#F1F5F9] pb-12"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">Rival Intelligence Dossier</p><h2 className="text-5xl font-bold tracking-tighter">Competitive Surveillance</h2></header>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <div className="h-[500px] bg-white rounded-[24px] border border-[#F1F5F9] overflow-hidden shadow-premium"><RealMapWidget markers={[...(data.competitors || [])].map((c: any) => ({ lat: c.latitude, lng: c.longitude, title: c.name, info: `Strike Zone: ${c.analysis?.strikeZone}` }))} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {data.competitors?.map((comp: any, i: number) => (
               <div key={i} onClick={() => setSelectedComp(comp)} className={`p-10 bg-white rounded-[24px] border transition-all cursor-pointer group ${selectedComp?.name === comp.name ? 'border-[#246BFD] ring-1 ring-[#246BFD]/10' : 'border-[#F1F5F9] hover:border-slate-300'}`}>
                  <div className="flex justify-between items-start mb-10"><div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center shadow-xl group-hover:bg-[#246BFD] transition-all"><Building2 size={24}/></div><span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${comp.analysis?.threatLevel === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>{comp.analysis?.threatLevel} Threat</span></div>
                  <h4 className="text-2xl font-bold tracking-tight mb-2">{comp.name}</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-8"><MapPin size={10} /> {comp.hqLocation}</p>
                  <div className="pt-8 border-t border-[#F1F5F9] flex items-center justify-between"><p className="text-[11px] text-slate-500 font-medium italic">"{comp.recentMove}"</p><ArrowRight size={16} className="text-slate-200" /></div>
               </div>
             ))}
          </div>
        </div>
        <div className="lg:col-span-4 h-fit lg:sticky lg:top-10">
          {selectedComp ? (
            <div className="bg-white rounded-[24px] border border-[#F1F5F9] p-12 space-y-12 animate-reveal shadow-premium">
               <h3 className="text-[10px] font-bold text-[#246BFD] uppercase tracking-[0.4em]">Target Profile</h3><h2 className="text-3xl font-bold tracking-tight">{selectedComp.name}</h2>
               <div className="p-8 bg-[#0F172A] rounded-2xl text-white space-y-6"><div className="flex items-center gap-3"><Crosshair size={18} className="text-[#246BFD]" /><span className="text-[9px] font-bold uppercase tracking-widest">Strike Zone Target</span></div><p className="text-lg font-medium italic text-slate-100 leading-relaxed">"{selectedComp.analysis?.strikeZone}"</p></div>
               <div className="space-y-8">
                  <div className="space-y-4"><span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2"><Trophy size={12}/> Institutional Strengths</span><ul className="space-y-3">{selectedComp.analysis?.strengths?.map((s: string, i: number) => (<li key={i} className="text-xs text-slate-600 font-medium italic border-l border-emerald-100 pl-4 leading-relaxed">"{s}"</li>))}</ul></div>
                  <div className="space-y-4 pt-8 border-t border-[#F1F5F9]"><span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={12}/> Vulnerability Vectors</span><ul className="space-y-3">{selectedComp.analysis?.weaknesses?.map((w: string, i: number) => (<li key={i} className="text-xs text-slate-600 font-medium italic border-l border-rose-100 pl-4 leading-relaxed">"{w}"</li>))}</ul></div>
               </div>
               <div className="p-8 bg-violet-950 rounded-2xl border border-violet-900 space-y-6 shadow-xl"><div className="flex items-center gap-3 text-violet-400"><ArrowUpRight size={16} /><span className="text-[9px] font-bold uppercase tracking-widest">Recommended Strategic Move</span></div><p className="text-base font-bold text-white italic leading-tight">"{selectedComp.analysis?.suggestedStrategicMove || 'Analyzing...'}"</p></div>
               <Button fullWidth onClick={() => onAnalyze(`Generate offensive strategy for ${selectedComp.name}`)} className="h-16 rounded-full bg-[#0F172A] shadow-xl">Initialize offensive</Button>
            </div>
          ) : <div className="h-[600px] border border-dashed border-[#F1F5F9] rounded-[24px] flex flex-col items-center justify-center opacity-30 px-12"><Users size={32} className="text-slate-200 mb-6" /><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Select rival for institutional audit</p></div>}
        </div>
      </section>
    </div>
  );
};

// --- MARKET MODULE ---
export const MarketModule: React.FC<{ user: User, onAnalyze: (q: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading, refetch } = useLiveIntelligence(user, 'market', { matrix: [], porters: [], vectors: [], bottomLine: '' });
  if (loading) return <ModuleSkeleton />;
  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 bg-white text-left custom-scrollbar font-inter text-slate-900">
      <header className="border-b border-[#F1F5F9] pb-12 flex justify-between items-end"><div className="space-y-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">Structural Analysis Dashboard</p><h2 className="text-5xl font-bold tracking-tighter">Strategic Market Matrix</h2></div><Button variant="outline" icon={RefreshCw} onClick={() => refetch()} className="h-14 rounded-full px-8 border-[#F1F5F9] text-slate-400">Refresh Intelligence</Button></header>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16"><Card title="Competitive Positioning Dynamics"><div className="h-[450px]"><MarketBubbleMatrix data={[...(data.matrix || [])]} /></div></Card><Card title="Porter's Five Forces Synthesis"><div className="h-[450px]"><PorterFiveForces data={[...(data.porters || [])]} /></div></Card></section>
      <section className="space-y-12"><div className="flex items-center gap-4"><Compass size={18} className="text-[#246BFD]" /><h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Identified Strategic Vectors</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{data.vectors?.map((v: any, i: number) => (
             <div key={i} className="p-10 bg-white border border-[#F1F5F9] rounded-[2.5rem] hover:border-slate-300 transition-all hover:shadow-premium group">
                <div className="flex justify-between items-start mb-8"><div className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${v.impact === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>{v.impact} Impact</div><span className="text-[9px] font-bold uppercase text-slate-400">{v.trend}</span></div>
                <h4 className="text-2xl font-bold tracking-tight italic mb-4 group-hover:text-[#246BFD] transition-colors">"{v.title}"</h4><p className="text-sm text-slate-500 font-medium italic leading-relaxed">"{v.description}"</p>
                <div className="pt-8 mt-8 border-t border-slate-50"><button onClick={() => onAnalyze(`Vector Response: ${v.title}`)} className="text-[9px] font-bold uppercase tracking-widest text-[#246BFD] flex items-center gap-2">Authorize response <ArrowRight size={12}/></button></div>
             </div>
           ))}</div>
      </section>
      <section className="pb-40"><div className="p-12 bg-[#0F172A] rounded-[3rem] text-white space-y-8 shadow-float relative overflow-hidden"><div className="flex items-center gap-4"><Quote size={24} className="text-brand-blue" /><p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Executive Bottom Line</p></div><p className="text-3xl font-bold italic tracking-tight leading-relaxed max-w-4xl relative z-10">"{data.bottomLine || 'Finalizing synthesis...'}"</p></div></section>
    </div>
  );
};

// --- REFINED ALERTS MODULE (SIGNALS) ---
export const AlertsModule: React.FC<{ user: User, onAnalyze: (q: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'alerts', { alerts: [] });
  if (loading) return <ModuleSkeleton />;
  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 bg-white text-left custom-scrollbar font-inter text-slate-900">
      <header className="border-b border-[#F1F5F9] pb-16 space-y-8"><div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Anomaly Surveillance Protocol</p></div><h2 className="text-8xl font-bold tracking-tighter leading-[0.8]">Strategic <br/><span className="text-slate-200 font-serif italic">Signals.</span></h2></header>
      <div className="space-y-6 max-w-6xl">
        {data.alerts?.map((a: any, i: number) => (
          <div key={i} className="group relative pl-12 md:pl-20 py-4 animate-reveal">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-100 group-hover:bg-slate-200 transition-colors"></div>
            <div className={`absolute left-[-6px] top-8 w-3 h-3 rounded-full border-2 border-white ${a.priority === 'Critical' ? 'bg-rose-500' : 'bg-brand-blue'}`}></div>
            <div className="p-12 bg-white border border-[#F1F5F9] rounded-[3rem] hover:border-slate-300 transition-all flex flex-col lg:flex-row gap-16 items-start shadow-sm hover:shadow-premium text-slate-900">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono font-bold text-[#246BFD] uppercase tracking-widest">{a.time}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${a.category === 'Threat' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{a.category}</span>
                </div>
                <div className="space-y-4">
                  <h4 className="text-4xl font-bold tracking-tight italic leading-none group-hover:text-brand-blue transition-colors">"{a.title}"</h4>
                  <p className="text-lg text-slate-400 font-medium italic opacity-70 leading-relaxed max-w-3xl">"{a.desc}"</p>
                </div>
              </div>
              <div className="shrink-0 w-full lg:w-[340px] space-y-10 pt-4">
                <div className="space-y-4">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-1">Recommended Move</p>
                  <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group/move">
                    <p className="text-sm font-bold italic leading-tight relative z-10 text-slate-200 transition-colors group-hover/move:text-white">"{a.strategicMove}"</p>
                    <Zap className="absolute right-[-10px] bottom-[-10px] opacity-10 text-white group-hover/move:opacity-20 transition-opacity" size={64} />
                  </div>
                </div>
                <Button onClick={() => onAnalyze(`Action Mandate: ${a.title}`)} fullWidth variant="action" className="h-16 rounded-full shadow-lg">Authorize Mandate</Button>
              </div>
            </div>
          </div>
        ))}
        {(!data.alerts || data.alerts.length === 0) && (
          <div className="py-40 text-center opacity-20"><Zap size={48} className="mx-auto mb-6"/><p className="text-[10px] font-bold uppercase tracking-[0.5em]">Scanning for anomalies...</p></div>
        )}
      </div>
    </div>
  );
};

// --- SOCIAL PULSE MODULE ---
export const SocialPulseModule: React.FC<{ user: User, onAnalyze: (q: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'social', { userStatus: [], benchmarking: [], competitors: [], trends: [], narrativeSummary: '' });
  if (loading) return <ModuleSkeleton />;
  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 bg-white text-left custom-scrollbar font-inter text-slate-900">
      <header className="border-b border-[#F1F5F9] pb-12"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">Narrative Intelligence Hub</p><h2 className="text-5xl font-bold tracking-tighter">Strategic Social Pulse</h2></header>
      <section className="space-y-10"><div className="flex items-center gap-4 border-l-4 border-[#246BFD] pl-8"><div><h3 className="text-xl font-bold tracking-tight italic leading-none mb-2">Competitive Benchmarking</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrast Matrix</p></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"><div className="lg:col-span-8"><Card title="Benchmarking Pulse"><div className="h-[450px]"><BenchmarkGroupedBarChart data={[...(data.benchmarking || [])]} /></div></Card></div><div className="lg:col-span-4 space-y-10"><div className="p-12 bg-[#0F172A] rounded-[3rem] text-white space-y-8 shadow-float"><div className="flex items-center gap-4"><Quote size={20} className="text-brand-blue" /><p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Executive Synthesis</p></div><p className="text-2xl font-bold italic tracking-tight leading-relaxed">"{data.narrativeSummary || 'Analyzing...'}"</p></div></div></div>
      </section>
    </div>
  );
};

// --- MARKET GEN (MARKETING) MODULE ---
export const MarketingModule: React.FC<{ user: User, onAnalyze: (q: string) => void }> = ({ user, onAnalyze }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { db.artifacts.listMarketingAssets(user.id).then(setAssets); }, [user.id]);

  const marketingActions = [
    { id: 'Full Campaign', label: 'Marketing Campaign', icon: Layers, desc: 'Complete deployment strategy.' },
    { id: 'Social Posts', label: 'Social Posts', icon: Share2, desc: 'Optimized channel content.' },
    { id: 'Email Sequence', label: 'Email Sequences', icon: EmailIcon, desc: 'High-intent nurture streams.' },
    { id: 'Landing Page Copy', label: 'Landing Page Copy', icon: LayoutGrid, desc: 'Conversion authority copy.' },
    { id: 'Ads', label: 'Paid Ads', icon: AdIcon, desc: 'Multi-platform media creative.' },
    { id: 'Content Calendar', label: 'Content Calendar', icon: CalendarIcon, desc: '7-day narrative roadmap.' }
  ];

  const handleGenerate = async (type: string) => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setSelectedAction(type);
    try {
      const newAssets = await generateMarketingCampaign(user, prompt, type);
      await db.artifacts.saveMarketingAssets(user.id, newAssets);
      setAssets(prev => [...newAssets, ...prev]);
      setPrompt('');
      setSelectedAction(null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 bg-white text-left custom-scrollbar font-inter text-slate-900">
      <header className="border-b border-[#F1F5F9] pb-12 flex items-end justify-between"><div className="space-y-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">Market Gen v4.2</p><h2 className="text-6xl font-bold tracking-tighter text-slate-950">Marketing <span className="text-slate-200">Intelligence.</span></h2></div></header>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-8">
           <div className="p-10 bg-white border border-[#F1F5F9] rounded-[3rem] shadow-premium space-y-8 group hover:border-slate-300 transition-all">
              <div className="space-y-4">
                 <div className="flex items-center gap-3"><Sparkles size={16} className="text-[#246BFD]" /><label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Institutional Mandate</label></div>
                 <textarea className="w-full p-8 bg-slate-50 border border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-200 outline-none transition-all font-medium italic text-slate-700 h-48 leading-relaxed text-lg" placeholder="Identify the objective (e.g. Expand SaaS offering to APAC enterprise sector)..." value={prompt} onChange={e => setPrompt(e.target.value)} />
              </div>
           </div>
        </div>
        <div className="lg:col-span-5"><div className="grid grid-cols-2 gap-4">
              {marketingActions.map((action) => (
                <button key={action.id} onClick={() => handleGenerate(action.id)} disabled={loading || !prompt.trim()} className={`p-6 bg-white border border-[#F1F5F9] rounded-[2rem] text-left hover:border-[#246BFD] hover:shadow-premium transition-all group relative overflow-hidden active:scale-95 disabled:opacity-30`}>
                   <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-[#246BFD] group-hover:text-white transition-all"><action.icon size={20} /></div>{selectedAction === action.id && <Loader2 size={16} className="animate-spin text-[#246BFD]" />}</div>
                   <h4 className="text-sm font-bold text-slate-900 mb-1">{action.label}</h4><p className="text-[10px] text-slate-400 font-medium italic leading-tight">{action.desc}</p>
                   <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><action.icon size={80} /></div>
                </button>
              ))}
        </div></div>
      </section>
      <section className="space-y-12">
        <div className="flex items-center gap-4"><Layers size={18} className="text-[#246BFD]" /><h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Mandate Deliverables</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 pb-40">
          {assets.map((a) => (
            <div key={a.id} className="bg-white border border-[#F1F5F9] rounded-[3rem] overflow-hidden group hover:border-slate-300 transition-all hover:shadow-premium flex flex-col h-[620px]">
              {a.imageData ? <div className="h-64 bg-slate-100 relative overflow-hidden shrink-0"><img src={a.imageData} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" /></div> : <div className="h-64 bg-slate-50 flex items-center justify-center shrink-0"><ImageIcon size={40} className="text-slate-100" /></div>}
              <div className="p-10 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="px-4 py-1.5 bg-[#0F172A] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm">{a.channel}</span><span className="text-[9px] font-mono text-slate-300">{a.timestamp}</span></div>
                  <h4 className="text-2xl font-bold tracking-tight italic leading-tight text-slate-950">"{a.title}"</h4>
                  <div className="text-sm text-slate-500 font-medium italic line-clamp-[6] prose"><SimpleMarkdown>{a.content}</SimpleMarkdown></div>
                </div>
                <div className="pt-8 border-t border-slate-50 flex items-center justify-between"><div className="flex gap-2"><button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-[#246BFD] transition-all"><Copy size={16}/></button></div><button onClick={() => onAnalyze(`Refine Deliverable: ${a.title}`)} className="text-[#246BFD] hover:scale-110 transition-transform"><Sparkles size={18} /></button></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- REMAINING MODULES (REPORTS, SETTINGS) UNCHANGED IN LOGIC, REFINED UI ---
export const ReportsModule: React.FC<{ user: User, onAnalyze: (q: string) => void }> = ({ user, onAnalyze }) => {
  const [reports, setReports] = useState<StrategicReport[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => { db.artifacts.listReports(user.id).then(setReports); }, [user.id]);
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const report = await generateStrategicReport(user);
      await db.artifacts.saveReport(user.id, report);
      setReports(prev => [report, ...prev]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 bg-white text-left custom-scrollbar font-inter text-slate-900">
      <header className="border-b border-[#F1F5F9] pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"><div className="space-y-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">Strategic Archives</p><h2 className="text-5xl font-bold tracking-tighter text-slate-950">Intelligence Briefings</h2></div><Button size="lg" isLoading={loading} onClick={handleGenerate} icon={FileText} className="h-16 rounded-full px-12 bg-[#0F172A]">Synthesize New Brief</Button></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">{reports.map((r) => (<div key={r.id} className="p-12 bg-white border border-[#F1F5F9] rounded-[3rem] hover:border-slate-300 transition-all flex flex-col justify-between h-[480px] animate-reveal shadow-sm"><div className="space-y-12"><div className="flex justify-between items-start"><div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-[#246BFD] transition-all"><FileText size={24} /></div><span className="text-[9px] font-mono text-slate-300">{r.date}</span></div><div className="space-y-4"><h4 className="text-3xl font-bold text-slate-950 italic group-hover:text-[#246BFD]">"{r.title}"</h4><p className="text-sm text-slate-500 font-medium italic opacity-70">"{r.summary}"</p></div></div><div className="pt-12 border-t border-slate-50 flex items-center justify-between"><button onClick={() => onAnalyze(`Audit Briefing: ${r.title}`)} className="text-[10px] font-bold uppercase tracking-widest text-slate-950 flex items-center gap-3">Review Mandate <ArrowRight size={14} /></button></div></div>))}</div>
    </div>
  );
};

export const SettingsModule: React.FC<{ user: User, onUpdate: (u: User) => void }> = ({ user, onUpdate }) => {
  const [dna, setDna] = useState<BusinessDNA>(user.dna);
  const [loading, setLoading] = useState(false);
  const handleSave = () => { setLoading(true); onUpdate({ ...user, dna }); setTimeout(() => { setLoading(false); alert("Calibration data committed."); }, 800); };
  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 bg-white text-left custom-scrollbar font-inter text-slate-900">
      <header className="border-b border-[#F1F5F9] pb-12 flex justify-between items-end"><div className="space-y-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">Core Calibration</p><h2 className="text-5xl font-bold tracking-tighter text-slate-950">Institutional DNA</h2></div><Button size="lg" isLoading={loading} onClick={handleSave} icon={Save} className="h-16 rounded-full px-12 bg-emerald-600">Commit Changes</Button></header>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-40">
        <div className="lg:col-span-8 space-y-16">
           <Card title="Operational Parameters"><div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-slate-900"><Input label="Corporate Designation" value={dna.companyName} onChange={(e: any) => setDna({...dna, companyName: e.target.value})} /><Input label="Primary Sector" value={dna.industry} onChange={(e: any) => setDna({...dna, industry: e.target.value})} /><Select label="Entity Phase" options={['Early', 'Scaling', 'Mature']} value={dna.stage} onChange={(e: any) => setDna({...dna, stage: e.target.value})} /><Select label="Customer Vector" options={['B2B', 'B2C', 'Hybrid']} value={dna.customerSegment} onChange={(e: any) => setDna({...dna, customerSegment: e.target.value})} /></div></Card>
           <Card title="Value Proposition Mandate"><textarea className="w-full p-8 bg-slate-50 border border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-100 transition-all outline-none font-medium italic text-slate-600 leading-relaxed h-40" value={dna.valueProposition} onChange={(e: any) => setDna({...dna, valueProposition: e.target.value})} /></Card>
        </div>
      </section>
    </div>
  );
};
