
import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Plus, Briefcase, FileText, UploadCloud, X, ArrowRight, 
  MoreHorizontal, Calendar, Target, Users, DollarSign, Globe, Trash2, 
  ExternalLink, MessageSquare, Paperclip, ChevronLeft, Loader2, Check,
  Activity, ListTodo, Clock3, Circle, CheckCircle2, AlertCircle, LayoutDashboard, Settings2, MoreVertical
} from 'lucide-react';
import { User, Project, ProjectFile, ProjectTask } from '../types';
import { Button, Input, Select, Modal, Card } from './UI';
import { db } from '../services/database';
import { ChatPanel } from '../pages/Chat';

interface ProjectsProps {
  user: User;
  onSelectProject: (p: Project | null) => void;
}

// --- PROJECT CREATE FORM ---
const ProjectCreateModal: React.FC<{ isOpen: boolean; onClose: () => void; user: User; onCreated: (p: Project) => void }> = ({ 
  isOpen, onClose, user, onCreated 
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  
  const [form, setForm] = useState({
    name: '', type: 'Strategic Planning', description: '',
    goal: '', timeframe: '3 Months', audience: '', budget: '',
    website: user.dna.website || '', kpis: '', intent: ''
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: ProjectFile[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        const content = await new Promise<string>((resolve) => {
           reader.onload = (e) => resolve(e.target?.result?.toString().split(',')[1] || '');
           reader.readAsDataURL(file);
        });
        
        newFiles.push({
          id: Date.now() + i + '',
          name: file.name,
          type: file.name.split('.').pop() || 'file',
          size: (file.size / 1024).toFixed(0) + 'KB',
          mimeType: file.type,
          content: content
        });
      }
      setFiles(p => [...p, ...newFiles]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const newProject: Project = {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      description: form.description,
      goal: form.goal,
      timeframe: form.timeframe,
      audience: form.audience,
      budget: form.budget,
      website: form.website,
      kpis: form.kpis.split(',').map(k => k.trim()).filter(k => k),
      intent: form.intent,
      files: files,
      tasks: [],
      createdAt: new Date().toLocaleDateString(),
      lastActive: new Date().toLocaleDateString()
    };
    
    await db.projects.create(user.id, newProject);
    onCreated(newProject);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initialize Initiative">
       <div className="pt-2">
          {/* Visual Stepper */}
          <div className="relative flex items-center justify-between mb-10 px-4">
             <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-slate-100 -z-0 mx-4">
                <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
             </div>
             
             {[
               { id: 1, label: 'Vision' },
               { id: 2, label: 'Scope' },
               { id: 3, label: 'Knowledge' }
             ].map((s) => (
               <div key={s.id} className="flex flex-col items-center relative z-10 gap-2">
                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 border-4 border-white ${
                   step >= s.id ? 'bg-slate-900 text-white shadow-xl scale-110' : 'bg-slate-50 text-slate-300'
                 }`}>
                   {step > s.id ? <Check size={16} /> : s.id}
                 </div>
                 <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${step >= s.id ? 'text-slate-900' : 'text-slate-200'}`}>{s.label}</span>
               </div>
             ))}
          </div>

          <div className="min-h-[350px]">
            {step === 1 && (
              <div className="space-y-6 animate-reveal">
                 <div className="grid grid-cols-2 gap-5">
                    <Input label="Initiative Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Q4 Growth Sprint" autoFocus />
                    <Select label="Focus Area" options={['Strategic Planning', 'Marketing Campaign', 'Product Launch', 'Market Expansion', 'Operational Efficiency', 'Sales Growth']} value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Executive Summary</label>
                    <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:bg-white focus:border-brand-blue outline-none h-32 resize-none transition-all placeholder-slate-300" placeholder="High-level description of the mandate..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                 </div>
                 <Input label="Primary North Star" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} placeholder="e.g. Capture 12% market share in EMEA" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-reveal">
                 <div className="grid grid-cols-2 gap-5">
                    <Input label="Timeline" value={form.timeframe} onChange={e => setForm({...form, timeframe: e.target.value})} />
                    <Input label="Allocation" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
                 </div>
                 <Input label="Target Audience" value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} />
                 <Input label="Reference URL" value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." />
                 <Input label="Critical Success Factors (KPIs)" value={form.kpis} onChange={e => setForm({...form, kpis: e.target.value})} placeholder="Separated by commas" />
              </div>
            )}

            {step === 3 && (
               <div className="space-y-6 animate-reveal">
                  <div className="space-y-2">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">AI Ingest Strategy</label>
                     <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:bg-white focus:border-brand-blue outline-none h-28 resize-none transition-all placeholder-slate-300" placeholder="Instructions for the engine (e.g. Analyze Q3 reports and identify gaps)..." value={form.intent} onChange={e => setForm({...form, intent: e.target.value})} />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Context Artifacts</label>
                     <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-10 text-center hover:bg-slate-50 hover:border-brand-blue/30 transition-all relative cursor-pointer group">
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFile} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv" />
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-premium">
                           <UploadCloud className="text-slate-300 group-hover:text-brand-blue transition-colors" size={28} />
                        </div>
                        <p className="text-sm font-bold text-slate-900">Upload Intelligence Assets</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">PDF, DOC, PPT, or Raw Data</p>
                     </div>
                     
                     {files.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 gap-3">
                           {files.map(f => (
                              <div key={f.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-reveal group">
                                 <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                                       <FileText size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                       <div className="text-xs font-bold text-slate-900 truncate">{f.name}</div>
                                       <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{f.size} • {f.type}</div>
                                    </div>
                                 </div>
                                 <button onClick={() => setFiles(p => p.filter(x => x.id !== f.id))} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><X size={16} /></button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            )}
          </div>

          <div className="flex justify-between pt-8 mt-8 border-t border-slate-50">
             {step > 1 ? (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Backtrack</Button>
             ) : <div></div>}
             
             {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!form.name || !form.goal} size="lg">Continue <ArrowRight size={18} className="ml-2"/></Button>
             ) : (
                <Button onClick={handleSubmit} isLoading={loading} size="lg" className="shadow-2xl shadow-brand-blue/20">Authorize Initiative</Button>
             )}
          </div>
       </div>
    </Modal>
  );
};

// --- TASK COMPONENT ---
const TaskBoard: React.FC<{ user: User, project: Project, onUpdate: (p: Project) => void }> = ({ user, project, onUpdate }) => {
    const [newTask, setNewTask] = useState('');
    const [dueDate, setDueDate] = useState('');

    const addTask = async () => {
        if (!newTask.trim()) return;
        const task: ProjectTask = {
            id: Date.now().toString(),
            title: newTask,
            dueDate: dueDate || undefined,
            status: 'Pending'
        };
        const updatedProject = { ...project, tasks: [task, ...project.tasks] };
        await db.projects.update(user.id, updatedProject);
        onUpdate(updatedProject);
        setNewTask('');
        setDueDate('');
    };

    const toggleStatus = async (taskId: string) => {
        const updatedTasks = project.tasks.map(t => {
            if (t.id === taskId) {
                const nextStatus: any = t.status === 'Pending' ? 'In Progress' : t.status === 'In Progress' ? 'Completed' : 'Pending';
                return { ...t, status: nextStatus };
            }
            return t;
        });
        const updatedProject = { ...project, tasks: updatedTasks };
        await db.projects.update(user.id, updatedProject);
        onUpdate(updatedProject);
    };

    const deleteTask = async (taskId: string) => {
        const updatedProject = { ...project, tasks: project.tasks.filter(t => t.id !== taskId) };
        await db.projects.update(user.id, updatedProject);
        onUpdate(updatedProject);
    };

    return (
        <div className="flex flex-col h-full bg-white animate-reveal">
            <div className="p-8 border-b border-slate-50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <ListTodo className="text-brand-blue" size={22} />
                    <h3 className="text-xl font-serif font-bold text-slate-900 italic">Initiative Deliverables</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{project.tasks.filter(t => t.status === 'Completed').length} / {project.tasks.length} Resolved</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                        className="flex-1 h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm font-medium"
                        placeholder="Define tactical deliverable..."
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                    />
                    <div className="flex gap-4">
                      <input 
                          type="date"
                          className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-blue outline-none transition-all text-xs font-bold uppercase tracking-widest text-slate-400"
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                      />
                      <Button onClick={addTask} disabled={!newTask.trim()} size="lg" className="shrink-0 rounded-2xl shadow-premium"><Plus size={18} /></Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                {project.tasks.length === 0 ? (
                    <div className="text-center py-20 opacity-30 italic flex flex-col items-center gap-4">
                        <Circle size={40} />
                        <p className="text-sm font-medium">Mandate pending tactical resolution.</p>
                    </div>
                ) : (
                    project.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-50 shadow-premium hover:border-brand-blue/20 transition-all group animate-reveal">
                            <button 
                                onClick={() => toggleStatus(task.id)}
                                className={`shrink-0 w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                                    task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 
                                    task.status === 'In Progress' ? 'bg-amber-50 border-amber-200 text-amber-500' : 
                                    'bg-white border-slate-200 text-slate-200 hover:border-brand-blue'
                                }`}
                            >
                                {task.status === 'Completed' ? <CheckCircle2 size={20} /> : 
                                 task.status === 'In Progress' ? <Clock3 size={20} /> : 
                                 <div className="w-2.5 h-2.5 rounded-full bg-slate-100"></div>}
                            </button>
                            
                            <div className="flex-1 overflow-hidden text-left">
                                <h4 className={`text-base font-bold truncate ${task.status === 'Completed' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>{task.title}</h4>
                                <div className="flex items-center gap-4 mt-1.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                        task.status === 'In Progress' ? 'bg-amber-50 text-amber-600' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {task.status}
                                    </span>
                                    {task.dueDate && (
                                        <div className="text-[9px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-widest">
                                            <Calendar size={12} /> {task.dueDate}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-3 hover:bg-rose-50 text-slate-200 hover:text-rose-500 transition-all rounded-2xl">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- PROJECT LIST VIEW ---
export const ProjectList: React.FC<ProjectsProps> = ({ user, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     db.projects.list(user.id).then(res => {
        setProjects(res);
        setLoading(false);
     });
  }, [user.id]);

  const handleDelete = async (e: React.MouseEvent, pid: string) => {
     e.stopPropagation();
     if(confirm('Revoke Initiative? All neural context will be purged.')) {
        await db.projects.delete(user.id, pid);
        setProjects(p => p.filter(x => x.id !== pid));
     }
  };

  return (
     <div className="animate-reveal space-y-12 pb-40 max-w-[1440px] mx-auto p-6 lg:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
          <div className="space-y-2">
              <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight italic">Mandates & Projects</h1>
              <p className="text-slate-400 text-lg font-light">Dedicated intelligence silos for high-stakes initiatives.</p>
          </div>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)} size="lg" className="rounded-full shadow-2xl shadow-brand-blue/20">Authorize Initiative</Button>
        </div>

        {loading ? (
            <div className="flex justify-center py-40"><Loader2 className="animate-spin text-brand-blue w-10 h-10" /></div>
        ) : projects.length === 0 ? (
            <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-premium text-center px-8">
               <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-10 text-slate-200 shadow-inner group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <FolderPlus size={48} />
               </div>
               <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 italic">No Active Mandates</h3>
               <p className="text-slate-400 max-w-sm mx-auto mb-10 leading-relaxed text-sm">
                  Initialize a project to engage specialized AI logic. Upload strategic context to narrow the reasoning engine.
               </p>
               <Button onClick={() => setIsModalOpen(true)} icon={Plus} size="lg" className="rounded-full">Launch First Initiative</Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {projects.map(p => (
                  <div key={p.id} onClick={() => onSelectProject(p)} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-premium hover:shadow-float hover:border-brand-blue/20 transition-all cursor-pointer group flex flex-col justify-between min-h-[350px] relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 opacity-50 group-hover:bg-brand-blue/5 transition-all"></div>
                      
                      <div className="relative z-10 space-y-6">
                         <div className="flex justify-between items-start">
                            <div className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                               <Briefcase size={24} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                                    LIVE
                                </span>
                                <button onClick={(e) => handleDelete(e, p.id)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-200 hover:text-rose-500 transition-all">
                                   <Trash2 size={16} />
                                </button>
                            </div>
                         </div>
                         
                         <div className="space-y-2 text-left">
                           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{p.type}</p>
                           <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight group-hover:text-brand-blue transition-colors line-clamp-2 italic">{p.name}</h3>
                         </div>
                         <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed text-left">{p.description}</p>
                         
                         <div className="flex flex-wrap gap-2 justify-start">
                            {p.kpis.slice(0, 2).map((k, i) => (
                                <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 uppercase tracking-widest">{k}</span>
                            ))}
                         </div>
                      </div>
                      
                      <div className="relative z-10 pt-8 mt-8 border-t border-slate-50 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-brand-blue transition-colors">
                               <Paperclip size={14} />
                               <span className="text-[10px] font-bold">{p.files.length}</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-amber-500 transition-colors">
                               <ListTodo size={14} />
                               <span className="text-[10px] font-bold">{p.tasks.length}</span>
                             </div>
                          </div>
                          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                             {p.lastActive}
                          </div>
                      </div>
                  </div>
               ))}
               
               <button onClick={() => setIsModalOpen(true)} className="rounded-[2.5rem] border-2 border-dashed border-slate-100 hover:border-brand-blue/30 hover:bg-white flex flex-col items-center justify-center text-slate-300 hover:text-brand-blue transition-all min-h-[350px] group gap-6 shadow-sm hover:shadow-premium">
                   <div className="w-16 h-16 rounded-3xl bg-slate-50 group-hover:bg-brand-blue/10 flex items-center justify-center transition-all">
                       <Plus size={32} />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Engage New Silo</span>
               </button>
            </div>
        )}

        <ProjectCreateModal 
           isOpen={isModalOpen} 
           onClose={() => setIsModalOpen(false)} 
           user={user} 
           onCreated={(p) => setProjects(prev => [p, ...prev])} 
        />
     </div>
  );
};

// --- PROJECT WORKSPACE ---
export const ProjectWorkspace: React.FC<{ user: User, project: Project, onBack: () => void }> = ({ user, project: initialProject, onBack }) => {
   const [activeTab, setActiveTab] = useState<'chat'|'files'|'tasks'>('chat');
   const [project, setProject] = useState(initialProject);

   return (
      <div className="h-full flex flex-col overflow-hidden bg-white animate-reveal">
         
         {/* Enhanced Workspace Header */}
         <div className="h-24 px-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0 z-20">
            <div className="flex items-center gap-6">
               <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all group" title="Return to Archive">
                  <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
               </button>
               <div className="h-10 w-px bg-slate-100"></div>
               <div className="text-left space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-serif font-bold text-slate-900 italic tracking-tight">{project.name}</h2>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[8px] font-bold uppercase tracking-[0.2em]">{project.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> {project.timeframe}</div>
                    <div className="flex items-center gap-1.5"><DollarSign size={12} /> {project.budget}</div>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100">
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 ${activeTab === 'chat' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <MessageSquare size={16} /> Strategy
                    </button>
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 ${activeTab === 'tasks' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <ListTodo size={16} /> Tactics
                    </button>
                    <button 
                        onClick={() => setActiveTab('files')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 md:hidden ${activeTab === 'files' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Paperclip size={16} /> Artifacts
                    </button>
                </div>
                <div className="h-10 w-px bg-slate-100 hidden md:block mx-2"></div>
                <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm">
                  <Settings2 size={20} />
                </button>
            </div>
         </div>

         {/* Enhanced Workspace Body */}
         <div className="flex-1 flex overflow-hidden relative">
            
            {/* Main Area */}
            <div className={`flex-1 relative bg-white flex flex-col ${activeTab === 'chat' ? 'block' : activeTab === 'tasks' ? 'block' : 'hidden md:flex'}`}>
               {activeTab === 'chat' ? (
                   <ChatPanel 
                        user={user} 
                        project={project}
                        externalTrigger={project.intent ? `Executing tactical mandate: ${project.intent}` : `Initiating workspace for ${project.name}. Cross-referencing institutional DNA and uploaded assets.`}
                    />
               ) : (
                   <TaskBoard user={user} project={project} onUpdate={setProject} />
               )}
            </div>

            {/* Enhanced Context Panel */}
            <div className={`w-full md:w-96 bg-white border-l border-slate-50 flex-col overflow-y-auto no-scrollbar ${activeTab === 'files' ? 'flex' : 'hidden md:flex'}`}>
                <div className="p-10 space-y-12">
                    
                    {/* Vision Block */}
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Target size={14} className="text-brand-blue" /> Strategy Lock
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-sm font-medium text-slate-900 leading-relaxed italic shadow-inner">
                           "{project.goal}"
                        </div>
                    </div>

                    {/* Artifact Vault */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Paperclip size={14} className="text-brand-blue" /> Knowledge Vault
                           </div>
                           <span className="text-[9px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500 uppercase">{project.files.length} Silos</span>
                        </div>
                        
                        {project.files.length === 0 ? (
                           <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-[2rem] group hover:border-brand-blue/20 transition-all cursor-pointer">
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Vault Empty</p>
                              <button className="text-[10px] font-bold text-brand-blue mt-3 hover:underline uppercase tracking-widest">Inject Data</button>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {project.files.map(f => (
                                 <div key={f.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-50 shadow-premium hover:border-brand-blue/20 hover:shadow-float transition-all group cursor-pointer text-left">
                                    <div className="w-11 h-11 bg-slate-50 text-brand-blue rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 shadow-sm">
                                       <FileText size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                       <div className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{f.name}</div>
                                       <div className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{f.size} • {f.type}</div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                    </div>

                    {/* Success Indicators */}
                    <div className="space-y-6">
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Activity size={14} className="text-brand-blue" /> Success Thresholds
                        </div>
                        <div className="flex flex-wrap gap-3">
                           {project.kpis.map((k, i) => (
                              <span key={i} className="px-4 py-2.5 bg-white text-slate-600 text-[10px] font-bold rounded-xl border border-slate-100 shadow-sm uppercase tracking-widest">{k}</span>
                           ))}
                           {project.kpis.length === 0 && <p className="text-[10px] font-bold text-slate-300 italic uppercase">Thresholds not defined.</p>}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-10 border-t border-slate-50 space-y-4">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-slate-300">Audience Segment</span>
                           <span className="text-slate-900">{project.audience || 'General'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-slate-300">Authorization</span>
                           <span className="text-slate-900">{project.createdAt}</span>
                        </div>
                    </div>

                </div>
            </div>
         </div>
      </div>
   );
};
