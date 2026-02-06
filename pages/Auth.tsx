import React, { useState } from 'react';
import { Logo, Button, Input, Select, Modal } from '../components/UI';
import { AppRoute, User, BusinessDNA, BusinessModel, CompanySize, CustomerType, GrowthStage, StrategicPriority } from '../types';
import { db } from '../services/database';
import { scanAndEnrichDNA } from '../services/gemini';
import { 
  ArrowRight, ShieldCheck, Database, Building2, Globe, Target, 
  User as UserIcon, Loader2, Sparkles, RefreshCw, CheckCircle2, 
  Linkedin, Twitter, Instagram, Sparkle, ClipboardCheck, AlertCircle
} from 'lucide-react';

export const AuthPage: React.FC<{ type: 'login' | 'register', onLogin: (u: User) => void, onNavigate: (r: AppRoute) => void }> = ({ type, onLogin, onNavigate }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [discoveredMetrics, setDiscoveredMetrics] = useState<any>(null);
  const [syncedFields, setSyncedFields] = useState<Set<string>>(new Set());
  
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
    linkedin: '', twitter: '', instagram: ''
  });

  const handleWebsiteSync = async () => {
    if (!formData.website || !formData.website.includes('.')) return;
    setSyncing(true);
    setDiscoveryOpen(true);
    try {
      const findings = await scanAndEnrichDNA({ ...formData, socialLinks: {} } as any);
      setDiscoveredMetrics(findings);
    } catch (e) {
      console.error(e);
      alert("Institutional Discovery timed out. Reverting to manual calibration.");
      setDiscoveryOpen(false);
    } finally {
      setSyncing(false);
    }
  };

  const applyFindings = () => {
    if (!discoveredMetrics) return;
    setFormData(prev => ({
      ...prev,
      industry: discoveredMetrics.industry || prev.industry,
      businessModel: (discoveredMetrics.businessModel as BusinessModel) || prev.businessModel,
      customerSegment: (discoveredMetrics.customerSegment as CustomerType) || prev.customerSegment,
      manualCompetitors: discoveredMetrics.rivals || prev.manualCompetitors
    }));
    setSyncedFields(new Set(['industry', 'businessModel', 'customerSegment', 'rivals']));
    setDiscoveryOpen(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const user: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        dna: { ...formData, socialLinks: { linkedin: formData.linkedin } } as any
      };
      db.auth.register(user, formData.password);
      onLogin(user);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.auth.login(formData.email, formData.password);
    if (user) onLogin(user);
    else alert("Access Denied: Invalid Credentials.");
  };

  if (type === 'login') {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-paper p-6 font-sans">
        <div className="w-full max-w-md space-y-12 animate-reveal">
          <div className="flex justify-center"><Logo /></div>
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-serif font-bold italic text-slate-900 tracking-tight">Executive Login</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">Resume Strategic Session</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input label="Institutional Email" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} required />
            <Input label="Access Key" type="password" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} required />
            <Button type="submit" fullWidth size="lg" className="rounded-2xl h-14">Unlock Hub</Button>
          </form>
          <button onClick={() => onNavigate(AppRoute.REGISTER)} className="w-full text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-brand-blue transition-colors">Initialize New DNA Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-white font-sans">
      <div className="hidden lg:flex w-[450px] bg-brand-slate flex-col p-16 justify-between text-white relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #2563EB 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <Logo light />
        <div className="space-y-12 relative z-10">
          <h1 className="text-6xl font-serif font-bold italic leading-tight">Institutional<br/>Calibration.</h1>
          <div className="space-y-8">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex items-center gap-6 transition-all duration-700 ${step >= s ? 'opacity-100' : 'opacity-20'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${step === s ? 'bg-brand-blue border-brand-blue shadow-lg' : 'border-white/10'}`}>
                   <span className="text-xs font-bold">{s}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">{['Identity', 'Core DNA', 'Market', 'Mandates'][s-1]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] flex items-center gap-2"><Database size={12}/> Secure Vault Active</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-20 lg:px-32 flex flex-col items-center bg-brand-paper">
        <div className="w-full max-w-2xl space-y-16">
          {step === 1 && (
            <div className="space-y-12 animate-reveal">
              <h2 className="text-5xl font-serif font-bold italic text-slate-900">Identity</h2>
              <div className="space-y-8">
                <Input label="Full Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sterling Cooper" />
                <Input label="Institutional Email" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
                <Input label="Session Key" type="password" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} />
                <Input label="Legal Entity" value={formData.companyName} onChange={(e: any) => setFormData({...formData, companyName: e.target.value})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-reveal">
              <h2 className="text-5xl font-serif font-bold italic text-slate-900">Core DNA</h2>
              <div className="space-y-8">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input label="Corporate Domain" value={formData.website} onChange={(e: any) => setFormData({...formData, website: e.target.value})} placeholder="firm.ai" />
                  </div>
                  <Button variant="secondary" onClick={handleWebsiteSync} isLoading={syncing} className="h-12 rounded-xl px-8">Search & Sync</Button>
                </div>
                <div className="p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 flex gap-4">
                  <Sparkles className="text-brand-blue shrink-0" size={20} />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"Institutional Discovery gathers sector data, rival movements, and macro trends directly from the web."</p>
                </div>
                <Input label="Industry Sector" value={formData.industry} onChange={(e: any) => setFormData({...formData, industry: e.target.value})} />
                <div className="grid grid-cols-2 gap-6">
                  <Select label="Model Type" options={['SaaS', 'Services', 'Ecommerce', 'Marketplace']} value={formData.businessModel} onChange={(e: any) => setFormData({...formData, businessModel: e.target.value})} />
                  <Select label="Target Market" options={['B2B', 'B2C', 'Hybrid']} value={formData.customerSegment} onChange={(e: any) => setFormData({...formData, customerSegment: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-reveal">
              <h2 className="text-5xl font-serif font-bold italic text-slate-900">Market Scope</h2>
              <div className="space-y-8">
                <Input label="Primary Rivals (Comma separated)" value={formData.manualCompetitors.join(", ")} onChange={(e: any) => setFormData({...formData, manualCompetitors: e.target.value.split(",")})} />
                <div className="grid grid-cols-2 gap-6">
                  <Select label="Org Size" options={['Solo', 'Startup', 'SME', 'Enterprise']} value={formData.size} onChange={(e: any) => setFormData({...formData, size: e.target.value})} />
                  <Select label="Growth Phase" options={['Early', 'Scaling', 'Mature']} value={formData.stage} onChange={(e: any) => setFormData({...formData, stage: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-reveal">
              <h2 className="text-5xl font-serif font-bold italic text-slate-900">Mandates</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Growth', 'Efficiency', 'Expansion', 'Survival', 'Defense'].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setFormData(prev => ({ ...prev, strategicGoals: prev.strategicGoals.includes(p as any) ? prev.strategicGoals.filter(x => x !== p) : [...prev.strategicGoals, p as any] }))}
                    className={`p-8 rounded-[2rem] border-2 text-left transition-all ${formData.strategicGoals.includes(p as any) ? 'bg-brand-slate border-brand-slate text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-brand-blue'}`}
                  >
                    <Target size={18} className="mb-4" />
                    <p className="text-xl font-serif font-bold italic">{p} Protocol</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? <button onClick={() => setStep(step - 1)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Back</button> : <div></div>}
            <Button size="lg" className="rounded-full px-12 h-16 shadow-2xl" onClick={() => step < 4 ? setStep(step + 1) : handleRegister()} isLoading={loading}>
              {step === 4 ? 'Activate Intelligence' : 'Continue'} <ArrowRight size={20} className="ml-3" />
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={discoveryOpen} onClose={() => setDiscoveryOpen(false)} title="Institutional Discovery">
        <div className="space-y-8 py-4">
          {!discoveredMetrics ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <Loader2 className="animate-spin text-brand-blue" size={40} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Scanning Corporate Domain...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-reveal">
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start gap-4">
                <ShieldCheck className="text-emerald-500 mt-1" size={20} />
                <p className="text-sm font-serif italic text-emerald-900">"Metrics gathered. Synchronize these findings to auto-fill your profile."</p>
              </div>
              <div className="space-y-3">
                {[
                  { l: 'Sector', v: discoveredMetrics.industry },
                  { l: 'Model', v: discoveredMetrics.businessModel },
                  { l: 'Rivals', v: discoveredMetrics.rivals?.join(', ') }
                ].map(i => (
                  <div key={i.l} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{i.l}</span>
                    <span className="text-sm font-bold text-slate-900">{i.v}</span>
                  </div>
                ))}
              </div>
              <Button fullWidth onClick={applyFindings} icon={CheckCircle2}>Apply Findings</Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
