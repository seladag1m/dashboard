
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderPlus, Plus, Briefcase, FileText, UploadCloud, X, ArrowRight, 
  Trash2, ChevronLeft, Loader2, Check, ListTodo, Target, Clock3, Circle, CheckCircle2,
  DollarSign, Calendar, Settings2, LayoutTemplate, Sparkles, ShieldCheck,
  MoreVertical, MoreHorizontal, Filter, Grid, List, AlertCircle, CalendarDays,
  Tag, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { User, Project, ProjectFile, ProjectTask, TaskStatus, TaskPriority } from '../types';
import { Button, Input, Select, Modal } from './UI';
import { db } from '../services/database';
import { ChatPanel } from '../pages/Chat';

const STRATEGIC_TEMPLATES = [
  { 
    id: 'market_entry', 
    name: 'Market Entry Strategy', 
    description: 'Framework for expansion into new jurisdictions or segments.', 
    icon: Target, 
    tasks: [
      { id: '1', title: 'Competitor Mapping', category: 'Research', priority: 'high', status: 'pending' },
      { id: '2', title: 'Jurisdiction Audit', category: 'Technical', priority: 'medium', status: 'pending' },
      { id: '3', title: 'Regulatory Review', category: 'Strategy', priority: 'critical', status: 'pending' },
      { id: '4', title: 'Go-to-market Draft', category: 'Strategy', priority: 'high', status: 'pending' }
    ]
  },
  { 
    id: 'operational_efficiency', 
    name: 'Efficiency Audit', 
    description: 'Institutional review of internal workflows and overhead.', 
    icon: ShieldCheck, 
    tasks: [
      { id: '1', title: 'Workflow Mapping', category: 'Analysis', priority: 'medium', status: 'pending' },
      { id: '2', title: 'Cost Center Analysis', category: 'Financial', priority: 'high', status: 'pending' },
      { id: '3', title: 'Automation Audit', category: 'Technical', priority: 'medium', status: 'pending' },
      { id: '4', title: 'Protocol Optimization', category: 'Strategy', priority: 'critical', status: 'pending' }
    ]
  }
];

const STATUS_COLUMNS: { label: string; value: TaskStatus; color: string }[] = [
  { label: 'Backlog', value: 'pending', color: 'slate' },
  { label: 'In Progress', value: 'in-progress', color: 'blue' },
  { label: 'Review', value: 'review', color: 'amber' },
  { label: 'Completed', value: 'completed', color: 'emerald' }
];

const PRIORITY_THEME = {
  low: 'bg-slate-50 text-slate-400 border-slate-100',
  medium: 'bg-blue-50 text-blue-500 border-blue-100',
  high: 'bg-orange-50 text-orange-500 border-orange-100',
  critical: 'bg-rose-50 text-rose-500 border-rose-100'
};

export const ProjectList: React.FC<{ user: User, onSelectProject: (p: Project | null) => void }> = ({ user, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     db.projects.list(user.id).then(res => { setProjects(res); setLoading(false); });
  }, [user.id]);

  const handleDelete = async (e: React.MouseEvent, pid: string) => {
     e.stopPropagation();
     if(confirm('Revoke Initiative? This will purge all neural context associated with this mandate.')) {
        await db.projects.delete(user.id, pid);
        setProjects(p => p.filter(x => x.id !== pid));
     }
  };

  return (
     <div className="animate-reveal space-y-12 pb-40 max-w-[1440px] mx-auto p-6 lg:p-12">
        <div className="flex items-end justify-between border-b pb-10">
          <div className="text-left">
            <h1 className="text-5xl font-serif font-bold text-slate-900 italic">Institutional Mandates</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Strategic Execution Layer</p>
          </div>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Initialize Mandate</Button>
        </div>
        
        {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div> : projects.length === 0 ? (
          <div className="py-40 bg-white rounded-[3rem] border border-slate-100 shadow-premium text-center space-y-8">
             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                <Briefcase size={32} />
             </div>
             <div>
                <h3 className="text-2xl font-serif font-bold italic">No Active Mandates</h3>
                <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto mt-2">Initialize your first strategic initiative to begin institutional deployment.</p>
             </div>
             <Button onClick={() => setIsModalOpen(true)} className="rounded-full px-10 h-14">Launch Initiative</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {projects.map(p => (
                <div key={p.id} onClick={() => onSelectProject(p)} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-premium hover:shadow-float transition-all cursor-pointer group text-left min-h-[380px] flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                   <div>
                     <div className="flex justify-between items-start mb-10">
                        <div className="w-14 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-2xl relative z-10 group-hover:bg-brand-blue transition-colors">
                           <Briefcase size={24} />
                        </div>
                        <button onClick={(e) => handleDelete(e, p.id)} className="text-slate-200 hover:text-rose-500 transition-colors relative z-10"><Trash2 size={18} /></button>
                     </div>
                     <h3 className="text-2xl font-serif font-bold text-slate-900 italic line-clamp-2 leading-tight">{p.name}</h3>
                     <p className="text-sm text-slate-400 mt-4 line-clamp-3 leading-relaxed italic">"{p.description}"</p>
                   </div>
                   <div className="pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest relative z-10">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                         <span>{p.createdAt}</span>
                      </div>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-slate-200 group-hover:text-brand-blue" />
                   </div>
                </div>
             ))}
          </div>
        )}
        <ProjectCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} onCreated={(p) => setProjects(prev => [p, ...prev])} />
     </div>
  );
};

const ProjectCreateModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User, onCreated: (p: Project) => void }> = ({ isOpen, onClose, user, onCreated }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', goal: '', description: '', templateId: '' });
  const [loading, setLoading] = useState(false);

  const selectTemplate = (tid: string) => {
    const template = STRATEGIC_TEMPLATES.find(t => t.id === tid);
    if (template) {
      setForm({
        ...form,
        templateId: tid,
        name: template.name,
        goal: template.description,
        description: `Automated ${template.name} framework initialization. Objective: ${template.description}`
      });
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.goal) return;
    setLoading(true);
    const template = STRATEGIC_TEMPLATES.find(t => t.id === form.templateId);
    
    const proj: Project = {
      id: Date.now().toString(), 
      name: form.name, 
      description: form.description || "Synthesizing mandate context...", 
      goal: form.goal,
      type: 'Strategic planning', 
      timeframe: '3 months', 
      audience: 'Institutional', 
      budget: 'Standard',
      files: [], 
      tasks: (template?.tasks || []).map((t, idx) => ({ 
        id: (Date.now() + idx).toString(), 
        title: t.title, 
        category: t.category, 
        priority: t.priority as TaskPriority, 
        status: t.status as TaskStatus,
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString()
      })), 
      kpis: [], 
      intent: '', 
      createdAt: new Date().toLocaleDateString(), 
      lastActive: 'Now',
      status: 'Active', 
      objective: form.goal, 
      constraints: [], 
      timeline: '3 months',
      templateId: form.templateId
    };
    await db.projects.create(user.id, proj);
    onCreated(proj);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Institutional Templates" : "Initialize Mandate"}>
       <div className="space-y-8 pt-4">
          {step === 1 ? (
             <div className="space-y-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Select a pre-calibrated strategic framework</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {STRATEGIC_TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => selectTemplate(t.id)} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-left hover:border-brand-blue hover:bg-white group transition-all">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-blue shadow-sm mb-4"><t.icon size={18} /></div>
                         <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t.name}</h4>
                         <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2">{t.description}</p>
                      </button>
                   ))}
                   <button onClick={() => setStep(2)} className="p-8 bg-white border border-dashed border-slate-200 rounded-[2.5rem] text-left flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all">
                      <Plus size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Custom Mandate</span>
                   </button>
                </div>
             </div>
          ) : (
             <div className="space-y-6 animate-reveal">
                <Input label="Initiative Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Q4 Global Expansion" />
                <Input label="Strategic Goal" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} placeholder="Establish institutional presence..." />
                <div className="space-y-2">
                   <label className="block text-xs font-inter font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1">Mandate Summary</label>
                   <textarea className="w-full p-8 bg-slate-50 rounded-[2.5rem] h-40 text-sm font-medium focus:ring-4 focus:ring-brand-blue/5 outline-none border border-transparent focus:border-brand-blue/10 transition-all placeholder:text-slate-300" placeholder="Describe the desired outcome..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-4">
                   <Button variant="ghost" fullWidth onClick={() => setStep(1)}>Back</Button>
                   <Button fullWidth onClick={handleSubmit} isLoading={loading} size="lg" className="rounded-full shadow-2xl">Authorize Mandate</Button>
                </div>
             </div>
          )}
       </div>
    </Modal>
  );
};

export const TaskCard: React.FC<{ task: ProjectTask; onUpdate: (updates: Partial<ProjectTask>) => void; onDelete: () => void }> = ({ task, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cycleStatus = () => {
    const statuses: TaskStatus[] = ['pending', 'in-progress', 'review', 'completed'];
    const nextIndex = (statuses.indexOf(task.status) + 1) % statuses.length;
    onUpdate({ status: statuses[nextIndex] });
  };

  return (
    <div 
      className={`p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-float transition-all group relative cursor-pointer select-none ${task.status === 'completed' ? 'opacity-50 grayscale bg-slate-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={cycleStatus}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${PRIORITY_THEME[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex gap-2">
          {isHovered && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
      
      <h4 className={`text-sm font-bold text-slate-900 leading-snug mb-3 ${task.status === 'completed' ? 'line-through' : ''}`}>
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
           <Tag size={10} className="text-slate-300" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.category || 'Strategic'}</span>
        </div>
        <div className="flex items-center gap-2">
           <CalendarDays size={10} className="text-slate-300" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export const TaskManager: React.FC<{ user: User; project: Project; tasks: ProjectTask[]; onUpdateTasks: (newTasks: ProjectTask[]) => void }> = ({ user, project, tasks, onUpdateTasks }) => {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [filter, setFilter] = useState<TaskPriority | 'all'>('all');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState<{ title: string; category: string; priority: TaskPriority }>({ title: '', category: 'Strategy', priority: 'medium' });

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(t => t.priority === filter);
  }, [tasks, filter]);

  const updateTask = (id: string, updates: Partial<ProjectTask>) => {
    const nextTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    onUpdateTasks(nextTasks);
  };

  const deleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddTask = () => {
    if (!newTaskForm.title) return;
    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title: newTaskForm.title,
      category: newTaskForm.category,
      priority: newTaskForm.priority,
      status: 'pending',
      dueDate: new Date(Date.now() + 604800000).toISOString()
    };
    onUpdateTasks([newTask, ...tasks]);
    setIsAddTaskModalOpen(false);
    setNewTaskForm({ title: '', category: 'Strategy', priority: 'medium' });
  };

  const renderBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {STATUS_COLUMNS.map(col => (
        <div key={col.value} className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-lg shadow-${col.color}-500/20`}></div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{col.label}</h3>
             </div>
             <span className="text-[10px] font-mono font-bold text-slate-300">{filteredTasks.filter(t => t.status === col.value).length}</span>
          </div>
          <div className="space-y-4 min-h-[400px] p-2 rounded-[2.5rem] bg-slate-50/50 border border-slate-100/50">
            {filteredTasks.filter(t => t.status === col.value).map(task => (
              <TaskCard key={task.id} task={task} onUpdate={(u) => updateTask(task.id, u)} onDelete={() => deleteTask(task.id)} />
            ))}
            {filteredTasks.filter(t => t.status === col.value).length === 0 && (
              <div className="h-32 flex flex-col items-center justify-center opacity-20 grayscale">
                 <Circle size={24} className="text-slate-400 mb-2" strokeWidth={1} />
                 <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Empty Stack</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-12 lg:p-20 custom-scrollbar bg-slate-50/30">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
          <div>
            <h3 className="text-4xl font-serif font-bold italic text-slate-950">Tactical Roadmap</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Execution matrix for {project.name}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
               <button onClick={() => setView('board')} className={`p-2 rounded-xl transition-all ${view === 'board' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={16} /></button>
               <button onClick={() => setView('list')} className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
            </div>
            <Select 
              className="h-10 text-[10px] font-bold uppercase tracking-widest rounded-2xl" 
              options={['all', 'low', 'medium', 'high', 'critical']} 
              value={filter} 
              onChange={e => setFilter(e.target.value)} 
            />
            <Button icon={Plus} onClick={() => setIsAddTaskModalOpen(true)} size="sm" className="rounded-2xl h-10 shadow-lg">New Task</Button>
          </div>
        </div>

        {view === 'board' ? renderBoard() : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-premium transition-all">
                 <div className="flex items-center gap-8 flex-1">
                    <button onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })} className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 border-slate-200 text-transparent group-hover:border-brand-blue'}`}>
                       <Check size={16} />
                    </button>
                    <div>
                       <h4 className={`text-base font-bold text-slate-800 ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
                       <div className="flex items-center gap-4 mt-1">
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${PRIORITY_THEME[task.priority]}`}>{task.priority}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{task.category}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-12">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{task.status}</span>
                    <button onClick={() => deleteTask(task.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                 </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-12 bg-slate-950 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-blue/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 text-brand-blue mb-4 relative z-10">
             <Sparkles size={20} />
             <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Autonomous Support</span>
          </div>
          <p className="text-xl font-source-serif italic font-light relative z-10 leading-relaxed text-left">
             "Deploying a specialized agent to automate documentation and competitor surveillance for this mandate. Authorization pending."
          </p>
          <Button variant="ghost" className="mt-8 text-white hover:bg-white/10 p-0 h-auto relative z-10" onClick={() => alert("Agent Deployment Protocol Initiated.")}>
             Authorize Deployment <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </div>

      <Modal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} title="Initialize Tactical Task">
         <div className="space-y-6 pt-4 animate-reveal">
            <Input label="Task Title" value={newTaskForm.title} onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})} placeholder="e.g. Map Market Entry Barriers" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={['Strategy', 'Research', 'Technical', 'Creative', 'Financial']} value={newTaskForm.category} onChange={e => setNewTaskForm({...newTaskForm, category: e.target.value})} />
              <Select label="Priority" options={['low', 'medium', 'high', 'critical']} value={newTaskForm.priority} onChange={e => setNewTaskForm({...newTaskForm, priority: e.target.value})} />
            </div>
            <Button fullWidth onClick={handleAddTask} className="rounded-full h-16 shadow-xl">Synthesize Task</Button>
         </div>
      </Modal>
    </div>
  );
};

export const ProjectWorkspace: React.FC<{ user: User, project: Project, onBack: () => void }> = ({ user, project, onBack }) => {
   const [tab, setTab] = useState<'chat'|'tasks'>('chat');
   const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks || []);

   const updateTasks = async (newTasks: ProjectTask[]) => {
      setTasks(newTasks);
      const updatedProject = { ...project, tasks: newTasks };
      await db.projects.update(user.id, updatedProject);
   };

   return (
      <div className="h-full flex flex-col bg-white animate-reveal">
         <div className="h-24 px-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-8">
               <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:scale-105 active:scale-95"><ChevronLeft size={20} /></button>
               <div>
                  <h2 className="text-2xl font-serif font-bold italic text-slate-950 tracking-tight">{project.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Protocol</p>
                  </div>
               </div>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner">
               <button onClick={() => setTab('chat')} className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'chat' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Strategic Hub</button>
               <button onClick={() => setTab('tasks')} className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'tasks' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Tactical Roadmap</button>
            </div>
         </div>
         <div className="flex-1 overflow-hidden">
            {tab === 'chat' ? (
               <ChatPanel user={user} project={project} />
            ) : (
               <TaskManager user={user} project={project} tasks={tasks} onUpdateTasks={updateTasks} />
            )}
         </div>
      </div>
   );
};
