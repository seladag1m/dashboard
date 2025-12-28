
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Globe, Zap, FileText, Plus, Loader2, Info, Activity, TrendingUp, AlertTriangle, Shield, ExternalLink, Map as MapIcon, Target, Crosshair, ArrowUpRight, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon,
  Instagram, Linkedin, Twitter, Share2, Search, BarChart4, Video, Monitor, Smartphone, Key, AlertCircle as AlertIcon,
  User as UserIcon, Send, History, Trash2, ChevronRight, MessageSquare, ArrowRight, Users
} from 'lucide-react';
import { Card, Button, Modal, Input } from './UI';
import { MarketBubbleMatrix, PorterFiveForces, SalesAreaChart, RealMapWidget } from './Charts';
import { User, StrategicReport, MarketingAsset } from '../types';
import { fetchRealTimeIntelligence, generateStrategicReport, generateMarketingCampaign, generateMarketingVideo, getExecutiveConsultation } from '../services/gemini';
import { db, Consultation } from '../services/database';
import { SimpleMarkdown } from './Markdown';

// Custom hook to fetch intelligence data from Gemini API
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
      setLoading(true);
      try {
        const result = await fetchRealTimeIntelligence(user, type);
        if (mounted && result) setData(result);
      } catch (e) { console.error(e); }
      finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [user.id, type]);

  return { data, loading, refetch: () => fetchRealTimeIntelligence(user, type).then(setData) };
};

// Module for executive consultation with conversation history
export const ConsultantModule: React.FC<{ user: User }> = ({ user }) => {
  const [history, setHistory] = useState<Consultation[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(db.consultations.list(user.id));
  }, [user.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
  };

  const loadSession = (session: Consultation) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setInput('');
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    db.consultations.delete(id);
    setHistory(db.consultations.list(user.id));
    if (currentSessionId === id) startNewSession();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user' as const, content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    try {
      const response = await getExecutiveConsultation(user, input, messages);
      const finalMessages = [...newMessages, { role: 'model' as const, content: response }];
      setMessages(finalMessages);

      // Persist Session
      const sessionId = currentSessionId || Date.now().toString();
      const session: Consultation = {
        id: sessionId,
        userId: user.id,
        title: input.length > 40 ? input.substring(0, 37) + "..." : input,
        timestamp: new Date().toLocaleDateString(),
        messages: finalMessages
      };
      
      db.consultations.save(session);
      setHistory(db.consultations.list(user.id));
      if (!currentSessionId) setCurrentSessionId(sessionId);
      
    } catch (e) {
      alert("Consultant link severed. Reconnecting...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex bg-white overflow-hidden selection:bg-brand-blue/10 selection:text-brand-blue font-inter">
      {/* Session History Sidebar */}
      <aside className={`transition-all duration-500 border-r border-slate-100 flex flex-col bg-slate-50/50 ${showHistory ? 'w-80' : 'w-0 overflow-hidden border-none'}`}>
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">History</h3>
          </div>
          <button onClick={startNewSession} className="p-2 hover:bg-white rounded-xl text-brand-blue transition-colors shadow-sm bg-white/50" title="New Session">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
          {history.length === 0 ? (
            <div className="py-20 text-center space-y-2 opacity-30">
              <MessageSquare size={24} className="mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No prior sessions</p>
            </div>
          ) : (
            history.map((s) => (
              <div 
                key={s.id} 
                onClick={() => loadSession(s)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all flex items-start justify-between ${currentSessionId === s.id ? 'bg-white shadow-premium border border-slate-100' : 'hover:bg-white/60'}`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className={`text-xs font-bold truncate ${currentSessionId === s.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{s.title}</p>
                  <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest mt-1">{s.timestamp}</p>
                </div>
                <button onClick={(e) => deleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-300 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative">
        {/* Toggle History Button */}
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="absolute left-6 top-6 z-20 p-3 bg-white border border-slate-100 rounded-2xl shadow-premium text-slate-400 hover:text-slate-900 transition-all hover:scale-105 active:scale-95"
        >
          <History size={18} />
        </button>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-12 pb-24">
            {messages.length === 0 && (
              <div className="py-24 text-center space-y-12 animate-reveal">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center text-brand-blue shadow-2xl relative">
                    <Sparkles size={40} className="animate-pulse" />
                    <div className="absolute inset-0 bg-brand-blue/10 blur-xl"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-6xl font-satoshi font-bold text-slate-950 tracking-tight leading-tight">Strategy <span className="text-slate-300 italic">Hub.</span></h2>
                  <p className="text-[10px] font-inter font-medium text-slate-400 uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                    Authorized context established. Executive synthesis engine active.
                  </p>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-8 animate-reveal ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-slate-50 border border-slate-100 text-slate-400' : 'bg-slate-950 text-white shadow-brand-blue/10'}`}>
                  {m.role === 'user' ? <UserIcon size={20} /> : <Zap size={20} />}
                </div>
                <div className={`max-w-2xl flex-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-10 rounded-[2.5rem] border ${m.role === 'user' ? 'bg-slate-50 border border-slate-100 rounded-tr-none text-slate-600 italic' : 'bg-white border-slate-50 shadow-premium rounded-tl-none font-inter font-medium text-slate-900 leading-relaxed'}`}>
                    <SimpleMarkdown>{m.content}</SimpleMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 items-center animate-pulse text-brand-blue">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Synthesizing Mandate...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <div className="p-12 border-t border-slate-50 bg-white/80 backdrop-blur-xl sticky bottom-0 shrink-0">
          <div className="max-w-4xl mx-auto flex gap-6">
            <div className="flex-1 relative group">
              <input 
                className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-10 py-6 text-base font-inter font-medium focus:ring-4 focus:ring-brand-blue/5 focus:bg-white focus:border-brand-blue/10 transition-all outline-none placeholder:text-slate-300 shadow-inner"
                placeholder="Brief the strategy engine..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <kbd className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[8px] font-mono text-slate-400 font-bold">ENTER</kbd>
              </div>
            </div>
            <Button onClick={handleSend} disabled={loading || !input.trim()} size="lg" className="rounded-[2.5rem] w-28 h-20 p-0 shadow-2xl hover:scale-105 active:scale-95 transition-transform">
              {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Module for competitor analysis and mapping
export const CompetitorModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'competitors', { competitors: [] });
  const mapMarkers = useMemo(() => {
    const competitors = Array.isArray(data.competitors) ? data.competitors : [];
    return competitors.map((c: any) => ({
      lat: parseFloat(c.latitude), lng: parseFloat(c.longitude), title: c.name, info: c.location
    }));
  }, [data.competitors]);

  const competitors = Array.isArray(data.competitors) ? data.competitors : [];

  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
      <div className="flex items-center justify-between border-b pb-8">
        <div>
           <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Competitive Radar</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Real-time sector surveillance</p>
        </div>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      <div className="h-[400px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-premium"><RealMapWidget markers={mapMarkers} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
        {competitors.map((comp: any, i: number) => (
          <Card key={i} title={comp.name} headerAction={
            <button onClick={() => window.open(comp.url, '_blank')} className="p-3 bg-slate-950 text-white rounded-2xl hover:bg-brand-blue transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-xl">
               Visit Site <ArrowUpRight size={14} />
            </button>
          }>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'strengths', l: 'Strengths', c: 'emerald' },
                  { k: 'weaknesses', l: 'Weaknesses', c: 'amber' },
                  { k: 'opportunities', l: 'Opportunities', c: 'blue' },
                  { k: 'threats', l: 'Threats', c: 'rose' }
                ].map(type => (
                  <div key={type.k} className={`p-5 rounded-3xl border border-${type.c}-100 bg-${type.c}-50/10`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 text-${type.c}-500`}>{type.l}</p>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{comp.swot?.[type.k]?.[0] || 'Analyzing rival...'}</p>
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

// Module for market dynamics and five forces analysis
export const MarketModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'market', { matrix: [], porters: [], geoDemand: [] });
  
  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar bg-slate-50/30">
      <div className="flex items-center justify-between border-b pb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Market Dynamics</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Macro-environmental Analysis</p>
        </div>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card title="Competitive Positioning" className="h-[500px]">
           <div className="h-full pb-10">
              <MarketBubbleMatrix data={data.matrix} />
           </div>
        </Card>
        <Card title="Porter's Five Forces" className="h-[500px]">
           <div className="h-full pb-10">
              <PorterFiveForces data={data.porters} />
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
        <div className="lg:col-span-2 h-[500px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-premium">
           <RealMapWidget markers={(data.geoDemand || []).map((d: any) => ({ lat: d.lat, lng: d.lng, title: d.title }))} />
        </div>
        <Card title="Strategic Synthesis">
           <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Dominant Signal</p>
                 <p className="text-sm font-bold text-slate-900 leading-relaxed italic">"Market forces indicate a shift towards institutional efficiency. Strike zones are emerging in regional sectors."</p>
              </div>
              <Button fullWidth variant="secondary" onClick={() => onAnalyze("Perform deep market simulation based on current Five Forces data.")}>Deploy Simulation</Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

// Sub-component for social metrics visualization
const SocialMetricCard = ({ title, sentiment, analysis, isPrimary }: any) => {
  const sections = [
    { key: 'strengths', label: 'Strengths', color: 'emerald', icon: CheckCircle2 },
    { key: 'weaknesses', label: 'Weaknesses', color: 'amber', icon: AlertCircle },
    { key: 'threats', label: 'Threats', color: 'rose', icon: AlertTriangle },
    { key: 'strikeZones', label: 'Strike Zones', color: 'blue', icon: Crosshair }
  ];

  return (
    <div className={`bg-white rounded-[3rem] border shadow-premium overflow-hidden transition-all duration-500 hover:shadow-float flex flex-col ${isPrimary ? 'border-brand-blue/30 scale-100' : 'border-slate-100'}`}>
       <div className={`p-8 border-b flex items-center justify-between ${isPrimary ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isPrimary ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/20' : 'bg-slate-950 text-white'}`}>
                {isPrimary ? <Sparkles size={18} /> : <UserIcon size={18} />}
             </div>
             <div>
                <h3 className="text-lg font-satoshi font-bold text-slate-950 tracking-tight">{title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isPrimary ? 'Corporate Core' : 'Market Rival'}</p>
             </div>
          </div>
          <div className="text-right">
             <span className="text-3xl font-mono font-bold text-slate-950 tracking-tighter">{sentiment?.score || '0'}%</span>
             <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${sentiment?.score > 70 ? 'text-emerald-500' : 'text-slate-400'}`}>{sentiment?.label || 'Calibrating'}</p>
          </div>
       </div>
       
       <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {sections.map((sec) => (
             <div key={sec.key} className={`p-6 rounded-[2rem] border transition-all ${isPrimary ? `bg-${sec.color}-50/10 border-${sec.color}-100` : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                   <sec.icon size={14} className={`text-${sec.color}-500`} />
                   <h4 className={`text-[10px] font-bold uppercase tracking-widest text-${sec.color}-600`}>{sec.label}</h4>
                </div>
                <div className="space-y-3">
                   {(analysis?.[sec.key] || []).slice(0, 3).map((item: string, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start group/item">
                         <div className={`mt-1.5 w-1 h-1 rounded-full bg-${sec.color}-300 shrink-0`}></div>
                         <p className="text-[11px] text-slate-600 font-medium leading-tight">{item}</p>
                      </div>
                   ))}
                   {(!analysis?.[sec.key] || analysis[sec.key].length === 0) && (
                      <p className="text-[10px] text-slate-300 italic">No signal detected.</p>
                   )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// Module for social pulse analysis with narrative gaps
export const SocialPulseModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'social', { 
    brand: { sentiment: { score: 0, label: 'Initializing' }, analysis: {} },
    competitors: [],
    trends: [] 
  });
  
  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar bg-slate-50/30">
      <div className="flex items-center justify-between border-b pb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 italic leading-tight">Social Comparative <br/><span className="text-slate-300">Intelligence.</span></h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2">
            <Activity size={12} className="text-brand-blue" /> Institutional surveillance active across {user.dna.manualCompetitors.length + 1} entities.
          </p>
        </div>
        {loading ? <Loader2 className="animate-spin text-brand-blue" /> : (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Sync</span>
          </div>
        )}
      </div>
      
      {/* Landscape Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <Card title="Market Share of Narrative" className="lg:col-span-2">
            <div className="h-64 mt-4">
               <SalesAreaChart data={Array.isArray(data.trends) ? data.trends : []} />
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.companyName} Engagement</span>
                  </div>
               </div>
               <p className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.2em]">6 Month Strategic Window</p>
            </div>
         </Card>
         
         <div className="space-y-6">
            <div className="p-10 bg-slate-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-brand-blue/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center gap-3 text-brand-blue mb-4 relative z-10">
                  <Target size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Strategic Pivot</span>
               </div>
               <p className="text-2xl font-source-serif italic font-light relative z-10 leading-relaxed text-left">
                 "Analyze narrative gaps between your brand and {data.competitors?.[0]?.name || 'market rivals'} to capture high-yield strike zones."
               </p>
               <Button variant="ghost" className="mt-8 text-white hover:bg-white/10 p-0 h-auto relative z-10" onClick={() => onAnalyze("Summarize the biggest social narrative gaps between me and my rivals.")}>
                  Identify Gaps <ArrowRight size={14} className="ml-2" />
               </Button>
            </div>
            
            <Card title="Pulse Integrity">
               <div className="space-y-4">
                  {[
                    { l: 'Data Fidelity', v: 'High', c: 'text-emerald-500' },
                    { l: 'Rival Count', v: data.competitors?.length || '0', c: 'text-brand-blue' },
                    { l: 'Refresh Rate', v: 'Real-time', c: 'text-slate-400' }
                  ].map(stat => (
                    <div key={stat.l} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.l}</span>
                       <span className={`text-xs font-mono font-bold uppercase ${stat.c}`}>{stat.v}</span>
                    </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>

      <div className="space-y-12 pb-40">
         <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100"></div>
            <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.6em] whitespace-nowrap px-4">Comparative Matrix</h3>
            <div className="h-px flex-1 bg-slate-100"></div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Primary Brand Analysis */}
            <SocialMetricCard 
              title={user.companyName} 
              sentiment={data.brand?.sentiment} 
              analysis={data.brand?.analysis} 
              isPrimary 
            />
            
            {/* Rival Analysis */}
            {data.competitors && data.competitors.length > 0 ? (
               <SocialMetricCard 
                  title={data.competitors[0].name} 
                  sentiment={data.competitors[0].sentiment} 
                  analysis={data.competitors[0].analysis} 
               />
            ) : (
               <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-20 opacity-30 grayscale">
                  <Users size={48} className="text-slate-400 mb-6" />
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Scanning Rival Narratives...</p>
               </div>
            )}
         </div>

         {/* Secondary Competitor Carousel (if many) */}
         {data.competitors && data.competitors.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {data.competitors.slice(1).map((comp: any) => (
                  <SocialMetricCard 
                     key={comp.name}
                     title={comp.name} 
                     sentiment={comp.sentiment} 
                     analysis={comp.analysis} 
                  />
               ))}
            </div>
         )}
      </div>
    </div>
  );
};

// Module for generating marketing assets (copy, image, video)
export const MarketingModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [prompt, setPrompt] = useState('');
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [assetType, setAssetType] = useState<'standard' | 'video'>('standard');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loadingMsg, setLoadingMsg] = useState('Initiating neural synthesis...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => { 
    db.artifacts.listMarketingAssets(user.id).then(res => setAssets(Array.isArray(res) ? res : [])); 
  }, [user.id]);

  const loadingMessages = [
    "Calibrating visual vectors...",
    "Engaging neural rendering engine...",
    "Applying institutional brand filters...",
    "Synthesizing motion dynamics...",
    "Refining board-level aesthetic...",
    "Finalizing deployment assets..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let i = 0;
      interval = setInterval(() => {
        setLoadingMsg(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGen = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      if (assetType === 'video') {
        // Enforce key selection per guidelines
        if (!(await (window as any).aistudio.hasSelectedApiKey())) {
          await (window as any).aistudio.openSelectKey();
          // Assume success and proceed as per instructions
        }

        const videoAsset = await generateMarketingVideo(user, prompt, videoAspectRatio);
        await db.artifacts.saveMarketingAssets(user.id, [videoAsset]);
        setAssets(prev => [videoAsset, ...prev]);
        setPrompt('');
      } else {
        const res = await generateMarketingCampaign(user, prompt, includeVisuals);
        const resArray = Array.isArray(res) ? res : [];
        await db.artifacts.saveMarketingAssets(user.id, resArray);
        setAssets(prev => [...resArray, ...prev]);
        setPrompt('');
      }
    } catch (e: any) { 
      const msg = (e?.message || JSON.stringify(e)).toLowerCase();
      console.error("Synthesis error:", msg);
      
      // Specifically handle the 'entity not found' / error code 6 per requirements
      if (msg.includes("requested entity was not found") || msg.includes("error code: 6") || msg.includes("not_found")) {
        setErrorMsg("Strategic engine requires a valid paid project key. Resetting key selection.");
        await (window as any).aistudio.openSelectKey();
      } else {
        setErrorMsg("Neural calibration failed. Please verify protocol inputs and retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col py-10 px-6 lg:px-12 overflow-hidden bg-slate-50/30">
      <div className="border-b pb-8 mb-10 shrink-0">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Tactical Deployment</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Neural Asset Generation Hub</p>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden">
        <div className="w-full lg:w-96 shrink-0 space-y-6">
          <Card title="Mandate Brief">
            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-reveal">
                 <AlertIcon size={16} className="text-rose-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-rose-700 uppercase leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 mb-6">
               <button 
                  onClick={() => setAssetType('standard')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${assetType === 'standard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Copy + Image
               </button>
               <button 
                  onClick={() => setAssetType('video')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${assetType === 'video' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Social Video
               </button>
            </div>

            <textarea 
              className="w-full p-8 rounded-[2.5rem] bg-slate-950 text-white text-sm h-56 mb-8 outline-none focus:ring-4 focus:ring-brand-blue/20 transition-all font-medium placeholder:text-slate-600 shadow-2xl" 
              placeholder={assetType === 'video' ? "Describe the video narrative (e.g. 'Sleek tech expansion in Europe')" : "Describe the asset intent (e.g. 'Nordic market expansion announcement')"}
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
            />
            
            {assetType === 'standard' ? (
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-all ${includeVisuals ? 'bg-brand-blue text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                       <ImageIcon size={18} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-900">Neural Visuals</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gemini 2.5 protocol</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setIncludeVisuals(!includeVisuals)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${includeVisuals ? 'bg-brand-blue shadow-lg shadow-blue-500/20' : 'bg-slate-300'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${includeVisuals ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Video Aspect Ratio</p>
                 <div className="flex gap-3">
                    <button 
                       onClick={() => setVideoAspectRatio('16:9')}
                       className={`flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${videoAspectRatio === '16:9' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                       <Monitor size={20} />
                       <span className="text-[10px] font-bold">16:9</span>
                    </button>
                    <button 
                       onClick={() => setVideoAspectRatio('9:16')}
                       className={`flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${videoAspectRatio === '9:16' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                       <Smartphone size={20} />
                       <span className="text-[10px] font-bold">9:16</span>
                    </button>
                 </div>
                 <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                    <Key size={10} className="text-brand-blue" />
                    <span>Paid Key Protocol Required</span>
                 </div>
                 <a 
                   href="https://ai.google.dev/gemini-api/docs/billing" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block text-[8px] font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest underline underline-offset-4 ml-1"
                 >
                   Review Billing Documentation
                 </a>
              </div>
            )}

            <Button fullWidth onClick={handleGen} isLoading={loading} size="lg" className="rounded-full shadow-2xl h-16">
              {assetType === 'video' ? 'Synthesize Video' : 'Synthesize Asset'}
            </Button>
          </Card>
          
          <div className="p-10 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[3rem] space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-brand-blue">
               <Sparkles size={20} className="animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Asset Logic</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-bold italic">
              {assetType === 'video' 
                ? "\"Social video generation using Veo 3.1 may take up to 3 minutes. Motion synthesis requires institutional paid keys.\""
                : "\"For maximum fidelity, include the target demographic and specific core value proposition in your brief.\""}
            </p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-12 pb-48 custom-scrollbar pr-4">
          {assets.map(a => (
            <div key={a.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden animate-reveal group">
              <div className="p-10 flex flex-col md:flex-row gap-10">
                 {/* Visual Media Section */}
                 {(a.imageData) || (a.videoUrl) ? (
                    <div className={`w-full ${a.aspectRatio === '9:16' ? 'md:w-64' : 'md:w-96'} shrink-0`}>
                       <div className={`${a.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'} bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl relative group/media`}>
                          {a.videoUrl ? (
                             <video 
                               src={a.videoUrl} 
                               controls 
                               className="w-full h-full object-cover"
                               poster={a.imageData}
                             />
                          ) : (
                             <img src={a.imageData} className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-[2000ms]" alt="Generated Visual" />
                          )}
                          <div className="absolute top-4 left-4 z-10">
                             <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                                {a.videoUrl ? <Video size={12} className="text-brand-blue" /> : <ImageIcon size={12} className="text-brand-blue" />}
                                <span className="text-[9px] font-bold text-white uppercase tracking-widest">{a.videoUrl ? 'Motion Asset' : 'Still Asset'}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : null}

                 {/* Content Section */}
                 <div className="flex-1 space-y-8 flex flex-col justify-between">
                    <div>
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-serif font-bold text-slate-950 italic">{a.title}</h3>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{a.timestamp}</span>
                       </div>
                       <div className="text-slate-700 font-medium leading-relaxed text-sm bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-50 italic shadow-inner">
                          {a.content || "Asset content synthesized."}
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="flex gap-2">
                          <span className="px-5 py-2 rounded-full bg-brand-blue/10 text-[9px] font-bold text-brand-blue uppercase tracking-widest border border-brand-blue/10">{a.channel}</span>
                          {(a.tags || []).map(t => <span key={t} className="px-5 py-2 rounded-full bg-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200/50">{t}</span>)}
                       </div>
                       <Button variant="ghost" size="sm" icon={ExternalLink} className="rounded-xl">Deploy Asset</Button>
                    </div>
                 </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {assets.length === 0 && !loading && (
             <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 grayscale">
                <div className="w-32 h-32 border-4 border-dashed border-slate-900 rounded-full flex items-center justify-center animate-spin-slow">
                   <Zap size={48} />
                </div>
                <p className="text-2xl font-serif font-bold italic mt-10">Awaiting Deployment Protocol</p>
             </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-8">
              <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-brand-blue/10 animate-pulse"></div>
                 <Loader2 className="animate-spin text-white" size={40} />
              </div>
              <div className="text-center space-y-2">
                 <p className="text-xs font-bold text-slate-900 uppercase tracking-[0.4em] animate-pulse">{loadingMsg}</p>
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                   {assetType === 'video' ? 'Synthesizing motion vectors may take several minutes...' : 'Calibrating institutional visual metrics...'}
                 </p>
              </div>
              {assetType === 'video' && (
                <div className="w-64 h-1 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-blue animate-progress-indeterminate"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(350%); width: 30%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Module for command signals and anomaly detection
export const AlertsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'overview', { alerts: [] });
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];
  
  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar bg-slate-50/30">
      <div className="flex items-center justify-between border-b pb-8">
        <div>
           <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Command Signals</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active sector-wide anomaly detection</p>
        </div>
        {loading && <Loader2 className="animate-spin text-brand-blue" />}
      </div>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto pb-48">
        {alerts.map((alert: any, i: number) => (
          <Card 
            key={i} 
            title={alert.title} 
            headerAction={
              <span className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm border ${
                alert.category === 'Threat' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                alert.category === 'Opportunity' ? 'bg-blue-50 text-brand-blue border-blue-100' : 'bg-amber-50 text-amber-500 border-amber-100'
              }`}>
                {alert.category}
              </span>
            }
          >
            <div className="space-y-10">
              <div className="flex gap-8 items-start">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl ${
                  alert.category === 'Threat' ? 'bg-rose-500 text-white' : 
                  alert.category === 'Opportunity' ? 'bg-brand-blue text-white' : 'bg-amber-500 text-white'
                }`}>
                  {alert.category === 'Threat' ? <AlertTriangle size={32} /> : 
                   alert.category === 'Opportunity' ? <Zap size={32} /> : <TrendingUp size={32} />}
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{alert.time || 'SYNCHRONOUS SIGNAL'}</p>
                   <p className="text-slate-800 font-bold leading-relaxed text-xl italic">"{alert.desc}"</p>
                </div>
              </div>
              
              <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 shadow-2xl group hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue shadow-lg">
                     <Target size={16} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Institutional Counter-Maneuver</p>
                </div>
                <p className="text-base font-bold text-white leading-relaxed italic">"{alert.strategicMove}"</p>
              </div>
              
              <div className="flex gap-6">
                <Button variant="outline" size="lg" fullWidth className="rounded-3xl" onClick={() => onAnalyze(`Audit vector: ${alert.title}`)}>Analyze Risk Matrix</Button>
                <Button variant="secondary" size="lg" fullWidth className="rounded-3xl shadow-xl" onClick={() => onAnalyze(`Draft strategic response for: ${alert.title}`)}>Draft Response Brief</Button>
              </div>
            </div>
          </Card>
        ))}
        {alerts.length === 0 && !loading && (
           <div className="py-40 text-center opacity-10">
              <Shield size={64} className="mx-auto mb-6" />
              <p className="text-2xl font-serif font-bold italic">Horizon Clear</p>
           </div>
        )}
      </div>
    </div>
  );
};

// Module for generating board briefings and reports
export const ReportsModule: React.FC<{ user: User, onAnalyze: (c: string) => void }> = ({ user, onAnalyze }) => {
  const [reports, setReports] = useState<StrategicReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewing, setViewing] = useState<StrategicReport | null>(null);

  useEffect(() => { db.artifacts.listReports(user.id).then(res => setReports(Array.isArray(res) ? res : [])); }, [user.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateStrategicReport(user);
      if (res) {
        await db.artifacts.saveReport(user.id, res);
        setReports(prev => [res, ...prev]);
        setViewing(res);
      }
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  return (
    <div className="py-10 px-6 lg:px-12 space-y-12 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b pb-8">
        <div>
           <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Mandate Archive</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Institutional memory and synthesized briefs</p>
        </div>
        <Button icon={Plus} onClick={handleGenerate} isLoading={isGenerating} className="rounded-full shadow-xl px-8">Synthesize New Brief</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-48">
        {reports.map(r => (
          <div key={r.id} onClick={() => setViewing(r)} className="bg-white p-12 rounded-[3rem] border border-slate-50 shadow-premium hover:shadow-float transition-all cursor-pointer group text-left flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="w-16 h-16 bg-slate-950 text-white rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:bg-brand-blue transition-colors shadow-2xl group-hover:scale-105 transition-all"><FileText size={28} /></div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6 italic group-hover:text-brand-blue transition-colors line-clamp-2">{r.title}</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed italic line-clamp-3">"{r.summary}"</p>
            </div>
            <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{r.date}</span>
               <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-200 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                  <ArrowUpRight size={18} />
               </div>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.title || "Board Briefing"}>
        {viewing && <div className="space-y-8 animate-reveal"><SimpleMarkdown>{viewing.content}</SimpleMarkdown></div>}
      </Modal>
    </div>
  );
};
