import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Dna, 
  Users, 
  Zap, 
  FileText, 
  LayoutDashboard, 
  Search,
  User,
  LogOut,
  Settings,
  Sparkles,
  ChevronRight,
  Target,
  Search as SearchIcon
} from 'lucide-react';
import { Dashboard } from './pages/Dashboard.tsx';
import { LandingPage } from './pages/Landing.tsx';
import { AuthPage } from './pages/Auth.tsx';
import { ConsultantModule, CompetitorModule, MarketModule, AlertsModule, ReportsModule, SocialPulseModule, MarketingModule } from './components/Modules.tsx';
import { AppRoute, User as UserType } from './types.ts';
import { db } from './services/database.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(db.auth.getCurrentUser());
  const [route, setRoute] = useState<AppRoute>(currentUser ? AppRoute.DASHBOARD : AppRoute.LANDING);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    setRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = () => {
    db.auth.logout();
    setCurrentUser(null);
    setRoute(AppRoute.LANDING);
  };

  if (!currentUser) {
    if (route === AppRoute.REGISTER) return <AuthPage type="register" onLogin={handleLogin} onNavigate={setRoute} />;
    if (route === AppRoute.LOGIN) return <AuthPage type="login" onLogin={handleLogin} onNavigate={setRoute} />;
    return <LandingPage onNavigate={setRoute} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Dashboard user={currentUser} onLogout={handleLogout} />;
      case 'consultant': return <ConsultantModule user={currentUser} />;
      case 'competitors': return <CompetitorModule user={currentUser} onAnalyze={() => setActiveTab('consultant')} />;
      case 'market': return <MarketModule user={currentUser} onAnalyze={() => setActiveTab('consultant')} />;
      case 'social': return <SocialPulseModule user={currentUser} onAnalyze={() => setActiveTab('consultant')} />;
      case 'signals': return <AlertsModule user={currentUser} onAnalyze={() => setActiveTab('consultant')} />;
      case 'marketing': return <MarketingModule user={currentUser} onAnalyze={() => setActiveTab('consultant')} />;
      case 'reports': return <ReportsModule user={currentUser} onAnalyze={() => setActiveTab('consultant')} />;
      default: return <Dashboard user={currentUser} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-brand-paper font-sans selection:bg-brand-blue/10 selection:text-brand-blue overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-sm relative">
        <div className="p-10 flex items-center gap-4 border-b border-slate-50">
          <div className="w-12 h-12 bg-brand-slate rounded-2xl flex items-center justify-center text-white shadow-xl">
            <LayoutDashboard size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-brand-slate uppercase italic">Consult <span className="text-brand-blue not-italic">AI</span></span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">Strategic Engine</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-2">
          <SectionHeader label="Intelligence" />
          <SidebarItem icon={LayoutDashboard} label="Command Hub" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={Cpu} label="AI Consultant" active={activeTab === 'consultant'} onClick={() => setActiveTab('consultant')} />
          
          <div className="h-6"></div>
          <SectionHeader label="Operational" />
          <SidebarItem icon={Users} label="Rival Mapping" active={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')} />
          <SidebarItem icon={Target} label="Market Logic" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
          <SidebarItem icon={Zap} label="Signal Stream" active={activeTab === 'signals'} onClick={() => setActiveTab('signals')} />
          
          <div className="h-6"></div>
          <SectionHeader label="Output" />
          <SidebarItem icon={Sparkles} label="Deployments" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
          <SidebarItem icon={FileText} label="Board Briefs" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </nav>

        <div className="mt-auto p-6 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <SidebarItem icon={Settings} label="Calibration" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={LogOut} label="Revoke Session" onClick={handleLogout} active={false} />
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-12 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol: Grounded Intelligence</span>
          </div>
          
          <div className="flex items-center gap-6 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-brand-blue uppercase font-black tracking-widest">{currentUser.companyName}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-premium">
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div key={activeTab} className="h-full animate-reveal">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-3 px-4">{label}</p>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative ${
      active 
        ? 'bg-brand-slate text-white shadow-2xl translate-x-1' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-brand-slate'
    }`}
  >
    <Icon size={18} className={active ? 'text-brand-blue' : 'group-hover:text-brand-slate transition-colors'} />
    <span className={`text-[11px] font-bold uppercase tracking-widest transition-all ${active ? 'opacity-100' : 'opacity-70'}`}>
      {label}
    </span>
    {active && <ChevronRight className="ml-auto w-3 h-3 opacity-50" />}
  </button>
);

export default App;