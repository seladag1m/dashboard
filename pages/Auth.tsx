
import React, { useState } from 'react';
import { Logo, Button, Input, Select } from '../components/UI';
import { AppRoute, User, CompanySize, Region, MainGoal, SkillLevel } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, Building2, ChevronLeft, Loader2, BarChart2, Check, Briefcase } from 'lucide-react';
import { db } from '../services/database';

interface AuthPageProps {
  type: 'login' | 'register';
  onNavigate: (r: AppRoute) => void;
  onLogin: (user: User) => void;
}

// --- OPTIONS ---
const INDUSTRIES = [
  "Aerospace", "Agriculture", "Automotive", "Biotech", "Construction", 
  "Consulting", "Consumer Goods", "Education", "Energy", "Entertainment", 
  "Fashion", "Finance", "Healthcare", "Hospitality", "Legal", 
  "Logistics", "Manufacturing", "Media", "Non-Profit", "Public Sector", 
  "Real Estate", "Retail", "Technology", "Telecommunications"
];
const SIZES: CompanySize[] = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const REGIONS: Region[] = ['North America', 'Europe', 'Asia Pacific', 'LATAM', 'MEA'];
const GOALS: MainGoal[] = ['Improve Revenue', 'Analyze Competitors', 'Explore Market', 'Boost Marketing', 'Everything'];
const SKILLS: SkillLevel[] = ['Beginner', 'Intermediate', 'Expert'];

export const AuthPage: React.FC<AuthPageProps> = ({ type, onNavigate, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Registration State
  const [step, setStep] = useState(1); // 1: Identity, 2: Entity, 3: Strategy
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    companyName: '', 
    industry: '', 
    size: '' as CompanySize, 
    region: '' as Region,
    description: '',
    goal: '' as MainGoal, 
    skillLevel: 'Intermediate' as SkillLevel 
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await db.auth.login(formData.email, formData.password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Safe ID generation
      const safeId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      
      const newUser: User = {
        id: safeId,
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        industry: formData.industry,
        size: formData.size,
        region: formData.region,
        description: formData.description,
        goal: formData.goal,
        skillLevel: formData.skillLevel,
        language: 'English',
      };
      
      const user = await db.auth.register(newUser, formData.password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("All fields are required.");
        return false;
      }
      if (!formData.email.includes('@')) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.companyName || !formData.industry || !formData.size || !formData.region || !formData.description) {
        setError("Please complete your company profile and description.");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.goal) {
        setError("Please select a primary goal.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step < 3) setStep(step + 1);
    else handleRegister();
  };

  const StepIndicator = () => (
    <div className="w-full max-w-xs mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-bg-neutral -z-10"></div>
        {[
           { s: 1, label: 'Identity' }, 
           { s: 2, label: 'Company' }, 
           { s: 3, label: 'Goals' }
        ].map((item, idx) => (
          <div key={item.s} className="flex flex-col items-center gap-2 bg-white px-2">
            <div 
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 
              ${item.s === step 
                ? 'bg-text-primary border-text-primary text-white scale-110 shadow-lg' 
                : item.s < step 
                  ? 'bg-accent border-accent text-white' 
                  : 'bg-white border-bg-neutral text-text-light'}`}
            >
              {item.s < step ? <Check size={16} strokeWidth={3} /> : item.s}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between px-1 mt-3">
         {['Identity', 'Company', 'Strategy'].map((l, i) => (
           <span key={i} className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${step === i + 1 ? 'text-text-primary' : 'text-text-light'}`}>
             {l}
           </span>
         ))}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex bg-white font-sans text-text-primary selection:bg-accent-light selection:text-accent overflow-hidden">
      
      {/* LEFT PANEL - VISUAL */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-[45%] bg-bg-soft border-r border-bg-neutral items-center justify-center overflow-hidden p-12 z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-md w-full animate-fade-in">
           <div className="mb-16">
              <Logo />
           </div>
           
           <div className="relative mb-16 group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-tr from-accent/10 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-float border border-white/60 transform transition-transform group-hover:rotate-x-2 duration-500 ring-1 ring-black/5">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-text-primary to-black flex items-center justify-center text-white shadow-lg">
                       <BarChart2 size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-text-headline">Market Intelligence</h3>
                       <p className="text-sm text-text-secondary">Live Analysis Module</p>
                    </div>
                 </div>
                 <div className="space-y-5">
                    <div className="flex justify-between items-end">
                       <div className="space-y-2">
                          <div className="h-2 w-24 bg-bg-soft rounded-full"></div>
                          <div className="h-8 w-16 bg-text-primary rounded-lg"></div>
                       </div>
                       <div className="text-right space-y-1.5">
                           <div className="h-2 w-16 bg-bg-soft rounded-full ml-auto"></div>
                           <div className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg">+24.5%</div>
                       </div>
                    </div>
                    <div className="h-32 bg-bg-soft rounded-2xl border border-bg-neutral overflow-hidden relative">
                       <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-accent/10 to-transparent"></div>
                       <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
                          <path d="M0,100 Q50,50 100,80 T200,40 T300,60 T400,20 V128 H0 Z" fill="none" stroke="#296CFF" strokeWidth="3" />
                       </svg>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="space-y-8">
              <h2 className="text-4xl font-serif font-semibold leading-tight text-text-headline">
                 Strategy at the <br/><span className="text-accent">Speed of AI</span>.
              </h2>
              <ul className="space-y-5">
                 {[
                    'Instant Competitive Landscape Analysis', 
                    'Real-time Market Trend Detection', 
                    'Automated Strategic Frameworks'
                 ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-4 text-text-secondary text-base font-medium">
                       <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center shrink-0 shadow-sm">
                          <Check size={14} strokeWidth={3} />
                       </div> 
                       {feat}
                    </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:ml-[45%] lg:w-[55%] h-full bg-white flex flex-col relative z-0 overflow-y-auto">
         <div className="flex-grow flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24">
            <div className="w-full max-w-md mx-auto">
               
               <div className="lg:hidden mb-12 flex justify-center">
                  <Logo />
               </div>

               {type === 'login' ? (
                  // --- LOGIN VIEW ---
                  <div className="animate-slide-up w-full">
                     <div className="text-center mb-12">
                        <h1 className="text-4xl font-serif font-bold text-text-headline mb-4">Welcome Back</h1>
                        <p className="text-text-secondary text-base">Enter your credentials to access the dashboard.</p>
                     </div>

                     {error && (
                        <div className="mb-8 p-4 bg-error/5 border border-error/20 text-error text-sm rounded-xl flex items-start gap-3 animate-fade-in">
                           <span className="w-1.5 h-1.5 bg-error rounded-full mt-2 shrink-0"></span> 
                           <span className="flex-1 font-medium">{error}</span>
                        </div>
                     )}

                     <form onSubmit={handleLogin} className="space-y-6">
                        <Input 
                          label="Email Address" 
                          icon={Mail} 
                          type="email" 
                          value={formData.email} 
                          onChange={e => updateForm('email', e.target.value)} 
                          required 
                          placeholder="name@company.com" 
                        />
                        <div className="space-y-3">
                           <Input 
                             label="Password" 
                             icon={Lock} 
                             type="password" 
                             value={formData.password} 
                             onChange={e => updateForm('password', e.target.value)} 
                             required 
                             placeholder="••••••••" 
                           />
                           <div className="flex justify-end">
                              <button type="button" className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                                 Forgot Password?
                              </button>
                           </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          fullWidth 
                          disabled={loading} 
                          variant="primary" 
                          size="lg"
                          className="mt-6 h-14 text-base"
                        >
                           {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                        </Button>
                     </form>

                     <div className="mt-12 pt-8 border-t border-bg-soft text-center">
                        <p className="text-xs text-text-light mb-4 font-bold uppercase tracking-widest">New to Consult AI?</p>
                        <Button 
                           variant="outline" 
                           fullWidth 
                           onClick={() => onNavigate(AppRoute.REGISTER)}
                           className="h-14 text-base"
                        >
                           Create an Account
                        </Button>
                     </div>
                  </div>
               ) : (
                  // --- REGISTER VIEW ---
                  <div className="animate-slide-up w-full">
                     <div className="mb-10">
                        <button 
                           onClick={() => onNavigate(AppRoute.LOGIN)} 
                           className="text-sm font-bold text-text-secondary hover:text-text-primary flex items-center gap-2 mb-8 transition-colors pl-1 group"
                        >
                           <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Sign In
                        </button>
                        <h1 className="text-4xl font-serif font-bold text-text-headline mb-4">Create Account</h1>
                        <p className="text-text-secondary text-base">Join elite consultants using AI for strategic advantage.</p>
                     </div>

                     <StepIndicator />

                     <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="w-full">
                        <div className="min-h-[360px] w-full">
                           {/* STEP 1: IDENTITY */}
                           {step === 1 && (
                              <div className="animate-fade-in space-y-6">
                                 <Input 
                                   label="Full Name" 
                                   icon={UserIcon} 
                                   value={formData.name} 
                                   onChange={e => updateForm('name', e.target.value)} 
                                   autoFocus 
                                   placeholder="John Doe" 
                                 />
                                 <Input 
                                   label="Work Email" 
                                   icon={Mail} 
                                   type="email"
                                   value={formData.email} 
                                   onChange={e => updateForm('email', e.target.value)} 
                                   placeholder="john@company.com" 
                                 />
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Input 
                                      label="Password" 
                                      icon={Lock} 
                                      type="password" 
                                      value={formData.password} 
                                      onChange={e => updateForm('password', e.target.value)} 
                                      placeholder="••••••••" 
                                    />
                                    <Input 
                                      label="Confirm Password" 
                                      icon={Lock} 
                                      type="password" 
                                      value={formData.confirmPassword} 
                                      onChange={e => updateForm('confirmPassword', e.target.value)} 
                                      placeholder="••••••••" 
                                    />
                                 </div>
                              </div>
                           )}

                           {/* STEP 2: COMPANY */}
                           {step === 2 && (
                              <div className="animate-fade-in space-y-6">
                                 <Input 
                                   label="Company Name" 
                                   icon={Building2} 
                                   value={formData.companyName} 
                                   onChange={e => updateForm('companyName', e.target.value)} 
                                   autoFocus 
                                   placeholder="Acme Inc." 
                                 />
                                 <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide ml-1">Company Description</label>
                                    <textarea
                                       className="block w-full rounded-xl border border-bg-neutral bg-white p-4 text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-glow transition-all shadow-input resize-none h-28"
                                       placeholder="What does your company do? (e.g., We build AI-powered logistics software for last-mile delivery...)"
                                       value={formData.description}
                                       onChange={e => updateForm('description', e.target.value)}
                                    />
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Select 
                                      label="Industry" 
                                      options={INDUSTRIES} 
                                      value={formData.industry} 
                                      onChange={e => updateForm('industry', e.target.value)} 
                                    />
                                    <Select 
                                      label="Company Size" 
                                      options={SIZES} 
                                      value={formData.size} 
                                      onChange={e => updateForm('size', e.target.value)} 
                                    />
                                 </div>
                                 <Select 
                                   label="Primary Region" 
                                   options={REGIONS} 
                                   value={formData.region} 
                                   onChange={e => updateForm('region', e.target.value)} 
                                 />
                              </div>
                           )}

                           {/* STEP 3: STRATEGY */}
                           {step === 3 && (
                              <div className="animate-fade-in space-y-8">
                                 <Select 
                                   label="Main Strategic Goal" 
                                   options={GOALS} 
                                   value={formData.goal} 
                                   onChange={e => updateForm('goal', e.target.value)} 
                                 />
                                 
                                 <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide ml-1 mb-4">Your Expertise Level</label>
                                    <div className="grid grid-cols-3 gap-4">
                                       {SKILLS.map(s => (
                                          <button 
                                             type="button"
                                             key={s}
                                             onClick={() => updateForm('skillLevel', s)}
                                             className={`py-4 px-3 rounded-2xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-3 text-center h-28
                                             ${formData.skillLevel === s 
                                                ? 'border-text-primary bg-text-primary text-white shadow-lg ring-4 ring-text-primary/10' 
                                                : 'border-bg-neutral text-text-secondary hover:border-text-light bg-white hover:bg-bg-soft'}`}
                                          >
                                             <Briefcase size={20} className={formData.skillLevel === s ? 'text-accent' : 'text-text-light'} />
                                             {s}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>

                        {error && (
                           <div className="mt-8 p-4 bg-error/5 border border-error/20 text-error text-sm rounded-xl flex items-start gap-2 animate-pulse">
                              <span className="w-1.5 h-1.5 bg-error rounded-full mt-2 shrink-0"></span> {error}
                           </div>
                        )}

                        <div className="flex justify-between items-center mt-10 pt-8 border-t border-bg-soft">
                           {step > 1 ? (
                              <button 
                                 type="button" 
                                 onClick={() => setStep(s => s - 1)} 
                                 className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors px-4 py-3 rounded-xl hover:bg-bg-soft"
                              >
                                 Back
                              </button>
                           ) : (
                              <div></div>
                           )}
                           
                           <Button 
                              type="submit" 
                              disabled={loading} 
                              variant="primary" 
                              className="px-10 h-14 text-base shadow-lg shadow-accent/25 w-auto min-w-[160px]"
                           >
                              {loading ? <Loader2 className="animate-spin" /> : (step === 3 ? 'Complete Setup' : 'Continue')}
                              {!loading && <ArrowRight size={18} className="ml-2" />}
                           </Button>
                        </div>
                     </form>
                  </div>
               )}
               
               <div className="mt-12 text-center">
                  <p className="text-[10px] text-text-light">
                     Protected by reCAPTCHA and subject to the Google <a href="#" className="underline hover:text-text-secondary">Privacy Policy</a> and <a href="#" className="underline hover:text-text-secondary">Terms of Service</a>.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
