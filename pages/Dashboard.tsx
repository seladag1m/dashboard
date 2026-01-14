
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, Briefcase, Globe, Zap, 
  Users, TrendingUp, FileText, Settings, LogOut, Sparkles,
  ArrowRight, Activity, Target, ShieldCheck, ChevronRight, Share2,
  Loader2, ChevronLeft, ChevronRight as ChevronRightIcon,
  RefreshCw, Cpu, LayoutTemplate, Layers, AlertTriangle, X,
  PanelLeftClose, PanelLeftOpen, BarChart3
} from 'lucide-react';
import { User, Signal, AppRoute } from '../types';
import { Logo, Button, Card, Skeleton, Modal } from '../components/UI';
import { 
  ConsultantModule, CompetitorModule, MarketModule, SocialPulseModule, 
  AlertsModule, MarketingModule, ReportsModule, SettingsModule, StockIntelligenceModule
} from '../components/Modules';
import { ProjectList, ProjectWorkspace } from '../components/Projects';
import { fetchRealTimeIntelligence } from '../services/gemini';
import { db } from '../services/database';

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] transition-all group relative ${
      active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-950'
    } ${collapsed ? 'justify-center px-0' : ''}`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#246BFD]"></div>}
    <Icon size={16} strokeWidth={2.5} className={active ? 'text-[#246BFD]' : 'group-hover:text-slate-950 transition-colors'} />
    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
  </button>
);

export const Dashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [consultantIntent, setConsultantIntent] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoadingIntel(true);
      try {
        const res = await fetchRealTimeIntelligence(currentUser, 'alerts');
        if (res.alerts) setSignals(res.alerts);
      } catch (e) { console.error(e); }
      finally { setLoadingIntel(false); }
    };
    fetchAlerts();
  }, [currentUser.id]);

  const handleUpdateDNA = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    db.auth.updateUser(updatedUser);
  };

  const handleTriggerAnalysis = (query: string) => {
    setConsultantIntent(query);
    setActiveTab('consultant');
  };

  const renderOverview = () => (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 space-y-24 animate-fade-in bg-white max-w-[1800px] mx-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-[#F1F5F9] pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Command Node Synchronized</p>
          </div>
          <h1 className="text-8xl font-bold text-slate-950 tracking-tighter leading-[0.8]">
            Strategic <br/><span className="text-slate-200">Intelligence.</span>
          </h1>
        </div>
        <div className="flex gap-4">
           {currentUser.dna.stockTicker && (
             <Button onClick={() => setActiveTab('stocks')} variant="outline" size="lg" className="h-20 px-8 rounded-full shadow-premium border-brand-blue/20">
                <TrendingUp size={20} className="text-brand-blue mr-3" />
                {currentUser.dna.stockTicker} Active
             </Button>
           )}
           <Button onClick={() => setActiveTab('consultant')} variant="action" size="lg" className="h-20 px-12 rounded-full shadow-premium">
              Deploy AI Consultant
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'System Phase', val: currentUser.dna.stage, icon: Activity, color: 'text-emerald-500' },
          { label: 'Active Signals', val: signals.length, valSuffix: 'LIVE', icon: Zap, color: 'text-[#246BFD]' },
          { label: 'Strategic Goal', val: currentUser.dna.strategicGoals[0] || 'Efficiency', icon: Target, color: 'text-slate-950' },
          { label: 'Risk Protocol', val: currentUser.dna.riskTolerance || 'Medium', icon: ShieldCheck, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="p-10 bg-white border border-[#F1F5F9] rounded-[32px] group transition-all hover:border-slate-200">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">{stat.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-bold tracking-tighter text-slate-950">{stat.val}</h3>
              <div className={`w-12 h-12 flex items-center justify-center ${stat.color}`}><stat.icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <Card title="Institutional Anomaly Hub" headerAction={loadingIntel && <Loader2 size={16} className="animate-spin text-[#246BFD]" />}>
            <div className="space-y-2">
              {signals.length > 0 ? signals.slice(0, 4).map((s: any, idx) => (
                <div key={idx} className="p-8 border border-transparent hover:border-[#F1F5F9] rounded-[24px] flex items-center justify-between group cursor-pointer transition-all">
                  <div className="flex gap-8 items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${s.priority === 'Critical' ? 'text-rose-500 bg-rose-50 border-rose-100' : 'text-[#246BFD] bg-blue-50 border-blue-100'}`}>
                      <Zap size={20}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-bold text-slate-950 tracking-tight">"{s.title}"</h4>
                        <span className="text-[8px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{s.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium italic opacity-70">"{s.desc}"</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-950 transition-colors" />
                </div>
              )) : <Skeleton height="200px" />}
            </div>
            <Button variant="outline" fullWidth className="mt-12 h-16 rounded-full border-[#F1F5F9]" onClick={() => setActiveTab('signals')}>
              Access Detailed Alerts Hub <ArrowRight size={14} className="ml-3"/>
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-10">
          {currentUser.dna.stockTicker && (
            <div className="p-12 bg-emerald-50 rounded-[40px] border border-emerald-100 space-y-8 group cursor-pointer" onClick={() => setActiveTab('stocks')}>
               <p className="text-2xl font-bold tracking-tight italic text-emerald-900 leading-tight">
                 "Live analysis for {currentUser.dna.stockTicker} indicates potential alpha window."
               </p>
               <button className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-600 flex items-center gap-3">
                 View Stock Alpha <ArrowRight size={14} />
               </button>
            </div>
          )}
          
          <Card title="Tactical Roadmaps">
             <div className="space-y-4">
                {[
                  { label: 'Briefing Reports', tab: 'reports', icon: FileText },
                  { label: 'Neural Campaigns', tab: 'marketing', icon: TrendingUp },
                  { label: 'Rival Surveillance', tab: 'competitors', icon: Users },
                ].map((btn, i) => (
                  <button key={i} onClick={() => setActiveTab(btn.tab)} className="w-full p-6 bg-white border border-[#F1F5F9] rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all group">
                    <div className="flex items-center gap-6 text-slate-400 group-hover:text-[#246BFD] transition-colors">
                       <btn.icon size={20} />
                       <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">{btn.label}</span>
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
    <div className="h-full flex bg-white font-inter text-slate-950">
      <aside className={`bg-white border-r border-[#F1F5F9] flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-[320px]'}`}>
        <div className={`h-24 border-b border-[#F1F5F9] flex items-center px-6 transition-all ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && <Logo />}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-2.5 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pt-10">
          <SidebarItem icon={LayoutDashboard} label="Command Hub" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={MessageSquare} label="AI Consultant" active={activeTab === 'consultant'} onClick={() => setActiveTab('consultant')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Briefcase} label="Mandates" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} collapsed={isSidebarCollapsed} />
          
          {!isSidebarCollapsed && <p className="px-8 mt-12 mb-4 text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Intelligence Matrix</p>}
          
          <SidebarItem icon={BarChart3} label="Stock Alpha" active={activeTab === 'stocks'} onClick={() => setActiveTab('stocks')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Users} label="Competitors" active={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Globe} label="Market Matrix" active={activeTab === 'market'} onClick={() => setActiveTab('market')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Share2} label="Social Pulse" active={activeTab === 'social'} onClick={() => setActiveTab('social')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Zap} label="Signals" active={activeTab === 'signals'} onClick={() => setActiveTab('signals')} collapsed={isSidebarCollapsed} />
          
          {!isSidebarCollapsed && <p className="px-8 mt-12 mb-4 text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Deployment</p>}
          <SidebarItem icon={TrendingUp} label="Campaigns" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={FileText} label="Archives" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} collapsed={isSidebarCollapsed} />
        </nav>

        <div className="mt-auto p-6 space-y-4 border-t border-[#F1F5F9]">
          <SidebarItem icon={Settings} label="Calibration" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LogOut} label="Log Out" onClick={() => setShowLogoutConfirm(true)} collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative">
        <div key={activeTab} className="h-full animate-fade-in">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'stocks' && <StockIntelligenceModule user={currentUser} />}
          {activeTab === 'consultant' && (
            <ConsultantModule 
              user={currentUser} 
              initialQuery={consultantIntent} 
              onQueryConsumed={() => setConsultantIntent(null)} 
            />
          )}
          {activeTab === 'projects' && (
            selectedProject ? 
              <ProjectWorkspace user={currentUser} project={selectedProject} onBack={() => setSelectedProject(null)} /> : 
              <ProjectList user={currentUser} onSelectProject={setSelectedProject} />
          )}
          {activeTab === 'competitors' && <CompetitorModule user={currentUser} onAnalyze={handleTriggerAnalysis} />}
          {activeTab === 'market' && <MarketModule user={currentUser} onAnalyze={() => handleTriggerAnalysis('Perform strategic market vector synthesis.')} />}
          {activeTab === 'social' && <SocialPulseModule user={currentUser} onAnalyze={handleTriggerAnalysis} />}
          {activeTab === 'signals' && <AlertsModule user={currentUser} onAnalyze={handleTriggerAnalysis} />}
          {activeTab === 'marketing' && <MarketingModule user={currentUser} onAnalyze={handleTriggerAnalysis} />}
          {activeTab === 'reports' && <ReportsModule user={currentUser} onAnalyze={handleTriggerAnalysis} />}
          {activeTab === 'settings' && <SettingsModule user={currentUser} onUpdate={handleUpdateDNA} />}
        </div>
      </main>

      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Executive Exit">
         <div className="space-y-8 py-4 text-left">
            <p className="text-lg text-slate-500 font-medium italic leading-relaxed">
              "You are about to terminate the active strategic session. Institutional context will be archived and secured."
            </p>
            <div className="flex gap-4">
               <Button variant="outline" fullWidth onClick={() => setShowLogoutConfirm(false)} className="h-14 rounded-xl">Resume Protocol</Button>
               <Button variant="primary" fullWidth onClick={onLogout} className="h-14 rounded-xl bg-rose-600 hover:bg-rose-700">Authorize Exit</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};