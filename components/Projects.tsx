import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderPlus, Plus, Briefcase, FileText, UploadCloud, X, ArrowRight, 
  Trash2, ChevronLeft, Loader2, Check, ListTodo, Target, Clock3, Circle, CheckCircle2,
  DollarSign, Calendar, Settings2, LayoutTemplate, Sparkles, ShieldCheck,
  MoreVertical, MoreHorizontal, Filter, Grid, List, AlertCircle, CalendarDays,
  Tag, ChevronRight as ChevronRightIcon, Flag, BarChart4, PieChart as PieIcon,
  Timer, Compass, Rocket, Zap, Search, ArrowUpRight, Radio, PanelLeftOpen, PanelLeftClose
} from 'lucide-react';
import { User, Project, ProjectFile, ProjectTask, TaskStatus, TaskPriority } from '../types';
import { Button, Input, Select, Modal, Card, Skeleton } from './UI';
import { db } from '../services/database';
import { ChatPanel } from '../pages/Chat';
import { SimpleMarkdown } from './Markdown';

const PRIORITY_THEME: Record<TaskPriority, string> = {
  low: 'bg-slate-50 text-slate-400 border-slate-100',
  medium: 'bg-blue-50 text-blue-600 border-blue-200',
  high: 'bg-amber-50 text-amber-600 border-amber-200',
  critical: 'bg-rose-50 text-rose-600 border-rose-200'
};

const STATUS_THEME: Record<TaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-500 border-slate-200',
  'in-progress': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  review: 'bg-amber-50 text-amber-600 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200'
};

const STRATEGIC_TEMPLATES = [
  { 
    id: 'market_entry', 
    name: 'Market Entry Strategy', 
    description: 'Framework for expansion into new jurisdictions or segments.', 
    icon: Target,
    defaultBudget: '$50k - $250k',
    defaultTimeline: '6 Months',
    tasks: [
      { id: '1', title: 'Competitor Mapping', category: 'Research', priority: 'high', status: 'pending' },
      { id: '2', title: 'Regulatory Review', category: 'Legal', priority: 'critical', status: 'pending' },
      { id: '3', title: 'Local Partnerships', category: 'Strategy', priority: 'medium', status: 'pending' },
      { id: '4', title: 'Pricing Sensitivity Audit', category: 'Financial', priority: 'high', status: 'pending' },
      { id: '5', title: 'GTM Roadmap Formulation', category: 'Strategy', priority: 'high', status: 'pending' }
    ]
  },
  { 
    id: 'efficiency', 
    name: 'Operational Efficiency Audit', 
    description: 'Institutional review of internal workflows and resource allocation.', 
    icon: Zap,
    defaultBudget: '$20k - $100k',
    defaultTimeline: '3 Months',
    tasks: [
      { id: '1', title: 'Workflow Documentation', category: 'Audit', priority: 'medium', status: 'pending' },
      { id: '2', title: 'Bottleneck Analysis', category: 'Strategy', priority: 'high', status: 'pending' },
      { id: '3', title: 'Cost Reduction Mapping', category: 'Financial', priority: 'high', status: 'pending' }
    ]
  },
  { 
    id: 'brand_authority', 
    name: 'Market Authority Pivot', 
    description: 'Repositioning the entity as the primary intellectual leader in the sector.', 
    icon: ShieldCheck,
    defaultBudget: '$100k+',
    defaultTimeline: '12 Months',
    tasks: [
      { id: '1', title: 'Content Strategy Mandate', category: 'Marketing', priority: 'high', status: 'pending' },
      { id: '2', title: 'Key Opinion Leader Audit', category: 'PR', priority: 'medium', status: 'pending' }
    ]
  }
];

export const ProjectList: React.FC<{ user: User, onSelectProject: (p: Project | null) => void }> = ({ user, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.projects.list(user.id).then(res => { setProjects(res); setLoading(false); }); }, [user.id]);
  
  const handleDelete = async (e: React.MouseEvent, pid: string) => { 
    e.stopPropagation(); 
    if(confirm('Purge Initiative? All data will be deleted.')) { 
      await db.projects.delete(user.id, pid); 
      setProjects(p => p.filter(x => x.id !== pid)); 
    } 
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-white animate-fade-in">
      <div className="space-y-24 pb-40 max-w-[1600px] mx-auto p-10 lg:p-24 text-left font-inter">
        <header className="border-b border-[#F1F5F9] pb-16 space-y-8 animate-reveal">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[#246BFD]"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Institutional Initiatives Hub</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <h1 className="text-8xl font-bold text-slate-950 tracking-tighter leading-[0.8]">
              Active <br/><span className="text-slate-200">Mandates.</span>
            </h1>
            <Button size="lg" icon={Plus} onClick={() => setIsModalOpen(true)} className="rounded-full h-20 px-12 shadow-premium bg-[#0F172A]">Initialize Protocol</Button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <Skeleton key={i} height="500px" className="rounded-[24px]" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-60 bg-white rounded-[24px] border border-[#F1F5F9] text-center space-y-12 group cursor-pointer animate-reveal" onClick={() => setIsModalOpen(true)}>
            <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all shadow-sm">
              <Briefcase size={32} />
            </div>
            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-slate-950 tracking-tight italic">Zero Active Protocols</h3>
              <p className="text-base text-slate-400 font-medium max-w-sm mx-auto leading-relaxed italic">Initiate a strategic framework to begin institutional oversight.</p>
            </div>
            <Button variant="outline" className="rounded-full px-12 h-16">Launch Mandate</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {projects.map((p, i) => {
               const completedCount = p.tasks?.filter(t => t.status === 'completed').length || 0;
               const totalCount = p.tasks?.length || 1;
               const progress = Math.round((completedCount / totalCount) * 100);
               
               return (
                <div 
                  key={p.id} 
                  onClick={() => onSelectProject(p)} 
                  className="bg-white p-12 rounded-[24px] border border-[#F1F5F9] transition-all cursor-pointer group flex flex-col justify-between relative h-[520px] animate-reveal hover:border-slate-300 hover:shadow-premium"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="space-y-12">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-slate-950 text-white rounded-xl flex items-center justify-center shadow-xl group-hover:bg-[#246BFD] transition-all">
                        <Briefcase size={24} />
                      </div>
                      <button 
                        onClick={(e) => handleDelete(e, p.id)} 
                        className="p-3 bg-slate-50 text-slate-200 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {p.status}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">{p.createdAt}</span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-950 tracking-tighter leading-none italic group-hover:text-[#246BFD] transition-all">
                        {p.name}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-3 italic opacity-80">
                        "{p.description}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Allocation</p>
                          <p className="text-xs font-bold text-slate-950">{p.budget || 'TBD'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Timeline</p>
                          <p className="text-xs font-bold text-slate-950">{p.timeline || 'TBD'}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Fulfillment Vector</span>
                        <span className="text-[10px] font-mono font-bold text-[#246BFD]">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#246BFD] transition-all duration-1000" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <ProjectCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} onCreated={(p) => setProjects(prev => [p, ...prev])} />
      </div>
    </div>
  );
};

const ProjectCreateModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User, onCreated: (p: Project) => void }> = ({ isOpen, onClose, user, onCreated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', goal: '', description: '', templateId: '', budget: '', timeline: '', constraints: '' 
  });

  const selectTemplate = (tid: string) => { 
    const t = STRATEGIC_TEMPLATES.find(x => x.id === tid); 
    if(t) { 
      setForm({ 
        ...form, templateId: tid, name: t.name, goal: t.description, 
        description: `Deployment of ${t.name} framework. Focus on sector leadership and tactical efficiency.`,
        budget: t.defaultBudget, timeline: t.defaultTimeline
      }); 
      setStep(2); 
    } 
  };

  const handleSubmit = async () => { 
    if (!form.name || !form.goal) return;
    setLoading(true);
    const t = STRATEGIC_TEMPLATES.find(x => x.id === form.templateId); 
    const proj: Project = { 
      id: Date.now().toString(), name: form.name, description: form.description, goal: form.goal, 
      type: 'Strategic', timeframe: form.timeline, audience: 'Institutional Executives', 
      budget: form.budget, files: [], 
      tasks: (t?.tasks || []).map((x, i) => ({ 
        id: (Date.now()+i).toString(), title: x.title, category: x.category, priority: x.priority as TaskPriority, status: x.status as TaskStatus 
      })), 
      kpis: [], intent: form.goal, createdAt: new Date().toLocaleDateString(), 
      lastActive: 'Now', status: 'Active', objective: form.goal, 
      constraints: form.constraints.split(',').map(c => c.trim()), timeline: form.timeline 
    }; 
    await db.projects.create(user.id, proj); 
    onCreated(proj); 
    setLoading(false);
    onClose(); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Mandate Protocol" : "Institutional Briefing"}>
      <div className="space-y-10 pt-4 text-left font-inter">
        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {STRATEGIC_TEMPLATES.map(t => (
              <button 
                key={t.id} 
                onClick={() => selectTemplate(t.id)} 
                className="p-10 bg-white border border-[#F1F5F9] rounded-[24px] text-left hover:border-slate-300 hover:shadow-premium transition-all group flex flex-col h-full active:opacity-70"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-8 text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all">
                  <t.icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-950 mb-3 tracking-tight italic">"{t.name}"</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{t.description}"</p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#F1F5F9] flex items-center justify-between">
                   <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{t.defaultTimeline} Framework</span>
                   <ChevronRightIcon size={14} className="text-slate-200 group-hover:text-[#246BFD] transition-all" />
                </div>
              </button>
            ))}
            <button 
              onClick={() => setStep(2)} 
              className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm"><Plus size={32} /></div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Custom Protocol</span>
                <p className="text-[9px] mt-2 opacity-60">Define unique institutional oversight</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-12 animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Initiative Designation" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Q4 Expansion" />
              <Input label="Strategic Goal" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} placeholder="e.g. Market Dominance" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Executive Summary</label>
              <textarea 
                className="w-full p-8 bg-slate-50 rounded-[24px] h-32 text-sm outline-none border border-[#F1F5F9] focus:border-slate-300 focus:bg-white transition-all font-medium italic" 
                placeholder="Mission intent..." 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-8">
               <Input label="Budget Allocation" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
               <Input label="Mandate Timeline" value={form.timeline} onChange={e => setForm({...form, timeline: e.target.value})} />
            </div>
            <div className="flex gap-6 pt-12">
              <Button variant="ghost" fullWidth onClick={() => setStep(1)}>Return</Button>
              <Button fullWidth isLoading={loading} className="bg-slate-950" onClick={handleSubmit}>Authorize Mandate</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const TaskCard: React.FC<{ task: ProjectTask, onUpdate: (u: Partial<ProjectTask>) => void, onDelete: () => void }> = ({ task, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cycleStatus = () => { 
    const s: TaskStatus[] = ['pending', 'in-progress', 'review', 'completed']; 
    onUpdate({ status: s[(s.indexOf(task.status)+1)%s.length] }); 
  };
  return (
    <div 
      className={`p-8 bg-white border border-[#F1F5F9] rounded-[24px] transition-all group relative cursor-pointer text-left ${task.status === 'completed' ? 'opacity-30' : 'hover:border-slate-300 hover:shadow-premium'} animate-reveal`} 
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={cycleStatus}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${PRIORITY_THEME[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${STATUS_THEME[task.status]}`}>
            {task.status.replace('-',' ')}
          </span>
        </div>
        {isHovered && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-slate-200 hover:text-rose-500 transition-all">
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <h4 className={`text-sm font-bold text-slate-950 tracking-tight leading-tight mb-6 italic ${task.status === 'completed' ? 'line-through' : ''}`}>
        "{task.title}"
      </h4>
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">{task.category}</span>
        <CalendarDays size={12} className="text-slate-100" />
      </div>
    </div>
  );
};

export const TaskManager: React.FC<{ user: User, project: Project, tasks: ProjectTask[], onUpdateTasks: (t: ProjectTask[]) => void }> = ({ user, project, tasks, onUpdateTasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: 'Strategy', priority: 'medium' as TaskPriority });
  const updateTask = (id: string, updates: Partial<ProjectTask>) => onUpdateTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t)); 
  const deleteTask = (id: string) => confirm('Purge task?') && onUpdateTasks(tasks.filter(t => t.id !== id)); 
  const handleAdd = () => { 
    if(!newTask.title) return; 
    onUpdateTasks([{ id: Date.now().toString(), ...newTask, status: 'pending' as TaskStatus }, ...tasks]); 
    setIsModalOpen(false); setNewTask({ title: '', category: 'Strategy', priority: 'medium' }); 
  };
  return (
    <div className="h-full overflow-y-auto px-10 lg:px-24 py-20 bg-white font-inter text-left animate-fade-in custom-scrollbar">
      <div className="max-w-[1800px] mx-auto space-y-24">
        <header className="border-b border-[#F1F5F9] pb-12 flex justify-between items-end">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Execution Roadmap</p>
            <h3 className="text-5xl font-bold text-slate-950 tracking-tighter">Roadmap Management</h3>
          </div>
          <Button size="lg" icon={Plus} onClick={() => setIsModalOpen(true)} className="h-16 rounded-full px-10 bg-[#0F172A]">Add Tactical Step</Button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {(['pending', 'in-progress', 'review', 'completed'] as TaskStatus[]).map(status => (
            <div key={status} className="space-y-8 animate-fade-up">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">{status.replace('-',' ')}</h3>
                <span className="text-[10px] font-mono text-slate-200">{tasks.filter(t => t.status === status).length}</span>
              </div>
              <div className="space-y-6">
                {tasks.filter(t => t.status === status).map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={(u) => updateTask(task.id, u)} onDelete={() => deleteTask(task.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tactical Entry">
        <div className="space-y-8 pt-4">
          <Input label="Protocol Designation" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task name..." />
          <div className="grid grid-cols-2 gap-8">
            <Select label="Institutional Area" options={['Strategy', 'Research', 'Technical', 'Financial', 'Legal']} value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} />
            <Select label="Priority Weight" options={['low', 'medium', 'high', 'critical']} value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as TaskPriority})} />
          </div>
          <Button fullWidth className="bg-slate-950" onClick={handleAdd}>Deploy Task</Button>
        </div>
      </Modal>
    </div>
  );
};

export const ProjectWorkspace: React.FC<{ user: User, project: Project, onBack: () => void }> = ({ user, project, onBack }) => {
   const [tab, setTab] = useState<'chat'|'tasks'|'brief'>('chat');
   const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks || []);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   
   const updateTasks = async (newTasks: ProjectTask[]) => { 
     setTasks(newTasks); 
     await db.projects.update(user.id, { ...project, tasks: newTasks }); 
   };

   const completedCount = tasks.filter(t => t.status === 'completed').length;
   const progress = Math.round((completedCount / (tasks.length || 1)) * 100);

   return (
      <div className="h-full flex bg-white font-inter overflow-hidden">
         {/* Sidebar - Context & Navigation */}
         <aside className={`bg-white border-r border-[#F1F5F9] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-[320px]' : 'w-0 overflow-hidden'}`}>
            <div className="p-8 border-b border-[#F1F5F9] flex flex-col gap-8 shrink-0">
               <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-slate-950 transition-all">
                  <ChevronLeft size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Back to Hub</span>
               </button>
               <div className="space-y-4">
                  <p className="text-[9px] font-bold text-[#246BFD] uppercase tracking-[0.5em]">Current Mandate</p>
                  <h2 className="text-3xl font-bold text-slate-950 tracking-tight italic leading-none">"{project.name}"</h2>
               </div>
            </div>
            
            <nav className="flex-1 p-6 space-y-2">
               {[
                 { id: 'chat', label: 'Command Hub', icon: Radio },
                 { id: 'tasks', label: 'Execution Roadmap', icon: Compass },
                 { id: 'brief', label: 'Institutional Briefing', icon: FileText }
               ].map(t => (
                 <button 
                  key={t.id} 
                  onClick={() => setTab(t.id as any)} 
                  className={`w-full flex items-center gap-5 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all group ${tab === t.id ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'}`}
                 >
                   <t.icon size={16} className={tab === t.id ? 'text-[#246BFD]' : 'group-hover:text-slate-950'} />
                   <span>{t.label}</span>
                 </button>
               ))}
            </nav>

            <div className="p-10 border-t border-[#F1F5F9] space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Fulfillment</span>
                    <span className="text-[10px] font-mono font-bold text-slate-900">{progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="h-full bg-[#246BFD] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Synapse Active</span>
               </div>
            </div>
         </aside>

         {/* Main Content Pane */}
         <div className="flex-1 flex flex-col relative bg-white">
            <div className="absolute top-6 left-6 z-30">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 bg-white border border-[#F1F5F9] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all hover:shadow-premium"
              >
                {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </button>
            </div>

            <div key={tab} className="h-full overflow-hidden">
              {tab === 'chat' && <ChatPanel user={user} project={project} />}
              {tab === 'tasks' && <TaskManager user={user} project={project} tasks={tasks} onUpdateTasks={updateTasks} />}
              {tab === 'brief' && (
                <div className="h-full overflow-y-auto px-10 lg:px-32 py-24 space-y-24 bg-white text-left custom-scrollbar">
                  <header className="border-b border-[#F1F5F9] pb-12">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-4">Institutional Briefing v1.0</p>
                    <h2 className="text-6xl font-bold text-slate-950 tracking-tighter italic">Mandate <span className="text-slate-200">Summary.</span></h2>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-40">
                    <div className="lg:col-span-2 p-12 bg-[#0F172A] rounded-[24px] text-white space-y-6">
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Core Objective</p>
                       <p className="text-3xl font-bold tracking-tight italic leading-relaxed">"{project.objective}"</p>
                    </div>

                    <Card title="Institutional Constraints">
                       <div className="flex flex-wrap gap-3">
                          {project.constraints?.length > 0 ? project.constraints.map((c, i) => (
                            <span key={i} className="px-4 py-1.5 bg-slate-50 border border-[#F1F5F9] text-[9px] font-bold text-slate-600 uppercase tracking-widest rounded-lg">"{c}"</span>
                          )) : <p className="text-xs text-slate-300 italic">Unconstrained environment.</p>}
                       </div>
                    </Card>

                    <Card title="Allocation Vector">
                       <div className="space-y-8">
                          <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capital Mandate</span>
                             <span className="text-sm font-bold text-slate-950 italic">{project.budget || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Window</span>
                             <span className="text-sm font-bold text-slate-950 italic">{project.timeline || 'TBD'}</span>
                          </div>
                       </div>
                    </Card>

                    <div className="lg:col-span-2 pt-12 border-t border-[#F1F5F9]">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-8">Executive Narrative</h4>
                      <div className="prose max-w-none text-slate-700 font-medium italic leading-relaxed">
                         <SimpleMarkdown>{project.description}</SimpleMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
         </div>
      </div>
   );
};