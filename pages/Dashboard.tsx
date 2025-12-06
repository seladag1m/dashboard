
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Globe, AlertCircle, Megaphone, FileText, Menu,
  LogOut, Target, Zap, Layers, ArrowUpRight, MessageSquare, Briefcase, 
  PanelLeftClose, PanelLeftOpen, Edit3, ChevronRight
} from 'lucide-react';
import { User, CompanySize, Region, MainGoal, OverviewMetrics } from '../types';
import { ChatPanel } from './Chat';
import { Logo, Button, Input, Select, Modal } from '../components/UI';
import { SalesAreaChart, CompetitorRadarChart } from '../components/Charts';
import { CompetitorModule, MarketModule, AlertsModule, MarketingModule, ReportsModule, useLiveIntelligence } from '../components/Modules';
import { LanguageSelector } from '../components/LanguageSelector';
import { db } from '../services/database';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

// --- OVERVIEW MODULE ---
const OverviewModule: React.FC<{ user: User, onAnalyze: (context: string) => void }> = ({ user, onAnalyze }) => {
  const { data, loading } = useLiveIntelligence(user, 'overview', {
      marketPosition: { score: 70, rank: 'Calculating...', change: '0%', context: 'Initializing...' },
      opportunityIndex: { score: 65, level: 'Scanning...', topSector: '...', heatMap: [30,40,30,50,40,60,50] },
      strategyFit: { score: 80, alignment: 'Assessing...', gap: '...' },
      campaignForecast: { score: 75, predictedReach: '...', sentiment: '...', trend: [50,55,52,60,65] },
      marketTrends: [],
      sectorDistribution: [],
      keyInsights: ["Connecting to live strategy feeds..."]
  });

  const metrics = data as OverviewMetrics;
  const isSimulated = (data as any)._isSimulated;
  const insights = (data as any).keyInsights || [];

  const trendData = (data as any).marketTrends && (data as any).marketTrends.length > 0
      ? (data as any).marketTrends
      : Array.from({length: 6}, (_, i) => ({ label: `Month ${i+1}`, value: 30 + Math.random()*20 }));

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-bg-neutral pb-6">
          <div>
              <h1 className="text-4xl font-serif font-bold text-text-headline tracking-tight">Executive Overview</h1>
              <p className="text-text-secondary mt-2 text-base">Strategic command center for <span className="font-semibold text-text-primary">{user.companyName}</span>.</p>
          </div>
          <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isSimulated ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                 <span className={`w-2 h-2 rounded-full ${isSimulated ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                 {isSimulated ? 'Simulation Mode' : 'Live Data Feed'}
              </span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-bg-neutral shadow-card hover:shadow-float transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-bg-soft rounded-xl group-hover:bg-accent group-hover:text-white transition-colors text-text-secondary">
                    <Target size={20} />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ArrowUpRight size={12} /> {metrics.marketPosition?.change}
                </span>
              </div>
              <p className="text-xs font-bold text-text-light uppercase tracking-widest mb-1">Market Position</p>
              <div className="flex items-baseline gap-2 mb-2">
                 <h3 className="text-3xl font-serif font-bold text-text-headline">{metrics.marketPosition?.score}</h3>
                 <span className="text-sm text-text-light">/ 100</span>
              </div>
              <div className="w-full bg-bg-soft rounded-full h-1.5 mb-3 overflow-hidden">
                <div className="bg-accent h-full rounded-full transition-all duration-1000" style={{ width: `${metrics.marketPosition?.score}%` }}></div>
              </div>
              <p className="text-xs text-text-secondary leading-tight">{metrics.marketPosition?.context}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-bg-neutral shadow-card hover:shadow-float transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-bg-soft rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors text-text-secondary">
                    <Zap size={20} />
                </div>
                <span className="text-xs font-bold text-text-secondary bg-bg-soft px-2 py-0.5 rounded-md">
                    {metrics.opportunityIndex?.level}
                </span>
              </div>
              <p className="text-xs font-bold text-text-light uppercase tracking-widest mb-1">Opportunity Index</p>
              <div className="flex items-baseline gap-2 mb-2">
                 <h3 className="text-3xl font-serif font-bold text-text-headline">{metrics.opportunityIndex?.score}</h3>
              </div>
              
              <div className="flex gap-0.5 h-6 items-end mb-3">
                {metrics.opportunityIndex?.heatMap?.map((val, i) => (
                    <div key={i} className="flex-1 bg-bg-soft rounded-sm relative group/bar h-full">
                      <div className={`w-full absolute bottom-0 transition-all duration-700 ${val > 60 ? 'bg-rose-500' : 'bg-blue-400'}`} style={{ height: `${val}%` }}></div>
                    </div>
                ))}
              </div>
              <p className="text-xs text-text-secondary">Top Sector: <span className="font-semibold text-text-primary">{metrics.opportunityIndex?.topSector}</span></p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-bg-neutral shadow-card hover:shadow-float transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-bg-soft rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors text-text-secondary">
                    <Layers size={20} />
                </div>
              </div>
              <p className="text-xs font-bold text-text-light uppercase tracking-widest mb-1">Strategy Fit</p>
              <div className="flex items-baseline gap-2 mb-2">
                 <h3 className="text-3xl font-serif font-bold text-text-headline">{metrics.strategyFit?.score}%</h3>
              </div>
              <div className="w-full bg-bg-soft rounded-full h-1.5 mb-3 overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full transition-all duration-1000" style={{ width: `${metrics.strategyFit?.score}%` }}></div>
              </div>
              <p className="text-xs text-text-secondary">Gap: <span className="font-semibold text-text-primary">{metrics.strategyFit?.gap}</span></p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-bg-neutral shadow-card hover:shadow-float transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-bg-soft rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors text-text-secondary">
                    <Megaphone size={20} />
                </div>
              </div>
              <p className="text-xs font-bold text-text-light uppercase tracking-widest mb-1">Campaign Forecast</p>
              <div className="flex items-baseline gap-2 mb-2">
                 <h3 className="text-3xl font-serif font-bold text-text-headline">{metrics.campaignForecast?.score}</h3>
              </div>
              <div className="h-8 flex items-end gap-1 mb-3 opacity-90">
                {metrics.campaignForecast?.trend?.map((h, i) => (
                    <div key={i} className="flex-1 bg-amber-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <p className="text-xs text-text-secondary">Reach: <span className="font-semibold text-text-primary">{metrics.campaignForecast?.predictedReach}</span></p>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-bg-neutral shadow-card p-6 hover:shadow-float transition-all">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-text-primary text-base">Market Velocity</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Real-time demand tracking</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-bg-soft text-text-secondary px-2 py-1 rounded border border-bg-neutral">24h View</span>
                </div>
            </div>
            <div className="h-[280px]">
                <SalesAreaChart data={trendData.map((d, i) => ({ m: d.label, v: d.value }))} />
            </div>
          </div>
          
          <div className="lg:col-span-1 bg-white rounded-2xl border border-bg-neutral shadow-card p-6 hover:shadow-float transition-all">
            <div className="mb-6">
                <h3 className="font-bold text-text-primary text-base">Strategic Alignment</h3>
                <p className="text-xs text-text-secondary mt-0.5">Benchmarked against top 10%</p>
            </div>
            <div className="h-[280px]">
                <CompetitorRadarChart data={(data as any).sectorDistribution} />
            </div>
          </div>
        </div>
        
        {/* INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-bg-neutral shadow-card p-8 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif font-bold text-xl text-text-headline flex items-center gap-2">
                      <Briefcase size={20} className="text-accent"/> Key Strategic Insights
                  </h3>
              </div>
              <div className="space-y-4 flex-1">
                  {insights.length > 0 ? insights.map((insight: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-bg-soft/50 border border-transparent hover:border-bg-neutral transition-colors">
                          <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-accent shrink-0"></div>
                          <p className="text-sm text-text-secondary leading-relaxed font-medium">{insight}</p>
                      </div>
                  )) : (
                    <div className="flex items-center gap-2 text-sm text-text-light italic p-4">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> Gathering insights...
                    </div>
                  )}
              </div>
          </div>
          
          <div className="relative rounded-2xl p-8 text-white overflow-hidden flex flex-col justify-between shadow-2xl group min-h-[300px]" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
              <div className="absolute top-0 right-0 p-32 bg-accent rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-md border border-white/10 mb-6">
                    <Globe size={12} className="text-accent-light" />
                    AI DETECTED OPPORTUNITY
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4 leading-tight">Expansion Vector: <br/>{user.region}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                    Based on live competitor gaps, your {user.industry} offering has a unique advantage window closing in <span className="text-white font-bold">14 days</span>.
                </p>
              </div>
              
              <button 
                onClick={() => onAnalyze(`Generate a rapid expansion plan for ${user.region} based on the detected opportunity in the ${user.industry} sector.`)}
                className="relative z-10 mt-8 bg-white text-[#0E1A2B] px-6 py-4 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors w-fit flex items-center gap-2 shadow-lg hover:translate-x-1 duration-200"
              >
                Execute Strategy <ChevronRight size={16} />
              </button>
          </div>
        </div>
    </div>
  );
};

const EditProfileModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User, onUpdateUser: (u: User) => void }> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [formData, setFormData] = useState({ ...user });

  const handleSave = async () => {
     try {
        await db.auth.updateProfile(formData);
        onUpdateUser(formData);
        onClose();
     } catch (e) { console.error(e); }
  };

  return (
     <Modal isOpen={isOpen} onClose={onClose} title="Company Settings">
        <div className="p-8 space-y-6">
           <Input label="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Industry" options={["Tech", "Finance", "Retail", "Health"]} value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
              <Select label="Region" options={['North America', 'Europe', 'Asia Pacific', 'LATAM']} value={formData.region} onChange={e => setFormData({...formData, region: e.target.value as Region})} />
           </div>
           <div className="pt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
           </div>
        </div>
     </Modal>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUpdateUser, language, setLanguage }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [aiContextTrigger, setAiContextTrigger] = useState<string | null>(null);

  const handleAIAnalyze = (context: string) => {
    setAiContextTrigger(context);
    setActiveTab('chat');
  };

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      title={isSidebarCollapsed ? label : ''}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
      ${activeTab === id ? 'bg-bg-soft text-accent' : 'text-text-secondary hover:bg-bg-soft hover:text-text-primary'}
      ${isSidebarCollapsed ? 'justify-center' : ''}`}
    >
      <Icon size={20} className={`shrink-0 ${activeTab === id ? 'text-accent' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
      {!isSidebarCollapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-bg-soft font-sans overflow-hidden text-text-primary selection:bg-accent-light selection:text-accent">
      
      <aside className={`bg-white border-r border-bg-neutral flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} z-30`}>
        <div className={`h-20 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-bg-neutral/50`}>
           <Logo collapsed={isSidebarCollapsed} />
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Overview" />
          <SidebarItem id="chat" icon={MessageSquare} label="AI Consultant" />
          <SidebarItem id="competitors" icon={Users} label="Competitors" />
          <SidebarItem id="market" icon={Globe} label="Market Analysis" />
          <SidebarItem id="alerts" icon={AlertCircle} label="Signals" />
          <SidebarItem id="marketing" icon={Megaphone} label="Campaigns" />
          <SidebarItem id="reports" icon={FileText} label="Reports" />
        </nav>

        <div className="p-4 border-t border-bg-neutral space-y-2">
           {!isSidebarCollapsed && (
             <div className="mb-2">
                <LanguageSelector current={language} onChange={setLanguage} />
             </div>
           )}

           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center justify-center p-2 text-zinc-400 hover:text-accent hover:bg-bg-soft rounded-lg transition-colors">
             {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
           </button>
           
           <div className={`bg-bg-soft/50 rounded-xl p-2 flex items-center gap-3 cursor-pointer hover:bg-bg-soft transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} onClick={() => setIsProfileModalOpen(true)}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-black text-white flex items-center justify-center text-xs font-bold shadow-sm">
                 {user.name[0]}
              </div>
              {!isSidebarCollapsed && (
                 <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-text-primary truncate">{user.name}</p>
                    <p className="text-[10px] text-text-secondary truncate">{user.companyName}</p>
                 </div>
              )}
           </div>
           
           <button onClick={onLogout} className={`w-full flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-error hover:bg-error/5 p-2 rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <LogOut size={16} />
              {!isSidebarCollapsed && "Sign Out"}
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative scroll-smooth">
         <div className="min-h-full p-6 sm:p-8 lg:p-10 max-w-[1600px] mx-auto">
            {activeTab === 'dashboard' && <OverviewModule user={user} onAnalyze={handleAIAnalyze} />}
            {activeTab === 'chat' && (
              <div className="h-[calc(100vh-80px)] rounded-2xl border border-bg-neutral shadow-sm overflow-hidden bg-white">
                 <ChatPanel 
                    user={user} 
                    language={language} 
                    isCollapsed={isSidebarCollapsed} 
                    toggleCollapse={() => {}} 
                    externalTrigger={aiContextTrigger} 
                    onTriggerHandled={() => setAiContextTrigger(null)} 
                 />
              </div>
            )}
            {activeTab === 'competitors' && <CompetitorModule user={user} onAnalyze={handleAIAnalyze} />}
            {activeTab === 'market' && <MarketModule user={user} onAnalyze={handleAIAnalyze} />}
            {activeTab === 'alerts' && <AlertsModule user={user} onAnalyze={handleAIAnalyze} />}
            {activeTab === 'marketing' && <MarketingModule user={user} onAnalyze={handleAIAnalyze} />}
            {activeTab === 'reports' && <ReportsModule user={user} onAnalyze={handleAIAnalyze} />}
         </div>
      </main>

      <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onUpdateUser={onUpdateUser} />
    </div>
  );
};
