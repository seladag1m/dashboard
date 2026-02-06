import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, Loader2, Target, Sparkles, Send, Video, Image as ImageIcon,
  Monitor, Smartphone, Key, AlertCircle, Trash2, History, Plus,
  FileText, Globe, Users, Activity, MessageSquare, ShieldAlert, BarChart3,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Card, Button, Input } from './UI';
import { User, MarketingAsset, Signal, StrategicReport } from '../types';
import { 
  generateMarketingCampaign, 
  generateMarketingVideo, 
  getExecutiveConsultation, 
  fetchRealTimeIntelligence, 
  generateStrategicReport 
} from '../services/gemini';
import { db, Consultation } from '../services/database';
import { SimpleMarkdown } from './Markdown';
import { PorterFiveForces, MarketBubbleMatrix, RealMapWidget } from './Charts';

export const ConsultantModule: React.FC<{ user: User }> = ({ user }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await getExecutiveConsultation(user, input, messages);
      setMessages(prev => [...prev, { role: 'model' as const, content: response }]);
    } catch (e) {
      alert("System Interruption. Please re-establish session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
          {messages.length === 0 && (
            <div className="py-24 text-center space-y-8 animate-reveal">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-brand-slate rounded-2xl flex items-center justify-center text-brand-blue shadow-2xl relative">
                  <Sparkles size={32} className="animate-pulse" />
                </div>
              </div>
              <h2 className="text-5xl font-serif font-bold text-slate-950 italic">Strategy Hub.</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Protocol: Pro Reasoning Active</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-8 animate-reveal ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-slate-50 text-slate-400' : 'bg-brand-slate text-white'}`}>
                <Zap size={20} />
              </div>
              <div className={`max-w-2xl flex-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-8 rounded-[2rem] border ${m.role === 'user' ? 'bg-slate-50 border-slate-100 rounded-tr-none' : 'bg-white border-slate-50 shadow-premium rounded-tl-none text-slate-900 leading-relaxed'}`}>
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
      <div className="p-10 border-t border-slate-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex gap-6">
          <input 
            className="flex-1 bg-slate-50 border-transparent rounded-2xl px-8 py-5 text-sm font-medium focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
            placeholder="Brief the strategy engine..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="lg" className="rounded-2xl w-24">
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const MarketingModule: React.FC<{ user: User, onAnalyze: () => void }> = ({ user, onAnalyze }) => {
  const [prompt, setPrompt] = useState('');
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState<'standard' | 'video'>('standard');

  const handleGen = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      if (assetType === 'video') {
        if (!(await (window as any).aistudio.hasSelectedApiKey())) await (window as any).aistudio.openSelectKey();
        const video = await generateMarketingVideo(user, prompt, '16:9');
        setAssets(prev => [video, ...prev]);
      } else {
        const res = await generateMarketingCampaign(user, prompt, true);
        setAssets(prev => [...res, ...prev]);
      }
      setPrompt('');
    } catch (e) { alert("Deployment Protocol Error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col py-12 px-12 overflow-hidden bg-brand-paper">
      <div className="border-b pb-8 mb-10 shrink-0">
        <h2 className="text-4xl font-serif font-bold text-slate-900 italic">Deployment Hub</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Neural Asset Generation</p>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-12 overflow-hidden">
        <div className="w-full lg:w-96 shrink-0 space-y-6">
          <Card title="Mandate Brief">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
               <button onClick={() => setAssetType('standard')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${assetType === 'standard' ? 'bg-brand-slate text-white' : 'text-slate-400'}`}>Standard</button>
               <button onClick={() => setAssetType('video')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${assetType === 'video' ? 'bg-brand-slate text-white' : 'text-slate-400'}`}>Video</button>
            </div>
            <textarea 
              className="w-full p-6 rounded-2xl bg-brand-slate text-white text-sm h-48 mb-6 outline-none focus:ring-4 focus:ring-brand-blue/20 transition-all placeholder:text-slate-600 shadow-xl" 
              placeholder="Describe tactical intent..."
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
            />
            <Button fullWidth onClick={handleGen} isLoading={loading} size="lg" className="rounded-full h-14">Synthesize Asset</Button>
          </Card>
        </div>
        <div className="flex-1 overflow-y-auto space-y-12 pb-48 pr-4 no-scrollbar">
          {assets.map(a => (
            <div key={a.id} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-premium p-10 flex gap-10 animate-reveal">
              {(a.imageData || a.videoUrl) && (
                <div className="w-80 shrink-0 aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-xl">
                  {a.videoUrl ? <video src={a.videoUrl} controls className="w-full h-full object-cover" /> : <img src={a.imageData} className="w-full h-full object-cover" />}
                </div>
              )}
              <div className="flex-1 space-y-6">
                <h3 className="text-2xl font-serif font-bold text-slate-900 italic">{a.title}</h3>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-sm italic text-slate-600">"{a.content}"</div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="px-4 py-1.5 rounded-full bg-blue-50 text-[9px] font-bold text-brand-blue uppercase tracking-widest">{a.channel}</span>
                  <Button variant="ghost" size="sm" icon={Target} onClick={onAnalyze}>Deploy</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Implemented missing CompetitorModule
export const CompetitorModule: React.FC<{ user: User, onAnalyze: () => void }> = ({ user, onAnalyze }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchRealTimeIntelligence(user, 'competitors');
        setData(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, [user.id]);

  return (
    <div className="h-full overflow-y-auto px-12 py-20 space-y-16 animate-reveal">
      <header className="border-b pb-10">
        <h2 className="text-5xl font-serif font-bold text-slate-950 italic">Rival Mapping.</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Competitive Intelligence protocol</p>
      </header>

      {loading ? (
        <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card title="Institutional Rivals">
              <div className="divide-y divide-slate-50">
                {(data?.competitors || []).map((c: any, i: number) => (
                  <div key={i} className="py-8 flex items-start justify-between group">
                    <div className="flex gap-8">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all shadow-lg">
                        <Globe size={20} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{c.name}</h4>
                        <p className="text-xs text-slate-400 mt-2 font-medium">{c.url}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {c.swot?.strengths?.map((s: string, j: number) => (
                            <span key={j} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-full uppercase tracking-widest">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onAnalyze}>Audit</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-8">
             <Card title="Geospatial Hub" className="h-[450px]" noPadding>
                <RealMapWidget markers={data?.competitors?.map((c: any) => ({ lat: c.latitude, lng: c.longitude, title: c.name }))} />
             </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// Implemented missing MarketModule
export const MarketModule: React.FC<{ user: User, onAnalyze: () => void }> = ({ user, onAnalyze }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchRealTimeIntelligence(user, 'market');
        setData(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, [user.id]);

  return (
    <div className="h-full overflow-y-auto px-12 py-20 space-y-16 animate-reveal">
      <header className="border-b pb-10">
        <h2 className="text-5xl font-serif font-bold text-slate-950 italic">Market Logic.</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Macro Signal Synthesis</p>
      </header>

      {loading ? (
        <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card title="Momentum Matrix" className="h-[450px]">
             <MarketBubbleMatrix data={data?.bubbleData} />
          </Card>
          <Card title="Structural Forces" className="h-[450px]">
             <PorterFiveForces data={data?.forcesData} />
          </Card>
        </div>
      )}
    </div>
  );
};

// Implemented missing SocialPulseModule
export const SocialPulseModule: React.FC<{ user: User, onAnalyze: () => void }> = ({ user, onAnalyze }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchRealTimeIntelligence(user, 'social');
        setData(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, [user.id]);

  return (
    <div className="h-full overflow-y-auto px-12 py-20 space-y-16 animate-reveal">
      <header className="border-b pb-10">
        <h2 className="text-5xl font-serif font-bold text-slate-950 italic">Social Pulse.</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Institutional Sentiment Analysis</p>
      </header>

      {loading ? (
        <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card title="Sentiment Vector" className="h-[450px]">
             <MarketBubbleMatrix data={data?.sentimentData} />
          </Card>
          <Card title="Engagement Delta" className="h-[450px]">
             <PorterFiveForces data={data?.deltaData} />
          </Card>
        </div>
      )}
    </div>
  );
};

// Implemented missing AlertsModule
export const AlertsModule: React.FC<{ user: User, onAnalyze: () => void }> = ({ user, onAnalyze }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchRealTimeIntelligence(user, 'alerts');
        if (res.alerts) setAlerts(res.alerts);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, [user.id]);

  return (
    <div className="h-full overflow-y-auto px-12 py-20 space-y-16 animate-reveal">
      <header className="border-b pb-10">
        <h2 className="text-5xl font-serif font-bold text-slate-950 italic">Signal Stream.</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Real-time Anomaly Detection</p>
      </header>

      {loading ? (
        <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>
      ) : (
        <div className="space-y-6">
          {alerts.map((a: any, i: number) => (
            <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-50 shadow-premium flex items-start justify-between group hover:border-brand-blue transition-all cursor-pointer">
              <div className="flex gap-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${a.category === 'Threat' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {a.category === 'Threat' ? <ShieldAlert size={24} /> : <Zap size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ${a.category === 'Threat' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{a.category}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{a.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 italic leading-relaxed">"{a.desc}"</p>
                </div>
              </div>
              <Button variant="ghost" icon={ChevronRightIcon} onClick={onAnalyze}>Strategic Move</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Implemented missing ReportsModule
export const ReportsModule: React.FC<{ user: User, onAnalyze: () => void }> = ({ user, onAnalyze }) => {
  const [reports, setReports] = useState<StrategicReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReports(db.reports.list());
  }, []);

  const handleSynthesize = async () => {
    setLoading(true);
    try {
      const report = await generateStrategicReport(user);
      db.reports.save(report);
      setReports(prev => [report, ...prev]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full overflow-y-auto px-12 py-20 space-y-16 animate-reveal">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b pb-10">
        <div>
          <h2 className="text-5xl font-serif font-bold text-slate-950 italic">Board Briefs.</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Synthesized Strategic Mandates</p>
        </div>
        <Button icon={Plus} size="lg" onClick={handleSynthesize} isLoading={loading}>Synthesize Briefing</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {reports.map(r => (
          <Card key={r.id} title={r.title} headerAction={<span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{r.date}</span>}>
            <div className="space-y-6">
               <p className="text-sm text-slate-500 italic">"{r.summary}"</p>
               <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 max-h-60 overflow-hidden relative">
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
                  <SimpleMarkdown>{r.content}</SimpleMarkdown>
               </div>
               <Button fullWidth variant="outline" onClick={onAnalyze}>Open Mandate</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};