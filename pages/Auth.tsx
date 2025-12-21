
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
  ArrowUpRight,
  Linkedin,
  Twitter,
  Instagram,
  RefreshCcw
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
    productSummary: '',
    socialProfiles: { linkedin: '', twitter: '', instagram: '' }
  });

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const updateSocial = (k: string, v: string) => setForm(p => ({ ...p, socialProfiles: { ...p.socialProfiles, [k]: v } }));

  const handleSync = async () => {
    if (!form.website || form.website.length < 3) {
      setError("Please enter a valid website to sync.");
      return;
    }
    setError(null);
    let sanitizedUrl = form.website.trim();
    if (!/^https?:\/\//i.test(sanitizedUrl)) {
      sanitizedUrl = 'https://' + sanitizedUrl;
      setForm(p => ({ ...p, website: sanitizedUrl }));
    }
    triggerAiExtraction(sanitizedUrl);
  };

  const triggerAiExtraction = async (url: string) => {
    if (isAiProcessing) return;
    setIsAiProcessing(true);
    setStatusMessage("Grounding Strategic DNA...");
    try {
      const analysis = await analyzeBusinessWebsite(url);
      if (analysis) {
        setForm(prev => ({
          ...prev,
          companyName: analysis.companyName || prev.companyName,
          industry: INDUSTRIES.find(i => i.toLowerCase() === analysis.industry?.toLowerCase()) || prev.industry,
          businessModel: MODELS.find(m => m.toLowerCase() === analysis.businessModel?.toLowerCase()) || prev.businessModel,
          productSummary: analysis.summary || prev.productSummary,
          competitiveIntensity: analysis.competitiveIntensity || prev.competitiveIntensity,
          socialProfiles: {
            linkedin: analysis.socials?.linkedin || prev.socialProfiles.linkedin,
            twitter: analysis.socials?.twitter || prev.socialProfiles.twitter,
            instagram: analysis.socials?.instagram || prev.socialProfiles.instagram,
          }
        }));
        setStatusMessage("Institutional DNA Synced.");
      } else {
        setStatusMessage("Sync failed. Model returned no data.");
      }
    } catch (e) {
      console.warn("Extraction failed", e);
      setStatusMessage("Manual input required.");
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const newUser: UserType = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        name: form.name, email: form.email,
        companyName: form.companyName || 'Private Entity',
        industry: form.industry, size: 'Startup (2-10)', region: 'Global', country: 'USA', language: 'English',
        dna: {
          ...form,
          brandIdentity: { tone: 'Executive', colors: 'Navy', vibe: 'Elite' },
          competitorPreference: 'Global', challenges: [],
          permissions: { allowWebScraping: form.allowScraping, allowCompetitorAnalysis: true, allowRealTimeAlerts: form.allowAlerts },
          lastAnalysisDate: new Date().toISOString()
        }
      };
      const res = await db.auth.register(newUser, form.password);
      onLogin(res);
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
           <Logo />
           <div className="text-center space-y-2">
              <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight italic">Hub Login</h2>
              <p className="text-slate-400 text-sm">Restore strategic command session.</p>
           </div>
           {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs border border-rose-100">{error}</div>}
           <form onSubmit={(e) => { e.preventDefault(); setLoading(true); db.auth.login(form.email, form.password).then(onLogin).catch(err => setError(err.message)).finally(() => setLoading(false)); }} className="space-y-6">
              <Input label="Institutional Email" type="email" value={form.email} onChange={(e: any) => update('email', e.target.value)} required />
              <Input label="Access Key" type="password" value={form.password} onChange={(e: any) => update('password', e.target.value)} required />
              <Button type="submit" fullWidth size="lg" className="rounded-full shadow-2xl" isLoading={loading}>Access Hub</Button>
           </form>
           <button onClick={() => onNavigate(AppRoute.REGISTER)} className="w-full text-xs font-bold text-slate-300 uppercase tracking-widest hover:text-brand-blue mt-8">Initialize New Hub</button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Identity', icon: User },
    { id: 2, title: 'DNA', icon: Building2 },
    { id: 3, title: 'Sync', icon: Sparkles }
  ];

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      <div className="hidden lg:flex w-[400px] bg-slate-50 border-r border-slate-100 flex-col p-12 justify-between">
         <Logo />
         <div className="space-y-12">
            <h1 className="text-5xl font-serif italic text-slate-900 leading-tight">Strategic <br/><span className="text-slate-300">Command.</span></h1>
            <div className="space-y-6">
               {steps.map(s => (
                 <div key={s.id} className={`flex items-center gap-4 transition-all duration-700 ${step === s.id ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step === s.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-200 text-slate-500'}`}>
                       <s.icon size={18} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.title}</p>
                 </div>
               ))}
            </div>
         </div>
         <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><Command size={12} /> v1.022</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-20 md:px-24 flex flex-col items-center">
         <div className="w-full max-w-xl space-y-12">
            {statusMessage && (
               <div className="bg-blue-50 text-brand-blue text-[10px] p-5 rounded-2xl flex items-center gap-4 border border-blue-100/50 animate-reveal">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="font-bold uppercase tracking-widest">{statusMessage}</span>
               </div>
            )}

            <div className="min-h-[400px]">
                {step === 1 && (
                  <div className="space-y-8 animate-reveal">
                    <h2 className="text-4xl font-serif italic font-bold text-slate-900">Principal Identity</h2>
                    <div className="space-y-6">
                       <Input label="Name" value={form.name} onChange={(e: any) => update('name', e.target.value)} placeholder="Full Name" />
                       <Input label="Email" type="email" value={form.email} onChange={(e: any) => update('email', e.target.value)} placeholder="firm@email.com" />
                       <Input label="Password" type="password" value={form.password} onChange={(e: any) => update('password', e.target.value)} placeholder="••••••••" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-reveal">
                    <div className="flex items-center justify-between">
                      <h2 className="text-4xl font-serif italic font-bold text-slate-900">Entity DNA</h2>
                    </div>
                    
                    <div className="space-y-6 text-left">
                       <div className="relative group">
                          <Input label="Website URL" value={form.website} onChange={(e: any) => update('website', e.target.value)} placeholder="yourfirm.com" className="pr-32" />
                          <button 
                            onClick={handleSync}
                            disabled={isAiProcessing}
                            className="absolute right-2 bottom-1.5 h-9 px-4 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-blue transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                             {isAiProcessing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                             Sync DNA
                          </button>
                       </div>

                       {error && <p className="text-rose-500 text-xs font-medium bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>}

                       <div className="grid grid-cols-2 gap-4">
                          <Input label="Firm Name" value={form.companyName} onChange={(e: any) => update('companyName', e.target.value)} isLoading={isAiProcessing && !form.companyName} />
                          <Select label="Sector" options={INDUSTRIES} value={form.industry} onChange={(e: any) => update('industry', e.target.value)} />
                       </div>
                       
                       <div className="space-y-4 pt-4 border-t border-slate-50">
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Institutional Channels</p>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative group">
                                <Linkedin size={14} className="absolute left-4 top-[3.25rem] text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                                <Input label="LinkedIn" value={form.socialProfiles.linkedin} onChange={(e: any) => updateSocial('linkedin', e.target.value)} className="pl-10 text-xs" placeholder="URL" />
                            </div>
                            <div className="relative group">
                                <Twitter size={14} className="absolute left-4 top-[3.25rem] text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                                <Input label="Twitter" value={form.socialProfiles.twitter} onChange={(e: any) => updateSocial('twitter', e.target.value)} className="pl-10 text-xs" placeholder="URL" />
                            </div>
                            <div className="relative group">
                                <Instagram size={14} className="absolute left-4 top-[3.25rem] text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                                <Input label="Instagram" value={form.socialProfiles.instagram} onChange={(e: any) => updateSocial('instagram', e.target.value)} className="pl-10 text-xs" placeholder="URL" />
                            </div>
                         </div>
                       </div>

                       <div className="pt-4 border-t border-slate-50">
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Strategy Engine Summary</label>
                         <textarea 
                           className={`w-full p-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none h-24 text-sm font-medium transition-all ${isAiProcessing && !form.productSummary ? 'animate-pulse' : ''}`}
                           placeholder="Institutional DNA context..."
                           value={form.productSummary}
                           onChange={(e: any) => update('productSummary', e.target.value)}
                         />
                       </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-reveal text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                       <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-4xl font-serif italic font-bold text-slate-900">Lock Command</h2>
                    <p className="text-slate-400 text-sm">Mandate ready for {form.companyName || 'Entity'}. Intelligence bypass and grounding active.</p>
                  </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
               {step > 1 && <button onClick={() => setStep(step - 1)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Back</button>}
               <Button 
                  onClick={step === 3 ? handleRegister : () => setStep(step + 1)} 
                  size="lg" className="rounded-full px-10 h-16 shadow-xl ml-auto"
                  isLoading={loading}
               >
                  {step === 3 ? 'Seal Hub' : 'Proceed'} <ArrowRight size={18} className="ml-3" />
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};
