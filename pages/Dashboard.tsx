
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, MessageSquare, Briefcase, Globe, Users, 
  TrendingUp, LogOut, Settings,
  ArrowRight, BarChart3, Layers, Edit3, Map, X,
  ChevronUp, BrainCircuit, ShieldCheck, Target, AlertTriangle, Zap,
  Briefcase as BriefcaseIcon, FileText, Activity, Clock, Menu, ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { User, Project, Alert } from '../types';
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
      ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/20' 
      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
    } ${collapsed ? 'justify-center px-0' : ''}`}
  >
    <div className="shrink-0">
      <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? '' : 'group-hover:text-brand-blue transition-colors'} />
    </div>
    {!collapsed && (
      <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
        <span className="truncate">{label}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-brand-blue/10 text-brand-blue'}`}>
            {badge}
          </span>
        )}
      </div>
    )}
  </button>
);

const ExecutiveRealityBar = ({ user, score, insight, confidence, onEdit }: any) => (
  <div className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-6 lg:p-8 flex flex-col xl:flex-row items-center justify-between gap-8 shadow-premium animate-reveal">
    <div className="flex items-center gap-6 flex-1 w-full xl:w-auto">
      <div className="w-16 h-16 bg-brand-blue rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 shrink-0">
        <Target size={32} />
      </div>
      <div className="overflow-hidden space-y-1 text-left">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-serif font-bold text-slate-900 truncate">{user.companyName}</h2>
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.industry}</span>
          {confidence && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[9px] font-bold text-brand-blue uppercase tracking-widest border border-blue-100">Trust: {confidence}</span>
          )}
        </div>
        <p className="text-sm text-slate-400 font-medium italic leading-relaxed line-clamp-2">"Executive Insight: {insight || 'Synthesizing global signals...'}"</p>
      </div>
    </div>
    <div className="flex items-center justify-between xl:justify-end gap-10 lg:gap-16 shrink-0 w-full xl:w-auto border-t xl:border-t-0 xl:border-l border-slate-50 pt-8 xl:pt-0 xl:pl-16">
      <div className="text-center group cursor-help">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-brand-blue transition-colors">Market Pos.</p>
        <div className="flex items-baseline gap-1 justify-center">
          <span className="text-3xl font-bold text-slate-900">{score || 0}%</span>
          <ChevronUp size={16} className="text-emerald-500 mb-1" />
        </div>
      </div>
      <div className="text-center hidden sm:block">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strat Status</p>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-xl">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-xs font-bold text-emerald-600">Locked</span>
        </div>
      </div>
      <button onClick={onEdit} className="p-4 bg-slate-950 text-white hover:bg-brand-blue transition-all rounded-2xl shadow-xl hover:-translate-y-1">
        <Edit3 size={20} />
      </button>
    </div>
  </div>
);

const SignalStrip = ({ alerts, onSelect }: any) => (
  <div className="w-full flex gap-4 overflow-x-auto pb-6 no-scrollbar pt-2">
    {alerts?.map((alert: any, i: number) => (
      <button 
        key={i}
        onClick={() => onSelect(alert)}
        className="flex-none w-72 md:w-80 bg-white border border-slate-100 rounded-[2rem] p-5 flex items-center gap-5 hover:border-blue-200 hover:shadow-float transition-all group text-left"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
          alert.category === 'Threat' ? 'bg-rose-50 text-rose-500' : 
          alert.category === 'Opportunity' ? 'bg-blue-50 text-brand-blue' : 'bg-amber-50 text-amber-500'
        }`}>
          {alert.category === 'Threat' ? <AlertTriangle size={22} /> : 
           alert.category === 'Opportunity' ? <Zap size={22} /> : <TrendingUp size={22} />}
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{alert.time || 'JUST NOW'}</p>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-blue">{alert.category}</p>
          </div>
          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-blue transition-colors">{alert.title}</h4>
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
    realityBar: { score: 85, insight: "Market conditions stable. Intercepting new growth signals in your primary region.", confidence: "High" },
    momentum: [{ m: 'Q1', v: 40 }, { m: 'Q2', v: 65 }, { m: 'Q3', v: 55 }, { m: 'Q4', v: 85 }],
    context: { activeProject: "None", latestReport: "N/A", pulse: "Stable", recentGen: "N/A" },
    strikeZone: [],
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
        info: `Share: ${c.share || 'N/A'} | HQ: ${c.location || 'Unknown'}`
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
    <div className="h-full overflow-y-auto px-6 lg:px-12 py-8 lg:py-16 custom-scrollbar scroll-smooth">
      <div className="space-y-8 pb-40 animate-reveal max-w-[1440px] mx-auto">
        <ExecutiveRealityBar 
          user={user} 
          score={dashboardData.realityBar?.score} 
          insight={dashboardData.realityBar?.insight} 
          confidence={dashboardData.realityBar?.confidence}
          onEdit={() => setActiveTab('dna')}
        />

        <SignalStrip alerts={dashboardData.alerts} onSelect={handleAlertSelect} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[500px] lg:h-[600px] bg-white rounded-[3rem] border border-slate-100 overflow-hidden relative shadow-premium group">
              <div className="absolute top-6 left-6 z-[40] flex flex-col gap-3">
                  <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3">
                      <Map size={18} className="text-brand-blue" />
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Geo-Tactical Command</span>
                  </div>
              </div>
              <RealMapWidget markers={mapMarkers} />
          </div>

          <div className="space-y-8">
              <Card title="Context Matrix" headerAction={<Layers size={18} className="text-slate-300" />} noPadding>
                  <div className="divide-y divide-slate-50">
                      {[
                          { label: "Active Project", val: selectedProject?.name || "None Selected", icon: BriefcaseIcon, target: 'projects' },
                          { label: "Latest Brief", val: dashboardData.context?.latestReport || "N/A", icon: FileText, target: 'reports' },
                          { label: "Social Pulse", val: dashboardData.context?.pulse || "Stable", icon: Activity, target: 'social' },
                          { label: "Recent Asset", val: dashboardData.context?.recentGen || "N/A", icon: TrendingUp, target: 'marketgen' }
                      ].map((ctx, i) => (
                          <button key={i} onClick={() => setActiveTab(ctx.target)} className="w-full text-left p-6 hover:bg-slate-50 transition-all flex items-center justify-between group/item">
                              <div className="flex items-center gap-4 overflow-hidden text-left">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:text-brand-blue group-hover/item:bg-blue-50 transition-all">
                                      <ctx.icon size={18} />
                                  </div>
                                  <div className="overflow-hidden">
                                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">{ctx.label}</p>
                                      <h4 className="text-sm font-bold text-slate-900 truncate">{ctx.val}</h4>
                                  </div>
                              </div>
                              <ChevronRight size={16} className="text-slate-200 group-hover/item:translate-x-1 transition-transform shrink-0" />
                          </button>
                      ))}
                  </div>
              </Card>

              <Card title="Institutional Momentum" headerAction={<BarChart3 size={18} className="text-brand-blue" />}>
                  <div className="h-[200px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dashboardData.momentum}>
                              <XAxis dataKey="m" hide />
                              <YAxis hide />
                              <Tooltip />
                              <Area type="monotone" dataKey="v" stroke="#246BFD" strokeWidth={3} fillOpacity={0.1} fill="#246BFD" />
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
        <div className="h-full overflow-y-auto px-6 lg:px-12 py-10 animate-reveal">
           <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-5xl font-serif font-bold text-slate-900 italic">Institutional DNA</h2>
              <Card title="Current Strategic Profile">
                 <div className="space-y-4 text-left">
                    <p className="text-slate-500">Industry: <strong>{user.industry}</strong></p>
                    <p className="text-slate-500">Summary: <strong>{user.dna.productSummary}</strong></p>
                    <p className="text-slate-500">Goal: <strong>{user.dna.primaryGoal}</strong></p>
                 </div>
              </Card>
              <Button variant="secondary" onClick={onLogout}>Sign Out</Button>
           </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="h-full flex bg-[#F3F5F7] overflow-hidden">
      <aside className={`flex bg-white border-r border-slate-100 flex-col px-4 py-8 z-50 transition-all duration-500 relative ${isSidebarCollapsed ? 'w-24' : 'w-80'}`}>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-20 w-6 h-6 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-blue transition-all z-[60]">
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <div className={`mb-12 px-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}><Logo collapsed={isSidebarCollapsed} /></div>
        <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar">
          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Command" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={MessageSquare} label="AI Strategy" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Briefcase} label="Projects" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} collapsed={isSidebarCollapsed} />
          </nav>
          <div className="space-y-1">
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-4 px-6">Intelligence</p>}
            <SidebarItem icon={Users} label="Competitors" active={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Globe} label="Market" active={activeTab === 'market'} onClick={() => setActiveTab('market')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Zap} label="Signals" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={Activity} label="Pulse" active={activeTab === 'social'} onClick={() => setActiveTab('social')} collapsed={isSidebarCollapsed} />
          </div>
          <div className="space-y-1">
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-4 px-6">Deployment</p>}
            <SidebarItem icon={TrendingUp} label="Marketing" active={activeTab === 'marketgen'} onClick={() => setActiveTab('marketgen')} collapsed={isSidebarCollapsed} />
            <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} collapsed={isSidebarCollapsed} />
          </div>
        </div>
        <div className="mt-auto pt-10 border-t border-slate-50">
          <SidebarItem icon={Settings} label="DNA" active={activeTab === 'dna'} onClick={() => setActiveTab('dna')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LogOut} label="Exit" onClick={onLogout} collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative z-10">{renderContent()}</div>
      </main>
    </div>
  );
};
