
import React from 'react';
import { ArrowRight, Globe, ShieldCheck, Zap, Layers } from 'lucide-react';
import { Button, Logo } from '../components/UI';
import { AppRoute } from '../types';

export const LandingPage: React.FC<{ onNavigate: (r: AppRoute) => void }> = ({ onNavigate }) => {
  return (
    <div className="h-full bg-white overflow-y-auto selection:bg-[#0F172A] selection:text-white">
      <main className="relative">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 py-32 md:py-48 text-center space-y-12 animate-reveal">
          <div className="flex justify-center mb-16">
            <Logo />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Zap size={12} className="text-[#246BFD]" /> 
            Strategic Intelligence v4.0
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-serif text-[#0F172A] leading-[0.8] tracking-tighter">
            Executive <br/><span className="italic font-light text-slate-300">Autonomy.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
            The institutional intelligence layer for modern firms. 
            Synthesize signals, automate frameworks, and deploy elite advisory instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12">
            <Button size="lg" onClick={() => onNavigate(AppRoute.REGISTER)} className="rounded-full h-16 px-12 text-lg shadow-2xl shadow-blue-500/20">
              Create Account <ArrowRight className="ml-3 w-6 h-6" strokeWidth={2.5} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate(AppRoute.LOGIN)} className="rounded-full h-16 px-12 text-lg">Member Login</Button>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-8 pb-40 grid md:grid-cols-3 gap-24 border-t border-slate-50 pt-32">
            {[
              { icon: Globe, title: "Search Grounding", desc: "Real-time market indices and competitive signals powered by live Google Search data." },
              { icon: Layers, title: "Thinking Architecture", desc: "Complex strategic reasoning using Gemini 3 Pro with deep computational thinking budgets." },
              { icon: ShieldCheck, title: "Visual Synthesis", desc: "Generate and edit institutional-grade visuals with Gemini 2.5 Flash Image protocol." }
            ].map((f, i) => (
              <div key={i} className="space-y-6 group">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all duration-700">
                  <f.icon className="w-8 h-8" strokeWidth={1.2} />
                </div>
                <h3 className="text-3xl font-serif italic text-[#0F172A]">{f.title}</h3>
                <p className="text-lg text-slate-400 font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
        </section>
      </main>
    </div>
  );
};
