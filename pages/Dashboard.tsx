
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, MessageSquare, Briefcase, Globe, Users, 
  TrendingUp, LogOut, Settings,
  ArrowRight, BarChart3, Layers, Edit3, Map,
  ChevronUp, Target, AlertTriangle, Zap,
  Briefcase as BriefcaseIcon, FileText, Activity, Menu, ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { User, Project } from '../types';
import { Logo, Button, Card } from '../components/UI';
import { ChatPanel } from './Chat';
import { ProjectList, ProjectWorkspace } from '../components/Projects';
import { 
  CompetitorModule, 
  MarketModule, 
  AlertsModule, 
  SocialPulseModule, 
  MarketingModule, 
  ReportsModule,
  useLiveIntelligence
} from '../components/Modules';
import { RealMapWidget } from '../components/Charts';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge, collapsed }: any) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group ${
      active 
      ? 'bg-slate-900 text-white shadow-lg' 
      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
    } ${collapsed ? 'justify-center px-0' : ''}`}
  >
    <div className="shrink-0">
      <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? '' : 'group-hover:text-slate-900 transition-colors'} />
    </div>
    {!collapsed && (
      <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
        <span className="truncate">{label}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {badge}
          </span>
        )}
      </div>
    )}
  </button>
);

const ExecutiveRealityBar = ({ user, score, insight, confidence, onEdit }: any) => (
  <div className="w-full bg-white border border-slate-100 rounded-[2rem] p-6 lg:p-10 flex flex-col xl:flex-row items-center justify-between gap-8 shadow-sm animate-reveal">
    <div className="flex items-center gap-8 flex-1 w-full xl:w-auto">
      <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center text-white shadow-xl shrink-0">
        <Target size={36} strokeWidth={1.5} />
      </div>
      <div className="overflow-hidden space-y-2 text-left">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">{user.companyName}</h2>
          <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.industry}</span>
          {confidence && (
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[9px] font-bold text-blue-600 uppercase tracking-widest border border-blue-100">Confidence: {confidence}</span>
          )}
        </div>
        <p className="text-base text-slate-500 font-medium italic leading-relaxed line-clamp-2">"{insight || 'Calibrating global intelligence matrices...'}"</p>
      </div>
    </div>
    <div className="flex items-center justify-between xl:justify-end gap-12 lg:gap-20 shrink-0 w-full xl:w-auto border-t xl:border-t-0 xl:border-l border-slate-100 pt-8 xl:pt-0 xl:pl-16">
      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Market Sentiment</p>
        <div className="flex items-baseline gap-1 justify-center">
          <span className="text-4xl font-serif font-bold text-slate-900">{score || 0}%</span>
          <ChevronUp size={16} className="text-emerald-500 mb-1" />
        </div>
      </div>
      <div className="text-center hidden sm:block">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strat Status</p>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-xl">
           <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
           <span className="text-[10px] font-bold uppercase tracking-widest">Locked</span>
        </div>
      </div>
      <button onClick={onEdit} className="p-5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all rounded-3xl shadow-sm">
        <Edit3 size={20} />
      </button>
    </div>
  </div>
);

const SignalStrip = ({ alerts, onSelect }: any) => (
  <div className="w-full flex gap-6 overflow-x-auto pb-8 no-scrollbar pt-2">
    {alerts?.map((alert: any, i: number) => (
      <button 
        key={i}
        onClick={() => onSelect(alert)}
        className="flex-none w-80 md:w-96 bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center gap-6 hover:border-slate-300 hover:shadow-lg transition-all group text-left shadow-sm"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
          alert.category === 'Threat' ? 'bg-rose-50 text-rose-500' : 
          alert.category === 'Opportunity' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-500'
        }`}>
          {alert.category === 'Threat' ? <AlertTriangle size={24} /> : 
           alert.category === 'Opportunity' ? <Zap size={24} /> : <TrendingUp size={24} />}
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-3 mb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{alert.time || 'SYNCHRONOUS'}</p>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-900">{alert.category}</p>
          </div>
          <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors leading-tight">{alert.title}</h4>
        </div>
      </button>
    ))}
  </div>
);

// --- DASHBOARD CONTAINER ---

export const Dashboard: React.FC<{ user: User, onLogout: () => void, onUpdateUser: (u: User) => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1280);
  const [chatTrigger, setChatTrigger] = useState<string | undefined>();

  const { data: dashboardData, loading } = useLiveIntelligence(user, 'overview', {
    realityBar: { score: 92, insight: "Calibrating global strategic matrices for high-fidelity oversight...", confidence: "Elite" },
    momentum: [{ m: 'Q1', v: 40 }, { m: 'Q2', v: 65 }, { m: 'Q3', v: 55 }, { m: 'Q4', v: 85 }],
    context: { activeProject: "None", latestReport: "N/A", pulse: "Stable", recentGen: "N/A" },
    alerts: []
  });

  const { data: competitorData } = useLiveIntelligence(user, 'competitors', { competitors: [] });

  const mapMarkers = useMemo(() => {
    return (competitorData.competitors || [])
      .filter((c: any) => c.latitude && c.longitude)
      .map((c: any) => ({
        lat: parseFloat(c.latitude),
        lng: parseFloat(c.longitude),
        title: c.name,
        info: `Status: ${c.share || 'Active'} | Location: ${c.location || 'Unknown'}`
      }));
  }, [competitorData]);

  const handleActionSelect = (query: string) => {
    setChatTrigger(query);
    setActiveTab('chat');
  };

  const handleAlertSelect = (alert: any) => {
    setActiveTab('alerts');
  };

  const renderOverview = () => (
    <div className="h-full overflow-y-auto px-6 lg:px-12 py-10 lg:py-16 custom-scrollbar scroll-smooth">
      <div className="space-y-12 pb-40 animate-reveal max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Executive Overview</p>
              <h1 className="text-5xl font-serif font-bold text-slate-950 italic">Strategic Oversight.</h1>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Last Update</p>
                 <p className="text-xs font-bold text-slate-600">Just Now</p>
              </div>
              <Button onClick={() => setActiveTab('chat')} icon={Sparkles} className="shadow-2xl">Deploy Agent</Button>
           </div>
        </header>

        <ExecutiveRealityBar 
          user={user} 
          score={dashboardData.realityBar?.score} 
          insight={dashboardData.realityBar?.insight} 
          confidence={dashboardData.realityBar?.confidence}
          onEdit={() => setActiveTab('dna')}
        />

        <SignalStrip alerts={dashboardData.alerts} onSelect={handleAlertSelect} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-[600px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden relative shadow-sm group">
              <div className="absolute top-8 left-8 z-[40] flex flex-col gap-3">
                  <div className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Global Tactical Map</span>
                  </div>
              </div>
              <RealMapWidget markers={mapMarkers} />
          </div>

          <div className="space-y-10">
              <Card title="Context Matrix" headerAction={<Layers size={18} className="text-slate-200" />} noPadding>
                  <div className="divide-y divide-slate-50">
                      {[
                          { label: "Active Mandate", val: selectedProject?.name || "No active project", icon: BriefcaseIcon, target: 'projects' },
                          { label: "Latest Briefing", val: dashboardData.context?.latestReport || "Establishing...", icon: FileText, target: 'reports' },
                          { label: "Institutional Pulse", val: dashboardData.context?.pulse || "Calibrating", icon: Activity, target: 'social' },
                          { label: "Asset Deployment", val: dashboardData.context?.recentGen || "Standby", icon: TrendingUp, target: 'marketgen' }
                      ].map((ctx, i) => (
                          <button key={i} onClick={() => setActiveTab(ctx.target)} className="w-full text-left p-6 lg:p-8 hover:bg-slate-50 transition-all flex items-center justify-between group/item">
                              <div className="flex items-center gap-6 overflow-hidden text-left">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:text-slate-900 group-hover/item:bg-white transition-all shadow-sm">
                                      <ctx.icon size={20} />
                                  </div>
                                  <div className="overflow-hidden">
                                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">{ctx.label}</p>
                                      <h4 className="text-base font-bold text-slate-900 truncate">{ctx.val}</h4>
                                  </div>
                              </div>
                              <ChevronRight size={18} className="text-slate-200 group-hover/item:translate-x-1 transition-transform shrink-0" />
                          </button>
                      ))}
                  </div>
              </Card>

              <Card title="Market Momentum" headerAction={<BarChart3 size={18} className="text-slate-900" />}>
                  <div className="h-[240px] w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dashboardData.momentum}>
                              <XAxis dataKey="m" hide />
                              <YAxis hide />
                              <Tooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} 
                              />
                              <Area type="monotone" dataKey="v" stroke="#0F172A" strokeWidth={4} fillOpacity={0.05} fill="#0F172A" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'chat': return <ChatPanel user={user} project={selectedProject || undefined} externalTrigger={chatTrigger} />;
      case 'projects': return (
        <div className="h-full overflow-y-auto">
          {selectedProject 
            ? <ProjectWorkspace user={user} project={selectedProject} onBack={() => setSelectedProject(null)} />
            : <ProjectList user={user} onSelectProject={setSelectedProject} />
          }
        </div>
      );
      case 'competitors': return <div className="h-full overflow-y-auto"><CompetitorModule user={user} onAnalyze={handleActionSelect} /></div>;
      case 'market': return <div className="h-full overflow-y-auto"><MarketModule user={user} onAnalyze={handleActionSelect} /></div>;
      case 'alerts': return <div className="h-full overflow-y-auto"><AlertsModule user={user} onAnalyze={handleActionSelect} /></div>;
      case 'social': return <div className="h-full overflow-y-auto"><SocialPulseModule user={user} onAnalyze={handleActionSelect} /></div>;
      case 'marketgen': return <div className="h-full overflow-y-auto"><MarketingModule user={user} onAnalyze={handleActionSelect} /></div>;
      case 'reports': return <div className="h-full overflow-y-auto"><ReportsModule user={user} onAnalyze={handleActionSelect} /></div>;
      case 'dna': return (
        <div className="h-full overflow-y-auto px-6 lg:px-12 py-16 animate-reveal">
           <div className="max-w-4xl mx-auto space-y-12">
              <h2 className="text-5xl font-serif font-bold text-slate-950 italic">Institutional DNA</h2>
              <Card title="Strategic Profile">
                 <div className="space-y-6 text-left py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Company</p>
                          <p className="text-xl font-bold text-slate-900">{user.companyName}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Industry</p>
                          <p className="text-xl font-bold text-slate-900">{user.industry}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Entity Summary</p>
                       <p className="text-base text-slate-600 leading-relaxed font-medium">"{user.dna.productSummary}"</p>
                    </div>
                 </div>
              </Card>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('overview')}>Command Center</Button>
                <Button variant="secondary" onClick={onLogout}>Sign Out</Button>
              </div>
           </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="h-full flex bg-[#F8FAFC] overflow-hidden">
      <aside className={`flex bg-white border-r border-slate-100 flex-col px-4 py-8 z-50 transition-all duration-500 relative ${isSidebarCollapsed ? 'w-24' : 'w-80'}`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="absolute -right-3 top-24 w-7 h-7 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all z-[60]"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        
        <div className={`mb-16 px-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <Logo collapsed={isSidebarCollapsed} />
        </div>

        <div className="flex-1 space-y-12 overflow-y-auto no-scrollbar px-2">
          <nav className="space-y-1.5">
            {!isSidebarCollapsed && <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-4 px-4">Navigation</p>}
            <SidebarItem icon={LayoutDashboard} label="Command" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={MessageSquare} label="AI Strategy" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Briefcase} label="Mandates" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} collapsed={isSidebarCollapsed} />
          </nav>
          
          <div className="space-y-1.5">
            {!isSidebarCollapsed && <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-4 px-4">Intelligence</p>}
            <SidebarItem icon={Users} label="Competitors" active={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Globe} label="Market" active={activeTab === 'market'} onClick={() => setActiveTab('market')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Zap} label="Signals" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Activity} label="Social Pulse" active={activeTab === 'social'} onClick={() => setActiveTab('social')} collapsed={isSidebarCollapsed} />
          </div>
          
          <div className="space-y-1.5">
            {!isSidebarCollapsed && <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-4 px-4">Deployment</p>}
            <SidebarItem icon={TrendingUp} label="Marketing" active={activeTab === 'marketgen'} onClick={() => setActiveTab('marketgen')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={FileText} label="Briefings" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} collapsed={isSidebarCollapsed} />
          </div>
        </div>

        <div className="mt-auto pt-10 border-t border-slate-50 px-2 space-y-1.5">
          <SidebarItem icon={Settings} label="Institutional DNA" active={activeTab === 'dna'} onClick={() => setActiveTab('dna')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LogOut} label="Exit Hub" onClick={onLogout} collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative z-10">{renderContent()}</div>
      </main>
    </div>
  );
};
