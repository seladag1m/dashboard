
import React, { useState, useEffect, useRef } from 'react';
import { Logo, Button, Input, Select } from '../components/UI';
import { 
  AppRoute, 
  User as UserType, 
  BusinessModel,
  MarketIntensity,
  ConfidenceLevel,
  CustomerType
} from '../types';
import { 
  Check, 
  ArrowRight, 
  Building2, 
  Globe, 
  Target, 
  ShieldAlert, 
  Zap, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Sparkles,
  Command,
  ArrowUpRight
} from 'lucide-react';
import { db } from '../services/database';
import { analyzeBusinessWebsite } from '../services/gemini';

interface AuthPageProps {
  type: 'login' | 'register';
  onNavigate: (r: AppRoute) => void;
  onLogin: (user: UserType) => void;
}

const INDUSTRIES = ["Technology", "Financial Services", "Healthcare", "Retail", "Manufacturing", "Consulting", "Professional Services", "Energy", "Logistics"];
const MODELS: BusinessModel[] = ['SaaS', 'Services', 'Ecommerce', 'Marketplace', 'Manufacturing', 'Hybrid'];
const CUSTOMER_TYPES: CustomerType[] = ['B2B', 'B2C', 'Hybrid', 'B2G'];
const PRIORITIES = [
  { id: 'growth', label: 'Growth & Scale', impact: 'Prioritizes expansion signals and aggressive market capture logic.' },
  { id: 'expansion', label: 'Market Expansion', impact: 'Focuses on regional demand intensity and localization requirements.' },
  { id: 'defense', label: 'Competitive Defense', impact: 'Activates high-sensitivity monitoring of rival movements.' },
  { id: 'efficiency', label: 'Operational Efficiency', impact: 'Prioritizes resource optimization and margin protection frameworks.' },
  { id: 'fundraising', label: 'Fundraising Readiness', impact: 'Synthesizes intelligence for investor-grade credibility and reporting.' },
  { id: 'pmf', label: 'Product-Market Fit', impact: 'Focuses on sentiment analysis and user-engagement gaps.' }
];

export const AuthPage: React.FC<AuthPageProps> = ({ type, onNavigate, onLogin }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', 
    companyName: '', website: '', 
    industry: 'Technology', subIndustry: '', 
    businessModel: 'SaaS' as BusinessModel,
    customerType: 'B2B' as CustomerType,
    marketScope: 'Global' as 'Global' | 'Regional' | 'Local',
    growthRegions: [] as string[],
    competitiveIntensity: 'Medium' as MarketIntensity,
    strategicPriorities: [] as string[],
    confidenceLevel: 'Medium' as ConfidenceLevel,
    pricingModel: '',
    primaryGoal: '',
    allowScraping: true,
    allowAlerts: true,
    productSummary: ''
  });

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const togglePriority = (id: string) => {
    setForm(prev => {
      const current = prev.strategicPriorities;
      if (current.includes(id)) {
        return { ...prev, strategicPriorities: current.filter(x => x !== id) };
      }
      if (current.length >= 2) return prev;
      return { ...prev, strategicPriorities: [...current, id] };
    });
  };

  const handleWebsiteBlur = async () => {
    if (form.website && form.website.includes('.') && form.website.length > 5) {
      triggerAiExtraction(form.website);
    }
  };

  const triggerAiExtraction = async (url: string) => {
    if (isAiProcessing) return;
    setIsAiProcessing(true);
    setStatusMessage("Extracting Strategic DNA...");
    try {
      const analysis = await analyzeBusinessWebsite(url);
      if (analysis) {
        setForm(prev => ({
          ...prev,
          companyName: analysis.companyName || prev.companyName,
          industry: INDUSTRIES.includes(analysis.industry) ? analysis.industry : prev.industry,
          subIndustry: analysis.subIndustry || prev.subIndustry,
          businessModel: MODELS.includes(analysis.businessModel) ? analysis.businessModel as BusinessModel : prev.businessModel,
          customerType: CUSTOMER_TYPES.includes(analysis.customerType) ? analysis.customerType as CustomerType : prev.customerType,
          marketScope: ['Global', 'Regional', 'Local'].includes(analysis.marketScope) ? analysis.marketScope as any : prev.marketScope,
          growthRegions: analysis.growthRegions || prev.growthRegions,
          productSummary: analysis.summary || prev.productSummary,
          primaryGoal: analysis.primaryGoal || prev.primaryGoal,
          competitiveIntensity: ['Low', 'Medium', 'High'].includes(analysis.competitiveIntensity) ? analysis.competitiveIntensity as any : prev.competitiveIntensity,
          pricingModel: analysis.pricingModel || prev.pricingModel
        }));
        setStatusMessage("Institutional intelligence synced.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.warn("Website analysis failed", e);
      setStatusMessage("Unable to extract DNA. Manual input required.");
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage("Finalizing Strategic Lock...");
    try {
      const newUser: UserType = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        name: form.name,
        email: form.email,
        companyName: form.companyName || 'Private Entity',
        industry: form.industry,
        size: 'Startup (2-10)', 
        region: 'Global',
        country: 'USA',
        language: 'English',
        dna: {
          website: form.website,
          productSummary: form.productSummary || "Client profile active.",
          targetCustomer: form.customerType,
          businessModel: form.businessModel,
          industry: form.industry,
          subIndustry: form.subIndustry,
          marketScope: form.marketScope,
          growthRegions: form.growthRegions,
          competitiveIntensity: form.competitiveIntensity,
          strategicPriorities: form.strategicPriorities,
          confidenceLevel: form.confidenceLevel,
          pricingModel: form.pricingModel || "N/A",
          primaryGoal: form.primaryGoal,
          brandIdentity: { tone: 'Professional', colors: 'Navy/Slate', vibe: 'Modern' },
          competitorPreference: 'Global',
          challenges: [],
          permissions: {
            allowWebScraping: form.allowScraping,
            allowCompetitorAnalysis: true,
            allowRealTimeAlerts: form.allowAlerts
          },
          lastAnalysisDate: new Date().toISOString()
        }
      };
      
      const res = await db.auth.register(newUser, form.password);
      onLogin(res);
    } catch (e: any) {
      setError(e.message);
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await db.auth.login(form.email, form.password);
      onLogin(user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (type === 'login') {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-12 animate-reveal">
           <div className="flex justify-center"><Logo /></div>
           <div className="text-center space-y-2">
              <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight italic">Institutional Login</h2>
              <p className="text-slate-400 text-sm font-light">Enter credentials to restore your strategic dashboard.</p>
           </div>
           
           {error && (
             <div className="bg-rose-50 text-rose-600 text-xs p-4 rounded-xl flex items-center gap-3 border border-rose-100/50">
               <ShieldAlert size={14}/> {error}
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-6">
              <Input label="Professional Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
              <Input label="Security Passcode" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
              <Button type="submit" fullWidth size="lg" className="rounded-full shadow-2xl shadow-brand-blue/10" isLoading={loading}>Access Hub</Button>
           </form>
           <div className="text-center pt-8 border-t border-slate-50">
              <button onClick={() => onNavigate(AppRoute.REGISTER)} className="text-xs font-bold text-slate-400 hover:text-brand-blue uppercase tracking-[0.2em] transition-all">New Institutional DNA</button>
           </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Principal', icon: User, desc: 'Managing Authority' },
    { id: 2, title: 'Entity', icon: Building2, desc: 'Firm Blueprint' },
    { id: 3, title: 'Orbit', icon: Globe, desc: 'Market Scope' },
    { id: 4, title: 'Mandate', icon: Target, desc: 'Strategic Objectives' },
    { id: 5, title: 'Auth', icon: Sparkles, desc: 'Intelligence Ingest' },
    { id: 6, title: 'Lock', icon: ShieldCheck, desc: 'Final Authorization' }
  ];

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      {/* Sidebar Illustration */}
      <div className="hidden lg:flex w-[480px] bg-slate-50 border-r border-slate-100 flex-col p-16 justify-between relative overflow-hidden shrink-0">
         <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px]"></div>
         <Logo />
         <div className="space-y-16 relative z-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                  <Sparkles size={12} className="text-brand-blue" />
                  <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">AI Assisted Ingest</span>
               </div>
               <h1 className="text-6xl font-serif italic text-slate-900 leading-[0.95] tracking-tight">Define Your <br/><span className="text-slate-300">Strategy.</span></h1>
               <p className="text-slate-400 text-lg font-light leading-relaxed">Simply enter your website URL. Our engine will map your firm's DNA autonomously.</p>
            </div>
            <div className="space-y-6">
               {steps.map((s) => (
                 <div key={s.id} className={`flex items-center gap-6 transition-all duration-700 ${step === s.id ? 'opacity-100 translate-x-2' : 'opacity-20'}`}>
                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all ${step === s.id ? 'bg-slate-900 text-white shadow-2xl' : 'bg-slate-200 text-slate-500'}`}>
                       <s.icon size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{s.title}</p>
                       {step === s.id && <p className="text-sm font-medium text-slate-600">{s.desc}</p>}
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Command size={12} /> Institutional Protocol v4.2
         </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 overflow-y-auto px-8 py-20 md:px-24 md:py-32 flex flex-col items-center custom-scrollbar">
         <div className="w-full max-w-xl space-y-16">
            <div className="flex gap-1.5">
               {steps.map((s) => (
                 <div key={s.id} className={`h-1 flex-1 rounded-full transition-all duration-1000 ${step >= s.id ? 'bg-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-100'}`}></div>
               ))}
            </div>

            {statusMessage && (
               <div className="bg-blue-50/50 text-brand-blue text-xs p-6 rounded-[2rem] flex items-center gap-4 border border-blue-100/50 animate-reveal shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Loader2 size={18} className="animate-spin" /> 
                  </div>
                  <div className="flex-1">
                    <p className="font-bold uppercase tracking-widest text-[9px] mb-0.5">Strategy Engine</p>
                    <p className="text-blue-800/80 italic font-medium">{statusMessage}</p>
                  </div>
               </div>
            )}

            {step === 1 && (
              <div className="space-y-12 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-5xl font-serif italic font-bold text-slate-900 tracking-tight">Principal ID</h2>
                   <p className="text-slate-400 text-lg font-light">Establish managing authority for this institutional hub.</p>
                </div>
                <div className="space-y-8">
                   <Input label="Full Name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Elena Vance" />
                   <Input label="Institutional Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="name@firm.com" />
                   <Input label="Hub Access Key" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Minimum 12 characters" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 animate-reveal">
                <div className="space-y-4">
                   <h2 className="text-5xl font-serif italic font-bold text-slate-900 tracking-tight">Firm Blueprint</h2>
                   <p className="text-slate-400 text-lg font-light leading-relaxed">Enter your URL. AI will perform a "Strategic Extraction" to initialize your institutional profile.</p>
                </div>
                <div className="space-y-8">
                   <div className="space-y-3 relative group">
                      <div className="flex items-center justify-between px-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Firm Footprint</label>
                      </div>
                      <div className="relative">
                        <Input 
                          subtle
                          value={form.website} 
                          onChange={e => update('website', e.target.value)} 
                          onBlur={handleWebsiteBlur}
                          placeholder="https://yourfirm.com" 
                          className="h-16 text-lg pl-6 pr-12 rounded-[1.5rem] border-slate-100 bg-slate-50/50 hover:bg-white focus:bg-white transition-all shadow-sm"
                        />
                        {isAiProcessing && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-blue">
                             <Loader2 size={20} className="animate-spin" />
                          </div>
                        )}
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8">
                      <Input label="Firm Name" value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Extracting..." />
                      <Select label="Sector" options={INDUSTRIES} value={form.industry} onChange={e => update('industry', e.target.value)} />
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <Select label="Business Model" options={MODELS} value={form.businessModel} onChange={e => update('businessModel', e.target.value)} />
                      <Select label="Core Demographic" options={CUSTOMER_TYPES} value={form.customerType} onChange={e => update('customerType', e.target.value)} />
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mission Synthesis</label>
                      <textarea 
                         className="w-full p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 focus:bg-white outline-none h-32 resize-none text-sm leading-relaxed transition-all placeholder:text-slate-300"
                         placeholder="AI is summarizing your mission..."
                         value={form.productSummary}
                         onChange={e => update('productSummary', e.target.value)}
                      />
                   </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-5xl font-serif italic font-bold text-slate-900 tracking-tight">Market Orbit</h2>
                   <p className="text-slate-400 text-lg font-light">Calibrate your competitive radar and operational reach.</p>
                </div>
                <div className="space-y-8">
                   <Select label="Reach" options={['Global', 'Regional', 'Local']} value={form.marketScope} onChange={e => update('marketScope', e.target.value)} />
                   <Input label="Growth Regions" value={form.growthRegions.join(', ')} onChange={e => update('growthRegions', e.target.value.split(',').map(s => s.trim()))} placeholder="e.g. North America, EMEA" />
                   <div className="grid grid-cols-2 gap-8">
                     <Select label="Rival Density" options={['Low', 'Medium', 'High']} value={form.competitiveIntensity} onChange={e => update('competitiveIntensity', e.target.value)} />
                     <Input label="Pricing Model" value={form.pricingModel} onChange={e => update('pricingModel', e.target.value)} placeholder="e.g. Tiered Subscription" />
                   </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-5xl font-serif italic font-bold text-slate-900 tracking-tight">The Mandate</h2>
                   <p className="text-slate-400 text-lg font-light">Select primary priorities to prime the reasoning logic.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {PRIORITIES.map((p) => (
                     <button key={p.id} onClick={() => togglePriority(p.id)} className={`p-8 rounded-[2.5rem] border-2 text-left transition-all group relative overflow-hidden ${form.strategicPriorities.includes(p.id) ? 'border-brand-blue bg-blue-50/10 text-brand-blue shadow-xl' : 'border-slate-50 bg-slate-50/30 text-slate-600 hover:border-slate-100 hover:bg-white'}`}>
                        {form.strategicPriorities.includes(p.id) && <div className="absolute top-4 right-6"><Check size={16} /></div>}
                        <h4 className="font-bold text-lg mb-3 tracking-tight">{p.label}</h4>
                        <p className={`text-xs italic leading-relaxed ${form.strategicPriorities.includes(p.id) ? 'text-brand-blue/70' : 'text-slate-400'}`}>{p.impact}</p>
                     </button>
                   ))}
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Primary Success Metric</label>
                   <Input subtle value={form.primaryGoal} onChange={e => update('primaryGoal', e.target.value)} placeholder="e.g. 25% ARR growth by Q4" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-5xl font-serif italic font-bold text-slate-900 tracking-tight">Intelligence Ingest</h2>
                   <p className="text-slate-400 text-lg font-light">Authorize autonomous signal monitoring.</p>
                </div>
                <div className="space-y-6">
                   <div className="p-10 rounded-[3rem] border border-slate-100 bg-white flex items-start gap-8 cursor-pointer group hover:border-brand-blue/30 transition-all shadow-sm" onClick={() => update('allowScraping', !form.allowScraping)}>
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-all ${form.allowScraping ? 'bg-brand-blue text-white shadow-2xl' : 'bg-slate-100 text-slate-400'}`}>
                         <Globe size={28} />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-xl text-slate-900 tracking-tight mb-2">Web Reconnaissance</h4>
                         <p className="text-sm text-slate-500 italic leading-relaxed">Enable autonomous scanning of rival footprints and market shifts.</p>
                      </div>
                   </div>
                   <div className="p-10 rounded-[3rem] border border-slate-100 bg-white flex items-start gap-8 cursor-pointer group hover:border-brand-blue/30 transition-all shadow-sm" onClick={() => update('allowAlerts', !form.allowAlerts)}>
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-all ${form.allowAlerts ? 'bg-brand-blue text-white shadow-2xl' : 'bg-slate-100 text-slate-400'}`}>
                         <Zap size={28} />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-xl text-slate-900 tracking-tight mb-2">High-Stakes Signals</h4>
                         <p className="text-sm text-slate-500 italic leading-relaxed">Receive real-time intelligence on critical leadership and funding rotations.</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-12 animate-reveal text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl border border-emerald-100">
                   <ShieldCheck size={40} />
                </div>
                <div className="space-y-4">
                   <h2 className="text-5xl font-serif italic font-bold text-slate-900 tracking-tight">Institutional Lock</h2>
                   <p className="text-slate-400 text-lg font-light leading-relaxed max-w-sm mx-auto">Strategic DNA established for {form.companyName || 'the entity'}. Reasoning engine is primed.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-8">
                     {['Low', 'Medium', 'High'].map(lvl => (
                       <button key={lvl} onClick={() => update('confidenceLevel', lvl)} className={`group p-6 rounded-[2rem] border-2 transition-all ${form.confidenceLevel === lvl ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100'}`}>
                          <p className="font-bold text-lg">{lvl}</p>
                          <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-60`}>Calibration</p>
                       </button>
                     ))}
                </div>

                <div className="p-12 bg-slate-950 rounded-[3rem] text-white text-left space-y-6 shadow-3xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-brand-blue/20 transition-colors">
                      <ArrowUpRight size={80} strokeWidth={1} />
                   </div>
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-blue/50">
                        <Command size={24} />
                      </div>
                      <h4 className="font-bold text-2xl tracking-tight">Initialize Hub</h4>
                   </div>
                   <p className="text-base font-light text-slate-400 italic leading-relaxed relative z-10 pr-10">Upon authorization, the engine will map your competitive orbit and cross-reference your mandates against real-time global signals.</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-16">
               {step > 1 ? (
                 <button onClick={() => setStep(step - 1)} className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors flex items-center gap-3">
                    <ChevronLeft size={16} /> Back
                 </button>
               ) : (
                 <button onClick={() => onNavigate(AppRoute.LOGIN)} className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-brand-blue transition-colors">Strategic Member</button>
               )}
               <Button 
                  onClick={step === 6 ? handleRegister : () => setStep(step + 1)} 
                  size="lg" className="rounded-full px-12 h-20 text-lg shadow-3xl shadow-brand-blue/20"
                  isLoading={loading}
                  disabled={step === 1 && (!form.name || !form.email || !form.password)}
               >
                  {step === 6 ? 'Seal Protocol' : 'Proceed'} 
                  <ArrowRight size={22} className="ml-4" />
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};
