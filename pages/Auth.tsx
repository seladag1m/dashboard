
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
  Search,
  Loader2,
  Settings,
  ShieldCheck,
  Info
} from 'lucide-react';
import { db } from '../services/database';
import { searchBusinessDatabase, analyzeBusinessWebsite } from '../services/gemini';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

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

  // Immediate website analysis when URL is provided
  const handleWebsiteBlur = async () => {
    if (form.website && form.website.includes('.') && !form.productSummary) {
      setStatusMessage("Analyzing entity footprint...");
      try {
        const analysis = await analyzeBusinessWebsite(form.website);
        if (analysis.summary) {
          update('productSummary', analysis.summary);
          setStatusMessage("Entity footprint analyzed successfully.");
        }
      } catch (e) {
        console.warn("Website analysis failed", e);
        setStatusMessage(null);
      }
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const data = await searchBusinessDatabase(searchQuery);
          setSearchResults(data.results || []);
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setIsSearching(false);
        }
      }, 800);
    } else {
      setSearchResults([]);
    }
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const handleSelectCompany = async (company: any) => {
    setLoading(true);
    setStatusMessage(`Restoring institutional context for ${company.name}...`);
    setForm(prev => ({
      ...prev,
      companyName: company.name || prev.companyName,
      website: company.url || prev.website,
      industry: INDUSTRIES.includes(company.industry) ? company.industry : prev.industry,
      subIndustry: company.industry || prev.subIndustry
    }));
    
    if (company.url) {
      try {
        const analysis = await analyzeBusinessWebsite(company.url);
        if (analysis.summary) {
          update('productSummary', analysis.summary);
        }
      } catch (e) {
        console.warn("Website analysis failed", e);
      }
    }

    setSearchQuery('');
    setSearchResults([]);
    setLoading(false);
    setStatusMessage(null);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage("Calibrating Business DNA...");
    try {
      const user: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        name: form.name,
        email: form.email,
        companyName: form.companyName,
        industry: form.industry,
        size: 'Startup (2-10)', 
        region: 'Global',
        country: 'USA',
        language: 'English',
        dna: {
          website: form.website,
          productSummary: form.productSummary || "Autonomous client profile.",
          targetCustomer: form.customerType,
          businessModel: form.businessModel,
          industry: form.industry,
          subIndustry: form.subIndustry,
          marketScope: form.marketScope,
          growthRegions: form.growthRegions,
          competitiveIntensity: form.competitiveIntensity,
          strategicPriorities: form.strategicPriorities,
          confidenceLevel: form.confidenceLevel,
          pricingModel: form.pricingModel || "Standard",
          primaryGoal: form.primaryGoal,
          brandIdentity: { tone: 'Professional', colors: 'Blue/White', vibe: 'Modern' },
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
      
      const res = await db.auth.register(user, form.password);
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
    setStatusMessage("Synchronizing Strategic Context...");
    try {
      const user = await db.auth.login(form.email, form.password);
      onLogin(user);
    } catch (e) {
      setError("Strategic authentication failed. Please verify credentials.");
      setStatusMessage(null);
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
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight italic">Institutional Login</h2>
              <p className="text-slate-500 text-sm font-light">Welcome back. Restoring your command dashboard.</p>
           </div>
           
           {statusMessage && (
              <div className="bg-blue-50 text-brand-blue text-xs p-4 rounded-xl flex items-center gap-3 border border-blue-100 animate-pulse">
                <Loader2 size={16} className="animate-spin" /> {statusMessage}
              </div>
           )}

           {error && (
             <div className="bg-rose-50 text-rose-600 text-xs p-4 rounded-xl flex items-center gap-3 border border-rose-100">
               <ShieldAlert size={16}/> {error}
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-6">
              <Input label="Professional Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
              <Input label="Security Passcode" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
              <Button type="submit" fullWidth size="lg" className="rounded-full" isLoading={loading}>Authenticate Access</Button>
           </form>
           <div className="text-center pt-8 border-t border-slate-50">
              <button onClick={() => onNavigate(AppRoute.REGISTER)} className="text-xs font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors">Setup New Strategic DNA</button>
           </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Identity', icon: User, desc: 'Your principal credentials.' },
    { id: 2, title: 'Entity', icon: Building2, desc: 'Institutional DNA initialization.' },
    { id: 3, title: 'Orbit', icon: Globe, desc: 'Global operational footprint.' },
    { id: 4, title: 'Mandate', icon: Target, desc: 'Immediate strategic priorities.' },
    { id: 5, title: 'Intelligence', icon: Zap, desc: 'Data ingest calibration.' },
    { id: 6, title: 'Audit', icon: Settings, desc: 'Final strategic calibration.' }
  ];

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden selection:bg-brand-blue/10">
      <div className="hidden lg:flex w-[400px] bg-slate-50 border-r border-slate-100 flex-col p-16 justify-between relative overflow-hidden shrink-0">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[100px]"></div>
         <Logo />
         <div className="space-y-12 relative z-10">
            <div className="space-y-2">
               <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.3em]">Setup Protocol</p>
               <h1 className="text-5xl font-serif italic text-slate-900 leading-tight">Define Your <br/>Strategic DNA.</h1>
               <p className="text-slate-500 text-base font-light">Consult AI calibrates its reasoning engine to your specific business coordinates.</p>
            </div>
            <div className="space-y-4">
               {steps.map((s) => (
                 <div key={s.id} className={`flex items-center gap-4 transition-all duration-700 ${step === s.id ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${step === s.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-200 text-slate-500'}`}>
                       <s.icon size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.title}</p>
                       {step === s.id && <p className="text-sm font-medium text-slate-600">{s.desc}</p>}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-20 md:px-24 md:py-32 flex flex-col items-center">
         <div className="w-full max-w-xl space-y-16">
            <div className="flex gap-2">
               {steps.map((s) => (
                 <div key={s.id} className={`h-1 flex-1 rounded-full transition-all duration-1000 ${step >= s.id ? 'bg-brand-blue shadow-lg shadow-blue-500/20' : 'bg-slate-100'}`}></div>
               ))}
            </div>

            {statusMessage && (
               <div className="bg-blue-50 text-brand-blue text-xs p-4 rounded-xl flex items-center gap-3 border border-blue-100 animate-reveal">
                  <Loader2 size={16} className="animate-spin" /> {statusMessage}
               </div>
            )}

            {step === 1 && (
              <div className="space-y-10 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-4xl font-serif italic font-bold text-slate-900">Principal ID</h2>
                   <p className="text-slate-500 text-lg font-light">The authority managing this institutional intelligence hub.</p>
                </div>
                <div className="space-y-6">
                   <Input label="Executive Full Name" value={form.name} onChange={e => update('name', e.target.value)} />
                   <Input label="Professional Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
                   <Input label="Security Passphrase" type="password" value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-4xl font-serif italic font-bold text-slate-900">Entity DNA</h2>
                   <p className="text-slate-500 text-lg font-light">Restoring your institution's profile for localized intelligence.</p>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2 relative">
                      <Input 
                        label="Firm Search" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        placeholder="Search for firm or enter URL..." 
                        icon={isSearching ? Loader2 : Search}
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                          {searchResults.map((r, i) => (
                            <button key={i} onClick={() => handleSelectCompany(r)} className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center justify-between border-b last:border-0 border-slate-50">
                              <div>
                                <h4 className="font-bold text-slate-900">{r.name}</h4>
                                <p className="text-[10px] text-slate-400">{r.url}</p>
                              </div>
                              <ChevronRight size={16} className="text-slate-200" />
                            </button>
                          ))}
                        </div>
                      )}
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <Input label="Official Firm Name" value={form.companyName} onChange={e => update('companyName', e.target.value)} />
                      <Input label="Website / Footprint" value={form.website} onChange={e => update('website', e.target.value)} onBlur={handleWebsiteBlur} />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <Select label="Sector" options={INDUSTRIES} value={form.industry} onChange={e => update('industry', e.target.value)} />
                      <Select label="Model" options={MODELS} value={form.businessModel} onChange={e => update('businessModel', e.target.value)} />
                   </div>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                      <Info size={18} className="text-brand-blue shrink-0 mt-1" />
                      <p className="text-xs text-slate-500 italic">Targeting {form.customerType} clients helps refine market signal sensitivity.</p>
                   </div>
                   <Select label="Core Customer Focus" options={CUSTOMER_TYPES} value={form.customerType} onChange={e => update('customerType', e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-4xl font-serif italic font-bold text-slate-900">Market Orbit</h2>
                   <p className="text-slate-500 text-lg font-light">Defining the operational boundaries for intelligence gathering.</p>
                </div>
                <div className="space-y-6">
                   <Select label="Operational Scope" options={['Global', 'Regional', 'Local']} value={form.marketScope} onChange={e => update('marketScope', e.target.value)} />
                   <div className="space-y-1">
                      <Input label="Key Growth Regions" value={form.growthRegions.join(', ')} onChange={e => update('growthRegions', e.target.value.split(',').map(s => s.trim()))} placeholder="e.g. North America, EU, APAC" />
                      <p className="text-[10px] text-slate-400 italic px-2">Used to calibrate Geographic Demand Intensity metrics.</p>
                   </div>
                   <Select label="Competitive Intensity" options={['Low', 'Medium', 'High']} value={form.competitiveIntensity} onChange={e => update('competitiveIntensity', e.target.value)} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-10 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-4xl font-serif italic font-bold text-slate-900">Strategic Mandate</h2>
                   <p className="text-slate-500 text-lg font-light">What are the board-level directives for this period?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {PRIORITIES.map((p) => (
                     <button key={p.id} onClick={() => togglePriority(p.id)} className={`p-6 rounded-[2rem] border-2 text-left transition-all group ${form.strategicPriorities.includes(p.id) ? 'border-brand-blue bg-blue-50/20 text-brand-blue shadow-lg' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-bold uppercase tracking-widest">{p.id}</span>
                           {form.strategicPriorities.includes(p.id) && <Check size={14} />}
                        </div>
                        <h4 className="font-bold text-lg mb-2">{p.label}</h4>
                        <p className={`text-[10px] italic leading-tight ${form.strategicPriorities.includes(p.id) ? 'text-brand-blue/70' : 'text-slate-400'}`}>{p.impact}</p>
                     </button>
                   ))}
                </div>
                <Input label="Primary Strategic Milestone" value={form.primaryGoal} onChange={e => update('primaryGoal', e.target.value)} placeholder="e.g. Capture 15% regional market share..." />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-10 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-4xl font-serif italic font-bold text-slate-900">Intelligence Ready</h2>
                   <p className="text-slate-500 text-lg font-light">Authorize autonomous data ingest protocols.</p>
                </div>
                <div className="space-y-6">
                   <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white flex items-start gap-6 cursor-pointer group hover:border-brand-blue/20 transition-all" onClick={() => update('allowScraping', !form.allowScraping)}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${form.allowScraping ? 'bg-brand-blue text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>
                         <Globe size={24} />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-900">Autonomous Web Recon</h4>
                         <p className="text-sm text-slate-500 italic leading-relaxed">System will perform periodic deep-scans of market news, funding sites, and verified competitor footprints.</p>
                      </div>
                   </div>
                   <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white flex items-start gap-6 cursor-pointer group hover:border-brand-blue/20 transition-all" onClick={() => update('allowAlerts', !form.allowAlerts)}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${form.allowAlerts ? 'bg-brand-blue text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>
                         <Zap size={24} />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-900">High-Fidelity Alerts</h4>
                         <p className="text-sm text-slate-500 italic leading-relaxed">Immediate notification of critical market shifts, rival leadership changes, or relevant regulatory updates.</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-12 animate-reveal">
                <div className="space-y-3">
                   <h2 className="text-4xl font-serif italic font-bold text-slate-900">Strategic Calibration</h2>
                   <p className="text-slate-500 text-lg font-light">Final audit of intelligence depth and advising style.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence Calibration</label>
                    <span className="text-[10px] text-brand-blue font-bold italic">Affects advising challenge level</span>
                  </div>
                  <div className="flex gap-4">
                     {['Low', 'Medium', 'High'].map(lvl => (
                       <button key={lvl} onClick={() => update('confidenceLevel', lvl)} className={`flex-1 py-5 rounded-2xl border-2 font-bold transition-all ${form.confidenceLevel === lvl ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
                          {lvl} 
                          <span className="block text-[8px] mt-1 font-normal opacity-70">
                             {lvl === 'Low' ? 'High detail logic' : lvl === 'Medium' ? 'Balanced depth' : 'Synthesized synthesis'}
                          </span>
                       </button>
                     ))}
                  </div>
                </div>
                <div className="p-10 bg-[#0F172A] rounded-[2.5rem] text-white space-y-4 shadow-2xl">
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={24} className="text-brand-blue" />
                      <h4 className="font-bold text-lg">Institutional Lock Ready</h4>
                   </div>
                   <p className="text-base font-light text-slate-300 italic leading-relaxed">Your Strategic DNA is ready. Upon authorization, predictive intelligence will begin calibrating to the {form.companyName} context.</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-12">
               {step > 1 ? (
                 <button onClick={() => setStep(step - 1)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2">
                    <ChevronLeft size={16} /> Backtrack
                 </button>
               ) : (
                 <button onClick={() => onNavigate(AppRoute.LOGIN)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-brand-blue transition-colors">Institutional Member</button>
               )}
               <Button 
                  onClick={step === 6 ? handleRegister : () => setStep(step + 1)} 
                  size="lg" className="rounded-full px-12 h-16 shadow-2xl transition-all"
                  isLoading={loading}
                  disabled={step === 1 && (!form.name || !form.email || !form.password)}
               >
                  {step === 6 ? 'Authorize DNA' : 'Proceed Protocol'} 
                  <ArrowRight size={18} className="ml-3" />
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};
