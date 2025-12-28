
import React, { useState, useEffect } from 'react';
import { Logo, Button, Input, Select, Modal } from '../components/UI';
import { AppRoute, User, BusinessDNA, BusinessModel, CompanySize, CustomerType, GrowthStage, StrategicPriority } from '../types';
import { db } from '../services/database';
import { scanAndEnrichDNA } from '../services/gemini';
import { 
  ArrowRight, ChevronLeft, ShieldCheck, Database, Building2, Globe, Target, 
  User as UserIcon, Loader2, Sparkles, Search, RefreshCw, CheckCircle2, 
  Info, LayoutPanelTop, Linkedin, Twitter, Instagram, Sparkle, ClipboardCheck,
  AlertCircle
} from 'lucide-react';

export const AuthPage: React.FC<{ type: 'login' | 'register', onLogin: (u: User) => void, onNavigate: (r: AppRoute) => void }> = ({ type, onLogin, onNavigate }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [discoveredMetrics, setDiscoveredMetrics] = useState<any>(null);
  
  // Track which fields have been modified by AI sync for UI highlighting
  const [syncedFields, setSyncedFields] = useState<Set<string>>(new Set());

  const [selectedFindings, setSelectedFindings] = useState<Record<string, boolean>>({
    industry: true, rivals: true, businessModel: true, customerSegment: true, stage: true, social: true
  });
  
  const [scanningMsg, setScanningMsg] = useState('Initiating institutional scan...');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', companyName: '', industry: '',
    businessModel: 'SaaS' as BusinessModel,
    customerSegment: 'B2B' as CustomerType,
    operatingMarkets: [] as string[],
    size: 'Startup (2-10)' as CompanySize,
    stage: 'Early' as GrowthStage,
    strategicGoals: [] as StrategicPriority[],
    riskTolerance: 'Medium' as 'Low' | 'Medium' | 'High',
    manualCompetitors: [] as string[],
    website: '',
    marketContext: '',
    competitorIntel: '',
    linkedin: '',
    twitter: '',
    instagram: ''
  });

  const handleWebsiteSync = async () => {
    if (!formData.website || !formData.website.includes('.')) {
      alert("Please enter a valid corporate domain first (e.g. firm.ai)");
      return;
    }

    // Mitigation for mandatory paid key selection before using search grounding tools
    try {
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }
    } catch (err) {
      console.warn("Key selection dialog issue:", err);
    }

    setSyncing(true);
    setDiscoveryOpen(true);
    setDiscoveredMetrics(null);
    try {
      const tempDNA: BusinessDNA = {
        companyName: formData.companyName || "Unknown Entity",
        industry: formData.industry,
        businessModel: formData.businessModel,
        customerSegment: formData.customerSegment,
        operatingMarkets: formData.operatingMarkets,
        size: formData.size,
        stage: formData.stage,
        strategicGoals: formData.strategicGoals,
        riskTolerance: formData.riskTolerance,
        manualCompetitors: formData.manualCompetitors,
        website: formData.website,
        socialLinks: {}
      };

      const findings = await scanAndEnrichDNA(tempDNA);
      setDiscoveredMetrics(findings);
    } catch (e: any) {
      console.error("Discovery error", e);
      const msg = (e?.message || JSON.stringify(e)).toLowerCase();
      
      // Specifically handle key selection issues which often present as 500 or code 6
      if (
        msg.includes("requested entity was not found") || 
        msg.includes("error code: 6") || 
        msg.includes("not_found") ||
        msg.includes("xhr error") ||
        msg.includes("500")
      ) {
        alert("Institutional Discovery requires a valid paid project key for Search Grounding. Please re-select your key.");
        try {
          await (window as any).aistudio.openSelectKey();
        } catch (dialogErr) {
          console.error("Failed to open key dialog:", dialogErr);
        }
      } else {
        alert("Institutional Discovery encountered a network issue. Ensure your domain is reachable.");
      }
      setDiscoveryOpen(false);
    } finally {
      setSyncing(false);
    }
  };

  const applySelectedFindings = () => {
    if (!discoveredMetrics) return;
    
    const newFormData = { ...formData };
    const newlySynced = new Set(syncedFields);

    if (selectedFindings.industry && discoveredMetrics.industry) {
      newFormData.industry = discoveredMetrics.industry;
      newlySynced.add('industry');
    }
    if (selectedFindings.businessModel && discoveredMetrics.businessModel) {
      newFormData.businessModel = discoveredMetrics.businessModel as BusinessModel;
      newlySynced.add('businessModel');
    }
    if (selectedFindings.customerSegment && discoveredMetrics.customerSegment) {
      newFormData.customerSegment = discoveredMetrics.customerSegment as CustomerType;
      newlySynced.add('customerSegment');
    }
    if (selectedFindings.rivals && discoveredMetrics.rivals) {
      newFormData.manualCompetitors = [...new Set([...formData.manualCompetitors, ...discoveredMetrics.rivals])];
      newlySynced.add('rivals');
    }
    if (selectedFindings.stage && discoveredMetrics.stage) {
      newFormData.stage = discoveredMetrics.stage as GrowthStage;
      newlySynced.add('stage');
    }
    
    if (selectedFindings.social && discoveredMetrics.socialLinks) {
       newFormData.linkedin = discoveredMetrics.socialLinks.linkedin || '';
       newFormData.twitter = discoveredMetrics.socialLinks.twitter || '';
       newFormData.instagram = discoveredMetrics.socialLinks.instagram || '';
       newlySynced.add('linkedin');
       newlySynced.add('twitter');
       newlySynced.add('instagram');
    }

    newFormData.marketContext = discoveredMetrics.marketContext || '';
    newFormData.competitorIntel = discoveredMetrics.competitorIntel || '';

    setFormData(newFormData);
    setSyncedFields(newlySynced);
    setDiscoveryOpen(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setStep(5);
    
    try {
      setScanningMsg("Engaging Institutional Calibration...");
      const dna: BusinessDNA = {
        companyName: formData.companyName,
        industry: formData.industry,
        businessModel: formData.businessModel,
        customerSegment: formData.customerSegment,
        operatingMarkets: formData.operatingMarkets,
        size: formData.size,
        stage: formData.stage,
        strategicGoals: formData.strategicGoals,
        riskTolerance: formData.riskTolerance,
        manualCompetitors: formData.manualCompetitors,
        website: formData.website,
        socialLinks: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram
        },
        enrichedData: {
          marketContext: formData.marketContext || "Institutional baseline established.",
          competitorIntel: formData.competitorIntel || "Competitive vectors mapped.",
          lastScan: new Date().toISOString()
        }
      };

      const user: User = { 
        id: Date.now().toString(), 
        name: formData.name, 
        email: formData.email, 
        companyName: formData.companyName, 
        dna 
      };
      
      db.auth.register(user, formData.password);
      onLogin(user);
    } catch (e) {
      console.error(e);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.auth.login(formData.email, formData.password);
    if (user) onLogin(user);
    else alert("Institutional Access Denied.");
  };

  const SyncedBadge = () => (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 animate-reveal">
      <Sparkle size={8} className="text-emerald-500 fill-emerald-500" />
      <span className="text-[8px] font-mono font-bold text-emerald-600 uppercase tracking-tighter">Synced</span>
    </div>
  );

  if (type === 'login') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-md space-y-12 animate-reveal">
          <div className="flex justify-center"><Logo /></div>
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-satoshi font-bold italic text-slate-900 tracking-tight">Executive Access</h2>
            <p className="text-slate-400 text-xs font-inter font-medium uppercase tracking-[0.4em]">Resume Strategic Session</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input label="Institutional Email" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} required />
            <Input label="Access Key" type="password" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} required />
            <Button type="submit" fullWidth size="lg" className="rounded-full h-16 text-lg">Unlock Command Center</Button>
          </form>
          <button onClick={() => onNavigate(AppRoute.REGISTER)} className="w-full text-[10px] font-inter font-medium text-slate-300 uppercase tracking-widest hover:text-brand-blue transition-colors">Initialize New DNA Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      <div className="hidden lg:flex w-[400px] bg-slate-950 flex-col p-16 justify-between text-white relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #246BFD 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <Logo light />
        <div className="space-y-10 relative z-10">
          <h1 className="text-5xl font-satoshi font-bold leading-tight">Institutional <br/><span className="text-slate-500 italic">Calibration.</span></h1>
          <div className="space-y-6">
            {[
              { id: 1, label: 'Identity', icon: UserIcon },
              { id: 2, label: 'Core DNA', icon: Building2 },
              { id: 3, label: 'Market Scope', icon: Globe },
              { id: 4, label: 'Mandates', icon: Target },
            ].map(s => (
              <div key={s.id} className={`flex items-center gap-5 transition-all duration-700 ${step >= s.id ? 'opacity-100' : 'opacity-20'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${step === s.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'border-white/10 text-white/40'}`}>
                  <s.icon size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-inter font-medium text-white/30 uppercase tracking-[0.3em]">Step 0{s.id}</p>
                   <p className="text-xs font-inter font-medium uppercase tracking-widest">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] flex items-center gap-2"><Database size={12}/> Secure Protocol Active</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-20 lg:px-32 flex flex-col items-center bg-[#F8FAFC]">
        <div className="w-full max-w-2xl space-y-16">
          {step === 1 && (
            <div className="space-y-12 animate-reveal text-left">
              <div className="space-y-2">
                 <h2 className="text-5xl font-satoshi font-bold text-slate-900 tracking-tight">Identity</h2>
                 <p className="text-xs font-inter font-medium text-slate-400 uppercase tracking-[0.3em]">Lead Executive Profile</p>
              </div>
              <div className="space-y-8">
                <Input label="Full Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Alexander Sterling" />
                <Input label="Institutional Email" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} placeholder="corp@firm.ai" />
                <Input label="Session Key" type="password" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                <Input label="Legal Entity Name" value={formData.companyName} onChange={(e: any) => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Apex Global Systems" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-reveal text-left">
              <div className="space-y-2">
                 <h2 className="text-5xl font-satoshi font-bold text-slate-900 tracking-tight">Core DNA</h2>
                 <p className="text-xs font-inter font-medium text-slate-400 uppercase tracking-[0.4em]">Business Logic Foundation</p>
              </div>
              <div className="space-y-8">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input 
                      label="Corporate Domain" 
                      value={formData.website} 
                      onChange={(e: any) => setFormData({...formData, website: e.target.value})} 
                      placeholder="https://firm.ai" 
                    />
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-12 mb-0.5 rounded-xl min-w-[140px] shadow-lg" 
                    onClick={handleWebsiteSync} 
                    isLoading={syncing}
                  >
                    {!syncing && <RefreshCw size={14} className="mr-2" />}
                    Search & Sync
                  </Button>
                </div>
                
                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 space-y-4">
                  <div className="flex items-center gap-3 text-brand-blue">
                     <Sparkles size={18} />
                     <p className="text-[10px] font-inter font-medium uppercase tracking-[0.4em]">Knowledge Discovery Engine</p>
                  </div>
                  <p className="text-sm font-source-serif text-slate-600 leading-relaxed italic">
                    "Searching your institutional domain allows Consult AI to gather and sync precise sector data, rival movements, and current macro trends directly from the web."
                  </p>
                </div>

                <div className="relative">
                  <Input 
                    label="Industry Sector" 
                    value={formData.industry} 
                    onChange={(e: any) => { setFormData({...formData, industry: e.target.value}); if(syncedFields.has('industry')) { const n = new Set(syncedFields); n.delete('industry'); setSyncedFields(n); } }} 
                    placeholder="e.g. Quantitative Finance"
                    className={syncedFields.has('industry') ? 'border-emerald-200 bg-emerald-50/10' : ''}
                  />
                  {syncedFields.has('industry') && <div className="absolute right-3 top-9"><SyncedBadge /></div>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <Select 
                      label="Model Type" 
                      options={['SaaS', 'Services', 'Ecommerce', 'Marketplace', 'Manufacturing', 'Hybrid']} 
                      value={formData.businessModel} 
                      onChange={(e: any) => { setFormData({...formData, businessModel: e.target.value}); if(syncedFields.has('businessModel')) { const n = new Set(syncedFields); n.delete('businessModel'); setSyncedFields(n); } }}
                      className={syncedFields.has('businessModel') ? 'border-emerald-200 bg-emerald-50/10' : ''}
                    />
                    {syncedFields.has('businessModel') && <div className="absolute right-9 top-9"><SyncedBadge /></div>}
                  </div>
                  <div className="relative">
                    <Select 
                      label="Target Segment" 
                      options={['B2B', 'B2C', 'Hybrid', 'B2G']} 
                      value={formData.customerSegment} 
                      onChange={(e: any) => { setFormData({...formData, customerSegment: e.target.value}); if(syncedFields.has('customerSegment')) { const n = new Set(syncedFields); n.delete('customerSegment'); setSyncedFields(n); } }}
                      className={syncedFields.has('customerSegment') ? 'border-emerald-200 bg-emerald-50/10' : ''}
                    />
                    {syncedFields.has('customerSegment') && <div className="absolute right-9 top-9"><SyncedBadge /></div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-reveal text-left">
              <div className="space-y-2">
                 <h2 className="text-5xl font-satoshi font-bold text-slate-900 tracking-tight">Market Scope</h2>
                 <p className="text-xs font-inter font-medium text-slate-400 uppercase tracking-[0.3em]">Operational Geography & Rivals</p>
              </div>
              <div className="space-y-8">
                <Input label="Operating Jurisdictions" value={formData.operatingMarkets.join(", ")} onChange={(e: any) => setFormData({...formData, operatingMarkets: e.target.value.split(",").map((s: string) => s.trim())})} placeholder="e.g. USA, Germany" />
                
                <div className="relative">
                  <Input 
                    label="Primary Competitors" 
                    value={formData.manualCompetitors.join(", ")} 
                    onChange={(e: any) => { setFormData({...formData, manualCompetitors: e.target.value.split(",").map((s: string) => s.trim())}); if(syncedFields.has('rivals')) { const n = new Set(syncedFields); n.delete('rivals'); setSyncedFields(n); } }} 
                    placeholder="e.g. RivalCo, TechCorp" 
                    className={syncedFields.has('rivals') ? 'border-emerald-200 bg-emerald-50/10' : ''}
                  />
                  {syncedFields.has('rivals') && <div className="absolute right-3 top-9"><SyncedBadge /></div>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Select label="Organization Size" options={['Solo (1)', 'Startup (2-10)', 'SME (11-50)', 'Mid-Market (51-500)', 'Enterprise (500+)']} value={formData.size} onChange={(e: any) => setFormData({...formData, size: e.target.value})} />
                  <div className="relative">
                    <Select 
                      label="Growth Phase" 
                      options={['Early', 'Scaling', 'Mature']} 
                      value={formData.stage} 
                      onChange={(e: any) => { setFormData({...formData, stage: e.target.value}); if(syncedFields.has('stage')) { const n = new Set(syncedFields); n.delete('stage'); setSyncedFields(n); } }} 
                      className={syncedFields.has('stage') ? 'border-emerald-200 bg-emerald-50/10' : ''}
                    />
                    {syncedFields.has('stage') && <div className="absolute right-9 top-9"><SyncedBadge /></div>}
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100">
                   <p className="text-xs font-inter font-medium text-slate-400 uppercase tracking-[0.3em] mb-6">Digital Footprint (Social Sync)</p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative group">
                         <Linkedin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A66C2] transition-transform" />
                         <input 
                           className={`w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-inter ${syncedFields.has('linkedin') ? 'border-emerald-200 bg-emerald-50/10' : ''}`} 
                           placeholder="LinkedIn" 
                           value={formData.linkedin} 
                           onChange={(e) => { setFormData({...formData, linkedin: e.target.value}); if(syncedFields.has('linkedin')) { const n = new Set(syncedFields); n.delete('linkedin'); setSyncedFields(n); } }}
                         />
                         {syncedFields.has('linkedin') && <div className="absolute right-2 top-1.5 scale-75"><SyncedBadge /></div>}
                      </div>
                      <div className="relative group">
                         <Twitter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-transform" />
                         <input 
                           className={`w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-inter ${syncedFields.has('twitter') ? 'border-emerald-200 bg-emerald-50/10' : ''}`} 
                           placeholder="X / Twitter" 
                           value={formData.twitter} 
                           onChange={(e) => { setFormData({...formData, twitter: e.target.value}); if(syncedFields.has('twitter')) { const n = new Set(syncedFields); n.delete('twitter'); setSyncedFields(n); } }}
                         />
                         {syncedFields.has('twitter') && <div className="absolute right-2 top-1.5 scale-75"><SyncedBadge /></div>}
                      </div>
                      <div className="relative group">
                         <Instagram size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E4405F] transition-transform" />
                         <input 
                           className={`w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-inter ${syncedFields.has('instagram') ? 'border-emerald-200 bg-emerald-50/10' : ''}`} 
                           placeholder="Instagram" 
                           value={formData.instagram} 
                           onChange={(e) => { setFormData({...formData, instagram: e.target.value}); if(syncedFields.has('instagram')) { const n = new Set(syncedFields); n.delete('instagram'); setSyncedFields(n); } }}
                         />
                         {syncedFields.has('instagram') && <div className="absolute right-2 top-1.5 scale-75"><SyncedBadge /></div>}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-reveal text-left">
              <div className="space-y-2">
                 <h2 className="text-5xl font-satoshi font-bold text-slate-900 tracking-tight">Mandates</h2>
                 <p className="text-xs font-inter font-medium text-slate-400 uppercase tracking-[0.3em]">Strategic North Star</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {['Growth', 'Efficiency', 'Expansion', 'Survival', 'Defense', 'Authority'].map(p => (
                  <button 
                    key={p} 
                    onClick={() => {
                      const cur = formData.strategicGoals;
                      setFormData({...formData, strategicGoals: cur.includes(p as any) ? cur.filter(x => x !== p) : [...cur, p as any]});
                    }}
                    className={`p-8 rounded-[2.5rem] border-2 text-left transition-all ${formData.strategicGoals.includes(p as any) ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-brand-blue hover:text-slate-900'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-inter font-medium uppercase tracking-[0.2em]">{p}</span>
                       <Target size={14} className={formData.strategicGoals.includes(p as any) ? 'text-brand-blue' : 'text-slate-200'} />
                    </div>
                    <p className="text-lg font-satoshi italic">Initiate {p.toLowerCase()} protocol.</p>
                  </button>
                ))}
              </div>
              <div className="pt-10 flex justify-between items-center">
                <button onClick={() => setStep(3)} className="text-[10px] font-inter font-medium uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900">Go Back</button>
                <Button size="lg" className="rounded-full px-12 h-16 shadow-2xl" onClick={handleRegister}>Activate Intelligence Engine</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="h-full flex flex-col items-center justify-center py-40 space-y-12 animate-reveal text-center">
               <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <Loader2 size={48} className="text-white animate-spin" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent"></div>
               </div>
               <div className="space-y-4 max-w-sm">
                  <h3 className="text-2xl font-satoshi font-bold text-slate-900">{scanningMsg}</h3>
                  <p className="text-[10px] text-slate-400 font-inter font-medium uppercase tracking-widest leading-relaxed">Synthesizing institutional DNA baseline...</p>
               </div>
            </div>
          )}

          {step < 4 && (
            <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                 <button onClick={() => setStep(step - 1)} className="text-[10px] font-inter font-medium uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900">Previous</button>
              ) : <div></div>}
              <Button size="lg" className="rounded-full px-12 h-16 shadow-2xl" onClick={() => setStep(step + 1)}>Continue Calibration <ArrowRight size={20} className="ml-3" /></Button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={discoveryOpen} onClose={() => setDiscoveryOpen(false)} title="Institutional Knowledge Discovery">
        <div className="space-y-8 py-4">
          {!discoveredMetrics && syncing ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-reveal">
              <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center relative shadow-2xl">
                 <div className="absolute inset-0 bg-brand-blue/20 animate-pulse rounded-3xl"></div>
                 <Loader2 className="animate-spin text-white" size={32} />
              </div>
              <div className="text-center space-y-2">
                 <p className="text-xs font-inter font-medium text-slate-900 uppercase tracking-[0.4em] animate-pulse">Scanning Corporate Domain...</p>
                 <p className="text-[10px] font-inter font-medium text-slate-400 uppercase tracking-widest">Gathering precise sector intelligence from the web.</p>
              </div>
            </div>
          ) : !discoveredMetrics ? (
             <div className="py-20 text-center space-y-4">
                <AlertCircle size={40} className="mx-auto text-amber-500" />
                <p className="text-sm font-medium text-slate-900 uppercase">Domain Unavailable</p>
                <Button size="sm" onClick={() => setDiscoveryOpen(false)}>Refine Input</Button>
             </div>
          ) : (
            <div className="space-y-8 animate-reveal">
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start gap-4">
                 <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                 <div>
                    <p className="text-xs font-inter font-medium text-emerald-700 uppercase tracking-widest mb-1">Audit Complete</p>
                    <p className="text-sm font-source-serif text-emerald-900 italic">"Institutional metrics gathered. Select the precise findings you wish to sync and auto-fill into your profile."</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto no-scrollbar px-1">
                {[
                  { id: 'industry', label: 'Sector Found', val: discoveredMetrics.industry },
                  { id: 'businessModel', label: 'Core Model', val: discoveredMetrics.businessModel },
                  { id: 'customerSegment', label: 'Primary Market', val: discoveredMetrics.customerSegment },
                  { id: 'rivals', label: 'Identified Rivals', val: discoveredMetrics.rivals?.join(', ') },
                  { id: 'stage', label: 'Operational Phase', val: discoveredMetrics.stage },
                  { id: 'social', label: 'Digital Handles', val: discoveredMetrics.socialLinks ? `LinkedIn, X, Instagram` : 'None Found' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedFindings(prev => ({...prev, [item.id]: !prev[item.id]}))}
                    className={`p-6 rounded-3xl border text-left flex items-center justify-between group transition-all ${selectedFindings[item.id] ? 'bg-white border-brand-blue shadow-lg ring-1 ring-brand-blue/10' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                  >
                    <div className="flex gap-4 items-center flex-1 min-w-0">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedFindings[item.id] ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {selectedFindings[item.id] ? <ClipboardCheck size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-current"></div>}
                       </div>
                       <div className="truncate">
                          <p className="text-[10px] font-inter font-medium text-slate-400 uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-mono font-medium text-slate-900 mt-1 truncate">{item.val || 'Undetected'}</p>
                       </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-slate-800 space-y-4">
                <div className="flex items-center gap-3 text-brand-blue">
                   <LayoutPanelTop size={16} />
                   <p className="text-[10px] font-inter font-medium uppercase tracking-[0.4em]">Strategic Context</p>
                </div>
                <p className="text-xs font-source-serif text-slate-400 leading-relaxed italic">
                  "{discoveredMetrics.marketContext}"
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" fullWidth onClick={() => setDiscoveryOpen(false)}>Discard Findings</Button>
                <Button fullWidth onClick={applySelectedFindings} icon={CheckCircle2}>Sync & Auto-Fill</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
