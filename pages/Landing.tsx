
import React from 'react';
import { ArrowRight, BarChart2, Shield, Zap } from 'lucide-react';
import { Button, Logo } from '../components/UI';
import { AppRoute } from '../types';

export const LandingPage: React.FC<{ onNavigate: (r: AppRoute) => void }> = ({ onNavigate }) => {
  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col font-sans text-text-primary selection:bg-accent-light selection:text-accent">
      {/* Nav */}
      <nav className="flex flex-row items-center justify-between px-6 sm:px-12 py-8 max-w-7xl mx-auto w-full z-20 relative">
        <Logo />
        <div className="flex gap-3 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate(AppRoute.LOGIN)}>Sign In</Button>
          <Button onClick={() => onNavigate(AppRoute.REGISTER)} size="sm" className="rounded-full shadow-lg shadow-accent/20">Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 sm:pt-36 pb-32 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in w-full relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-bg-neutral text-text-secondary text-xs font-bold tracking-wide uppercase shadow-sm">
             <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
             Enterprise AI v2.0
          </div>
          
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif font-medium text-text-headline tracking-tight leading-[1.05]">
            Strategy, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-600">Accelerated.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-light">
            The first AI consultant designed for high-stakes decision making. <br/>
            Real-time market analysis, visual data generation, and strategic frameworks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8 w-full sm:w-auto px-4 sm:px-0">
            <Button size="lg" className="rounded-full px-12 h-16 text-lg shadow-xl shadow-accent/25 hover:shadow-2xl hover:scale-105 transition-all" onClick={() => onNavigate(AppRoute.REGISTER)}>
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full px-12 h-16 text-lg bg-white border-bg-neutral" onClick={() => window.open('https://ai.google.dev', '_blank')}>
              Live Demo
            </Button>
          </div>
          
          {/* Mock UI Preview */}
          <div className="mt-24 relative perspective-1000">
             <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-white to-transparent z-20"></div>
             <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-bg-neutral transform rotate-x-6 mx-auto max-w-6xl shadow-float ring-1 ring-black/5">
                <div className="h-10 bg-bg-soft border-b border-bg-neutral flex items-center gap-2 px-5">
                   <div className="w-3 h-3 rounded-full bg-error/20"></div>
                   <div className="w-3 h-3 rounded-full bg-warning/20"></div>
                   <div className="w-3 h-3 rounded-full bg-success/20"></div>
                </div>
                <div className="relative">
                   <img src="https://picsum.photos/1600/900?grayscale" alt="App Dashboard" className="w-full h-auto opacity-90" />
                   <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent mix-blend-overlay"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-bg-soft py-32 px-6 border-t border-bg-neutral">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-20">
              <h2 className="text-4xl font-serif font-bold mb-6 text-text-headline">Why Top Firms Choose Consult AI</h2>
              <p className="text-text-secondary text-lg">Replace weeks of research with seconds of computation.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: Zap, 
                title: "Instant Frameworks", 
                desc: "Generate SWOT, PESTLE, and OKRs instantly. Our models understand context better than junior analysts." 
              },
              { 
                icon: BarChart2, 
                title: "Data Visualization", 
                desc: "Turn raw concepts into boardroom-ready charts and graphs automatically." 
              },
              { 
                icon: Shield, 
                title: "Enterprise Grade", 
                desc: "SOC2 Type II ready. Your proprietary data never trains our public models." 
              }
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-3xl bg-white border border-bg-neutral shadow-card hover:shadow-float transition-all duration-300 group hover:-translate-y-1">
                <div className="w-16 h-16 bg-accent-light text-accent rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-text-headline mb-4">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-bg-neutral py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <Logo />
           <p className="text-text-light text-sm">© 2024 CONSULT AI. All rights reserved.</p>
           <div className="flex gap-8 text-sm font-semibold text-text-secondary">
              <a href="#" className="hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="hover:text-accent transition-colors">Terms</a>
              <a href="#" className="hover:text-accent transition-colors">Contact</a>
           </div>
        </div>
      </footer>
    </div>
  );
};
