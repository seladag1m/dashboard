
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, Briefcase, Globe, Zap, 
  Users, TrendingUp, FileText, Settings, LogOut, Sparkles,
  ArrowRight, Activity, Target, AlertTriangle, ShieldCheck, ChevronRight, Share2, BarChart4,
  Loader2, ChevronLeft, ChevronRight as ChevronRightIcon,
  RefreshCw, Cpu, LayoutTemplate, Layers
} from 'lucide-react';
import { User, Signal, AppRoute } from '../types';
import { Logo, Button, Card } from '../components/UI';
import { 
  ConsultantModule, CompetitorModule, MarketModule, SocialPulseModule, 
  AlertsModule, MarketingModule, ReportsModule 
} from '../components/Modules';
import { ProjectList, ProjectWorkspace } from '../components/Projects';
import { fetchRealTimeIntelligence } from '../services/gemini';

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-inter font-medium uppercase tracking-widest transition-all group relative ${
      active ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-1' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
    } ${collapsed ? 'justify-center px-0' : ''}`}
    title={collapsed ? label : undefined}
  >
    <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? 'text-brand-blue' : ''} />
    {!collapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
    {active && !collapsed && <ChevronRight className="ml-auto w-3 h-3 opacity-40 group-hover:translate-x-0.5 transition-transform" />}
  </button>
);

const ExpertActionCard = ({ icon: Icon, label, onClick, description }: any) => (
  <button 
    onClick={onClick} 
    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-start gap-4 hover:border-brand-blue hover:shadow-float group transition-all duration-500 text-left"
  >
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all shadow-sm">
      <Icon size={20} />
    </div>
    <div>
      <span className="text-[11px] font-inter font-medium uppercase tracking-widest text-slate-950 block mb-1">{label}</span>
      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{description}</p>
    </div>
  </button>
);

export const Dashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoadingIntel(true);
      try {
        const res = await fetchRealTimeIntelligence(user, 'alerts');
        if (res.alerts) setSignals(res.alerts);
      } catch (e) { console.error(e); }
      finally { setLoadingIntel(false); }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000 * 10);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleExpertAction = (action: string) => {
    setActiveTab('consultant');
    // We could pass an initial query here to the consultant module
  };

  const renderOverview = () => (
    <div className="h-full overflow-y-auto px-6 lg:px-16 py-12 lg:py-20 space-y-16 animate-reveal max-w-7xl mx-auto custom-scrollbar font-inter">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] font-inter font-medium text-slate-400 uppercase tracking-[0.4em]">Strategic Engine Online</p>
          </div>
          <h1 className="text-7xl lg:text-8xl font-satoshi font-bold text-slate-950 tracking-tight leading-[0.9]">Executive <br/><span className="text-slate-300 italic">Command.</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <Button onClick={() => setActiveTab('consultant')} icon={Sparkles} className="shadow-2xl rounded-full h-16 px-10 text-lg">Deploy Consultant</Button>
        </div>
      </header>

      {/* User's requested expert actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <ExpertActionCard 
          icon={RefreshCw} 
          label="Refine Model" 
          description="Optimize business logic for current market signals." 
          onClick={() => handleExpertAction('refine_model')} 
        />
        <ExpertActionCard 
          icon={Layers} 
          label="Enhance DNA" 
          description="Inject new institutional data into core profile." 
          onClick={() => setActiveTab('settings')} 
        />
        <ExpertActionCard 
          icon={Cpu} 
          label="AI Agent" 
          description="Initialize autonomous agent for task execution." 
          onClick={() => handleExpertAction('ai_agent')} 
        />
        <ExpertActionCard 
          icon={LayoutTemplate} 
          label="Project Templates" 
          description="Deploy industry-standard strategic frameworks." 
          onClick={() => setActiveTab('projects')} 
        />
        <ExpertActionCard 
          icon={Target} 
          label="Signal Priority" 
          description="Calibrate threshold for institutional alerts." 
          onClick={() => handleExpertAction('signal_priority')} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Market State', val: user.dna.stage, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Active Signals', val: signals.length, valSuffix: 'Detected', icon: Zap, color: 'text-brand-blue', bg: 'bg-blue-50' },
          { label: 'Core Mandate', val: user.dna.strategicGoals[0] || 'Focus', icon: Target, color: 'text-slate-950', bg: 'bg-slate-100' },
          { label: 'Risk Protocol', val: user.dna.riskTolerance, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-premium hover:-translate-y-1 transition-all group">
            <p className="text-[10px] font-inter font-medium text-slate-400 uppercase tracking-widest mb-4 group-hover:text-brand-blue transition-colors">{stat.label}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-mono font-medium text-slate-950">{stat.val}</h3>
                {stat.valSuffix && <span className="text-xs font-inter font-medium text-slate-400">{stat.valSuffix}</span>}
              </div>
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}><stat.icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <Card title="Institutional Signal Matrix" headerAction={loadingIntel && <Loader2 size={16} className="animate-spin text-brand-blue" />}>
            <div className="divide-y divide-slate-50">
              {signals.length > 0 ? signals.map((s: any, idx) => (
                <div key={idx} onClick={() => handleExpertAction(`Analyze signal: ${s.title}`)} className="py-8 flex items-start justify-between group cursor-pointer">
                  <div className="flex gap-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${s.category === 'Threat' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-blue-50 text-brand-blue border border-blue-100'}`}>
                      {s.category === 'Threat' ? <AlertTriangle size={20}/> : <Zap size={20}/>}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[9px] font-inter font-medium uppercase tracking-widest px-3 py-1 rounded-full ${s.category === 'Threat' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{s.category || 'SIGNAL'}</span>
                        <span className="text-[9px] font-inter font-medium text-slate-300 uppercase tracking-widest">{s.time || 'SYNCHRONOUS'}</span>
                      </div>
                      <h4 className="text-xl font-satoshi font-medium text-slate-900 group-hover:text-brand-blue transition-colors">"{s.title}"</h4>
                      <p className="text-xs text-slate-400 mt-2 font-inter leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 text-slate-300 rounded-full group-hover:bg-brand-blue group-hover:text-white transition-all">
                     <ChevronRight size={16} />
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-4 opacity-30 grayscale">
                   <ShieldCheck size={48} className="mx-auto" />
                   <p className="text-xs font-inter font-medium uppercase tracking-[0.4em]">Horizon Clean. Surveillance active.</p>
                </div>
              )}
            </div>
            <Button variant="ghost" fullWidth className="mt-8 rounded-2xl border border-slate-50 py-4 h-auto" onClick={() => setActiveTab('signals')}>Access Strategic Intelligence Matrix <ArrowRight size={14} className="ml-2"/></Button>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="p-12 bg-slate-950 rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-brand-blue/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <div className="flex items-center gap-3 text-brand-blue mb-2 relative z-10">
                <Sparkles size={18} />
                <span className="text-[10px] font-inter font-medium uppercase tracking-[0.4em]">Advisor Proactive</span>
             </div>
             <p className="text-2xl font-source-serif italic font-light relative z-10 leading-relaxed text-left">
               "Detected a 14% shift in competitor pricing strategy. Initializing counter-maneuver frameworks..."
             </p>
             <button onClick={() => setActiveTab('market')} className="text-[10px] font-inter font-medium uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 relative z-10">
               Audit Market Vector <ArrowRight size={12} />
             </button>
          </div>
          
          <Card title="Quick Deploy">
             <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Executive Brief', tab: 'reports', icon: FileText },
                  { label: 'Market Campaign', tab: 'marketing', icon: TrendingUp },
                  { label: 'Competitor Mapping', tab: 'competitors', icon: Users },
                ].map((btn, i) => (
                  <button key={i} onClick={() => setActiveTab(btn.tab)} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-brand-blue transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors shadow-sm"><btn.icon size={18} /></div>
                       <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{btn.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-200" />
                  </button>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex bg-[#F8FAFC] selection:bg-brand-blue selection:text-white font-inter">
      <aside className={`bg-white border-r border-slate-100 flex flex-col p-10 z-50 transition-all duration-500 ease-in-out relative ${isSidebarCollapsed ? 'w-24 px-4' : 'w-[340px]'}`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors z-[60]"
        >
          {isSidebarCollapsed ? <ChevronRightIcon size={14} className="text-slate-400" /> : <ChevronLeft size={14} className="text-slate-400" />}
        </button>

        <div className={`mb-20 flex justify-center transition-all ${isSidebarCollapsed ? 'px-0' : 'px-5'}`}>
          <Logo collapsed={isSidebarCollapsed} />
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Command Hub" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={MessageSquare} label="AI Consultant" active={activeTab === 'consultant'} onClick={() => { setActiveTab('consultant'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Briefcase} label="Mandates" active={activeTab === 'projects'} onClick={() => { setActiveTab('projects'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          
          <div className={`h-10 transition-opacity ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}></div>
          <p className={`text-[9px] font-inter font-medium text-slate-300 uppercase tracking-[0.4em] mb-4 transition-all ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'px-5 opacity-100'}`}>Intelligence</p>
          
          <SidebarItem icon={Users} label="Competitors" active={activeTab === 'competitors'} onClick={() => { setActiveTab('competitors'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Globe} label="Market Matrix" active={activeTab === 'market'} onClick={() => { setActiveTab('market'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Share2} label="Social Pulse" active={activeTab === 'social'} onClick={() => { setActiveTab('social'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Zap} label="Signal Hub" active={activeTab === 'signals'} onClick={() => { setActiveTab('signals'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          
          <div className={`h-10 transition-opacity ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}></div>
          <SidebarItem icon={TrendingUp} label="Deployment" active={activeTab === 'marketing'} onClick={() => { setActiveTab('marketing'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={FileText} label="Executive Archive" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
        </nav>

        <div className="mt-auto pt-10 border-t border-slate-50 space-y-2">
          <SidebarItem icon={Settings} label="Calibration" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSelectedProject(null); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LogOut} label="Revoke Session" onClick={onLogout} collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'consultant' && <ConsultantModule user={user} />}
        {activeTab === 'projects' && (
          selectedProject ? 
            <ProjectWorkspace user={user} project={selectedProject} onBack={() => setSelectedProject(null)} /> : 
            <ProjectList user={user} onSelectProject={setSelectedProject} />
        )}
        {activeTab === 'competitors' && <CompetitorModule user={user} onAnalyze={handleExpertAction} />}
        {activeTab === 'market' && <MarketModule user={user} onAnalyze={handleExpertAction} />}
        {activeTab === 'social' && <SocialPulseModule user={user} onAnalyze={handleExpertAction} />}
        {activeTab === 'signals' && <AlertsModule user={user} onAnalyze={handleExpertAction} />}
        {activeTab === 'marketing' && <MarketingModule user={user} onAnalyze={handleExpertAction} />}
        {activeTab === 'reports' && <ReportsModule user={user} onAnalyze={handleExpertAction} />}
        {activeTab === 'settings' && (
          <div className="h-full flex items-center justify-center p-20 bg-slate-50/50">
            <div className="max-w-2xl w-full text-center space-y-12">
               <h2 className="text-4xl font-serif font-bold italic">DNA Calibration</h2>
               <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-premium space-y-8 text-left">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry Domain</p>
                    <p className="text-xl font-bold text-slate-900 border-b border-slate-50 pb-4">{user.dna.industry}</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Synthesis</p>
                    <p className="text-xl font-bold text-slate-900 border-b border-slate-50 pb-4">{user.dna.businessModel} Protocol</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Mandate</p>
                    <p className="text-xl font-bold text-slate-900 border-b border-slate-50 pb-4">{user.dna.strategicGoals.join(', ')}</p>
                  </div>
                  <Button fullWidth variant="outline" className="h-16 rounded-full" onClick={() => alert("DNA Modification Protocol Locked. Contact Admin for core changes.")}>
                    Initiate Profile Update
                  </Button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
