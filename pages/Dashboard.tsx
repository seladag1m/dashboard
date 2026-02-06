import React, { useState, useEffect } from 'react';
import { 
  Zap, Activity, Target, ShieldCheck, Sparkles, ArrowRight, 
  Loader2, AlertTriangle, ChevronRight, Cpu, Layers, RefreshCw, FileText
} from 'lucide-react';
import { User, Signal } from '../types';
import { Button, Card } from '../components/UI';
import { fetchRealTimeIntelligence } from '../services/gemini';

const ExpertActionCard = ({ icon: Icon, label, description, onClick }: any) => (
  <button 
    onClick={onClick}
    className="p-8 bg-white rounded-[2.5rem] border border-slate-50 flex flex-col items-start gap-4 hover:border-brand-blue hover:shadow-float group transition-all duration-500 text-left"
  >
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
      <Icon size={20} />
    </div>
    <div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-950 block mb-1">{label}</span>
      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{description}</p>
    </div>
  </button>
);

export const Dashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const res = await fetchRealTimeIntelligence(user, 'alerts');
        if (res.alerts) setSignals(res.alerts);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadAlerts();
  }, [user.id]);

  return (
    <div className="h-full overflow-y-auto px-12 py-20 space-y-16 animate-reveal max-w-7xl mx-auto font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Strategic Engine Online</p>
          </div>
          <h1 className="text-7xl lg:text-8xl font-serif font-bold text-slate-950 tracking-tight leading-[0.9]">Executive <br/><span className="text-slate-300 italic">Command.</span></h1>
        </div>
        <Button icon={Sparkles} size="lg" className="h-16 px-10 rounded-full shadow-2xl">Deploy Agent</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExpertActionCard icon={RefreshCw} label="Refine Logic" description="Optimize DNA based on current signals." onClick={() => {}} />
        <ExpertActionCard icon={Layers} label="Enhance DNA" description="Inject new institutional datasets." onClick={() => {}} />
        <ExpertActionCard icon={Cpu} label="AI Consultant" description="Deploy Pro Reasoning for board briefs." onClick={() => {}} />
        <ExpertActionCard icon={FileText} label="Mandate Hub" description="Audit tacticalroadmap progress." onClick={() => {}} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { l: 'Market State', v: user.dna.stage, i: Activity, c: 'text-emerald-500', b: 'bg-emerald-50' },
          { l: 'Signals', v: signals.length, i: Zap, c: 'text-brand-blue', b: 'bg-blue-50' },
          { l: 'Mandate', v: user.dna.strategicGoals[0] || 'Focus', i: Target, c: 'text-slate-950', b: 'bg-slate-100' },
          { l: 'Risk Protocol', v: user.dna.riskTolerance, i: ShieldCheck, c: 'text-amber-500', b: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-premium hover:-translate-y-1 transition-all group">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 group-hover:text-brand-blue">{s.l}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-mono font-bold text-slate-950">{s.v}</h3>
              <div className={`w-14 h-14 ${s.b} ${s.c} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}><s.i size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-32">
        <div className="lg:col-span-2">
          <Card title="Signal Matrix" headerAction={loading && <Loader2 size={16} className="animate-spin text-brand-blue" />}>
            <div className="divide-y divide-slate-50">
              {signals.length > 0 ? signals.map((s: any, i) => (
                <div key={i} className="py-8 flex items-start justify-between group cursor-pointer">
                  <div className="flex gap-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${s.category === 'Threat' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-brand-blue'}`}>
                      {s.category === 'Threat' ? <AlertTriangle size={20}/> : <Zap size={20}/>}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${s.category === 'Threat' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{s.category || 'SIGNAL'}</span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors">"{s.title}"</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-full group-hover:bg-brand-blue group-hover:text-white transition-all">
                     <ChevronRight size={16} />
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30 grayscale space-y-4">
                   <ShieldCheck size={48} className="mx-auto" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Horizon Clean. Monitoring Active.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="p-12 bg-brand-slate rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-brand-blue/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <div className="flex items-center gap-3 text-brand-blue mb-4 relative z-10">
                <Sparkles size={18} />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Proactive Insight</span>
             </div>
             <p className="text-2xl font-serif italic font-light relative z-10 leading-relaxed">
               "Competitive indices show a 12% drift in sector pricing. Counter-strategy suggested."
             </p>
             <button className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 relative z-10">
               Audit Vector <ArrowRight size={12} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
