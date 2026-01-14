
import React, { useState, useRef } from 'react';
import { Logo, Button, Input, Select } from '../components/UI';
import { AppRoute, User, BusinessDNA, BusinessModel, CompanySize, CustomerType, GrowthStage, StrategicPriority, ProjectFile } from '../types';
import { db } from '../services/database';
// Fixed: Removed analyzeEnrichmentFiles as it is not exported from the gemini service and is unused in this file.
import { scanAndEnrichDNA, searchStockTicker } from '../services/gemini';
import { 
  ArrowRight, ShieldCheck, Database, Building2, Globe, Target, 
  User as UserIcon, Loader2, Sparkles, RefreshCw, CheckCircle2, 
  Linkedin, Twitter, Instagram, Sparkle, Search, Globe2, FileUp, Info, ChevronLeft, Check, TrendingUp
} from 'lucide-react';

export const AuthPage: React.FC<{ type: 'login' | 'register', onLogin: (u: User) => void, onNavigate: (r: AppRoute) => void }> = ({ type, onLogin, onNavigate }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [syncedFields, setSyncedFields] = useState<Set<string>>(new Set());
  const [stockSearch, setStockSearch] = useState('');
  const [stockResults, setStockResults] = useState<any[]>([]);
  const [searchingStocks, setSearchingStocks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', companyName: '', industry: '',
    description: '',
    businessModel: 'SaaS' as BusinessModel,
    customerSegment: 'B2B' as CustomerType,
    operatingMarkets: [] as string[],
    size: 'Startup (2-10)' as CompanySize,
    stage: 'Early' as GrowthStage,
    strategicGoals: [] as StrategicPriority[],
    riskTolerance: 'Medium' as 'Low' | 'Medium' | 'High',
    manualCompetitors: [] as string[],
    website: '',
    valueProposition: '',
    toneOfVoice: '',
    stockTicker: '',
    stockExchange: '',
    linkedin: '', twitter: '', instagram: '',
    marketContext: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<ProjectFile[]>([]);

  const handleStockSearch = async () => {
    if (!stockSearch) return;
    setSearchingStocks(true);
    try {
      const results = await searchStockTicker(stockSearch);
      setStockResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingStocks(false);
    }
  };

  const handleWebsiteSync = async () => {
    if (!formData.website || !formData.website.includes('.')) {
      alert("Please provide a valid corporate URL.");
      return;
    }

    setSyncing(true);
    setSyncComplete(false);
    try {
      const findings = await scanAndEnrichDNA({ website: formData.website });
      
      if (findings) {
        setFormData(prev => ({
          ...prev,
          companyName: findings.companyName || prev.companyName,
          industry: findings.industry || prev.industry,
          description: findings.description || prev.description,
          businessModel: (findings.businessModel as BusinessModel) || prev.businessModel,
          customerSegment: (findings.customerSegment as CustomerType) || prev.customerSegment,
          valueProposition: findings.valueProposition || prev.valueProposition,
          stage: (findings.stage as GrowthStage) || prev.stage,
          operatingMarkets: findings.operatingMarkets || prev.operatingMarkets,
          toneOfVoice: findings.toneOfVoice || prev.toneOfVoice,
          manualCompetitors: findings.rivals || prev.manualCompetitors,
          linkedin: findings.socialLinks?.linkedin || prev.linkedin,
          twitter: findings.socialLinks?.twitter || prev.twitter,
          instagram: findings.socialLinks?.instagram || prev.instagram,
          marketContext: findings.marketContext || prev.marketContext
        }));

        const newlySynced = new Set<string>();
        if (findings.companyName) newlySynced.add('companyName');
        if (findings.industry) newlySynced.add('industry');
        if (findings.description) newlySynced.add('description');
        if (findings.valueProposition) newlySynced.add('valueProposition');
        if (findings.stage) newlySynced.add('stage');
        
        setSyncedFields(newlySynced);
        setSyncComplete(true);
        setTimeout(() => setStep(3), 800);
      }
    } catch (e) {
      console.error("Discovery error", e);
      setStep(3);
    } finally {
      setSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading(true);
    const files = Array.from(e.target.files) as File[];
    const newFiles: ProjectFile[] = [];

    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result?.toString().split(',')[1] || '');
        reader.readAsDataURL(file);
      });
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.split('.').pop() || 'file',
        size: (file.size / 1024).toFixed(0) + 'KB',
        mimeType: file.type,
        content: base64
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const dna: BusinessDNA = {
        companyName: formData.companyName,
        industry: formData.industry,
        description: formData.description,
        businessModel: formData.businessModel,
        customerSegment: formData.customerSegment,
        operatingMarkets: formData.operatingMarkets,
        size: formData.size,
        stage: formData.stage,
        strategicGoals: formData.strategicGoals,
        riskTolerance: formData.riskTolerance,
        manualCompetitors: formData.manualCompetitors,
        website: formData.website,
        valueProposition: formData.valueProposition,
        toneOfVoice: formData.toneOfVoice,
        stockTicker: formData.stockTicker,
        stockExchange: formData.stockExchange,
        socialLinks: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram
        },
        enrichedData: {
          marketContext: formData.marketContext || "Institutional baseline established.",
          competitorIntel: "Competitive vectors mapped via sync.",
          lastScan: new Date().toISOString(),
          autoFilledFields: Array.from(syncedFields)
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
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.auth.login(formData.email, formData.password);
    if (user) onLogin(user);
    else alert("Access Denied.");
  };

  const AutoFilledIndicator = ({ field }: { field: string }) => syncedFields.has(field) ? (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-100/50 animate-reveal">
      <Sparkle size={8} className="text-brand-blue fill-brand-blue" />
      <span className="text-[7px] font-bold text-brand-blue uppercase tracking-tighter">Auto-filled from website</span>
    </div>
  ) : null;

  if (type === 'login') {
    return (
      <div className="h-screen flex items-center justify-center bg-white p-6 font-inter">
        <div className="w-full max-w-md space-y-12 animate-reveal">
          <div className="flex justify-center"><Logo /></div>
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Executive Access</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">Resume Strategic Session</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input label="Institutional Email" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} required />
            <Input label="Access Key" type="password" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} required />
            <Button type="submit" fullWidth size="lg" className="rounded-full h-16 shadow-premium">Unlock Command Hub</Button>
          </form>
          <button onClick={() => onNavigate(AppRoute.REGISTER)} className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-blue transition-colors">Initialize New DNA Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden font-inter">
      <div className="hidden lg:flex w-[400px] bg-slate-950 flex-col p-16 justify-between text-white relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #246BFD 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <Logo light />
        <div className="space-y-12 relative z-10">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold italic leading-tight">Institutional <br/><span className="text-slate-500">Calibration.</span></h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed italic opacity-60">Synchronizing system context with your corporate domain.</p>
          </div>
          <div className="space-y-6">
            {[
              { id: 1, label: 'Identity' },
              { id: 2, label: 'Corporate Domain' },
              { id: 3, label: 'Business DNA' },
              { id: 4, label: 'Stock Alpha' },
              { id: 5, label: 'Enrichment' },
              { id: 6, label: 'Mandate' },
            ].map(s => (
              <div key={s.id} className={`flex items-center gap-5 transition-all duration-500 ${step >= s.id ? 'opacity-100' : 'opacity-20'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-bold transition-all ${step === s.id ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'border-white/10 text-white/40'}`}>
                  {s.id}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] flex items-center gap-2"><Database size={12}/> Analysis Engine Secured</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-20 lg:px-32 flex flex-col items-center bg-white">
        <div className="w-full max-w-2xl space-y-16">
          
          {step === 1 && (
            <div className="space-y-12 animate-reveal text-left">
              <div className="space-y-2">
                 <h2 className="text-5xl font-bold text-slate-900 tracking-tight italic">Identity</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Initialize executive session</p>
              </div>
              <div className="space-y-8">
                <Input label="Full Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sterling Cooper" />
                <Input label="Institutional Email" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} placeholder="corp@firm.ai" />
                <Input label="Access Code" type="password" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="pt-10 flex justify-end">
                <Button size="lg" className="rounded-full px-12 h-18 shadow-premium" onClick={() => setStep(2)}>Continue Protocol <ArrowRight size={18} className="ml-3" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-reveal text-left">
              <div className="space-y-2">
                 <h2 className="text-5xl font-bold text-slate-900 tracking-tight italic">Corporate Domain</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Primary intelligence source</p>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="relative">
                    <Globe2 size={16} className="absolute left-6 top-[54px] text-slate-300" />
                    <Input 
                      label="Company Website URL" 
                      className="pl-14 h-16 rounded-[2rem]"
                      value={formData.website} 
                      onChange={(e: any) => setFormData({...formData, website: e.target.value})} 
                      placeholder="e.g. https://consultancy.com" 
                    />
                  </div>
                  <p className="text-xs text-slate-400 italic px-4">Consult AI will autonomously analyze your domain to pre-fill your Business DNA.</p>
                </div>
              </div>

              {syncing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-brand-blue animate-spin"></div>
                  <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.4em] animate-pulse">Analyzing website...</p>
                </div>
              ) : (
                <div className="pt-10 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-all">Return</button>
                  <Button size="lg" className="rounded-full px-12 h-18 shadow-premium" onClick={handleWebsiteSync} disabled={!formData.website}>Analyze Corporate Presence <ArrowRight size={18} className="ml-3" /></Button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-reveal text-left pb-40">
              <div className="space-y-2">
                 <h2 className="text-5xl font-bold text-slate-900 tracking-tight italic">Business DNA</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Institutional Baseline</p>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Input label="Company Name" value={formData.companyName} onChange={(e: any) => setFormData({...formData, companyName: e.target.value})} />
                    <AutoFilledIndicator field="companyName" />
                  </div>
                  <div className="space-y-2">
                    <Input label="Primary Industry" value={formData.industry} onChange={(e: any) => setFormData({...formData, industry: e.target.value})} />
                    <AutoFilledIndicator field="industry" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Value Proposition</label>
                  <textarea 
                    className="w-full p-8 bg-slate-50 border border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-100 transition-all outline-none font-medium italic text-slate-600 leading-relaxed min-h-[120px]"
                    value={formData.valueProposition}
                    onChange={(e: any) => setFormData({...formData, valueProposition: e.target.value})}
                  />
                  <AutoFilledIndicator field="valueProposition" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Select label="Entity Size" options={['Solo (1)', 'Startup (2-10)', 'SME (11-50)', 'Mid-Market (51-500)', 'Enterprise (500+)']} value={formData.size} onChange={(e: any) => setFormData({...formData, size: e.target.value})} />
                  <div className="space-y-2">
                    <Select label="Growth Phase" options={['Early', 'Scaling', 'Mature']} value={formData.stage} onChange={(e: any) => setFormData({...formData, stage: e.target.value})} />
                    <AutoFilledIndicator field="stage" />
                  </div>
                </div>
              </div>

              <div className="pt-10 flex justify-between items-center">
                <button onClick={() => setStep(2)} className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-all">Return</button>
                <Button size="lg" className="rounded-full px-12 h-18 shadow-premium" onClick={() => setStep(4)}>Continue Phase <ArrowRight size={18} className="ml-3" /></Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-reveal text-left pb-40">
               <div className="space-y-2">
                 <h2 className="text-5xl font-bold text-slate-900 tracking-tight italic">Stock Alpha</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Institutional Equity Link (Optional)</p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text"
                      className="w-full h-16 pl-14 pr-6 rounded-2xl border border-[#F1F5F9] bg-slate-50 focus:bg-white focus:border-slate-300 outline-none transition-all text-sm font-medium"
                      placeholder="Search company name or ticker (e.g. AAPL, Tesla)..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStockSearch()}
                    />
                  </div>
                  <Button onClick={handleStockSearch} isLoading={searchingStocks} className="h-16 px-8 rounded-2xl bg-slate-950">Search</Button>
                </div>

                {stockResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                     {stockResults.map((s, i) => (
                       <button 
                        key={i} 
                        onClick={() => setFormData({...formData, stockTicker: s.symbol, stockExchange: s.exchange})}
                        className={`p-6 border rounded-2xl flex items-center justify-between text-left transition-all ${formData.stockTicker === s.symbol ? 'border-brand-blue bg-blue-50/50 ring-1 ring-brand-blue' : 'border-[#F1F5F9] hover:border-slate-200 bg-white'}`}
                       >
                         <div>
                            <p className="text-xl font-bold text-slate-950">{s.symbol}</p>
                            <p className="text-xs text-slate-500 font-medium italic">{s.name}</p>
                         </div>
                         <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.exchange}</span>
                            {formData.stockTicker === s.symbol && <Check size={16} className="text-brand-blue mt-1 ml-auto" />}
                         </div>
                       </button>
                     ))}
                  </div>
                )}

                {formData.stockTicker && (
                  <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex gap-6 items-center animate-reveal">
                     <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-500"><TrendingUp size={20} /></div>
                     <p className="text-sm font-medium text-emerald-700 italic">
                        "{formData.stockTicker} linked. Intelligence engine will monitor real-time equity signals."
                     </p>
                  </div>
                )}

                <p className="text-xs text-slate-400 italic px-4 leading-relaxed">
                  Linking your equity allows Consult AI to track institutional sentiment, analyst revisions, and market alpha directly related to your entity.
                </p>
              </div>

              <div className="pt-10 flex justify-between items-center">
                <button onClick={() => setStep(3)} className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-all">Return</button>
                <div className="flex gap-4">
                  <Button variant="outline" size="lg" className="rounded-full px-12 h-18" onClick={() => setStep(5)}>Skip Selection</Button>
                  <Button size="lg" className="rounded-full px-12 h-18 shadow-premium" onClick={() => setStep(5)}>Confirm & Continue <ArrowRight size={18} className="ml-3" /></Button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-12 animate-reveal text-left pb-40">
              <div className="space-y-2">
                 <h2 className="text-5xl font-bold text-slate-900 tracking-tight italic">Enrichment</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Strategy Documents (Optional)</p>
              </div>
              {/* ... Same as previous Enrichment step ... */}
              <div className="space-y-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-24 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-slate-50 transition-all group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-300 group-hover:text-brand-blue group-hover:shadow-premium transition-all">
                    <FileUp size={32} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-slate-900">Upload Strategic Briefs</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">PDF, PPTX, DOCX</p>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                </div>
              </div>
              <div className="pt-10 flex justify-between items-center">
                <button onClick={() => setStep(4)} className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-all">Return</button>
                <Button size="lg" className="rounded-full px-12 h-18 shadow-premium" onClick={() => setStep(6)}>Continue Phase <ArrowRight size={18} className="ml-3" /></Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-12 animate-reveal text-left pb-40">
              <div className="space-y-2">
                 <h2 className="text-5xl font-bold text-slate-900 tracking-tight italic">Mandate</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Establish system priority</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Growth', 'Efficiency', 'Expansion', 'Survival', 'Defense', 'Authority'].map(p => (
                  <button 
                    key={p} 
                    onClick={() => {
                      const cur = formData.strategicGoals;
                      setFormData({...formData, strategicGoals: cur.includes(p as any) ? cur.filter(x => x !== p) : [...cur, p as any]});
                    }}
                    className={`p-10 rounded-[3rem] border-2 text-left transition-all ${formData.strategicGoals.includes(p as any) ? 'bg-slate-950 border-slate-950 text-white shadow-2xl' : 'bg-white border-slate-50 text-slate-400 hover:border-brand-blue hover:text-slate-950'}`}
                  >
                    <p className="text-xl font-bold italic tracking-tight">Initiate {p.toLowerCase()} protocol.</p>
                  </button>
                ))}
              </div>
              <div className="pt-10 flex justify-between items-center">
                <button onClick={() => setStep(5)} className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-all">Return</button>
                <Button size="lg" className="rounded-full px-16 h-18 shadow-premium" isLoading={loading} onClick={handleRegister}>Authorize Intelligence Layer</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
