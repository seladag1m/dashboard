
import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Plus, Briefcase, FileText, UploadCloud, X, ArrowRight, 
  Trash2, ChevronLeft, Loader2, Check, ListTodo, Target, Clock3, Circle, CheckCircle2,
  DollarSign, Calendar, Settings2
} from 'lucide-react';
import { User, Project, ProjectFile, ProjectTask } from '../types';
import { Button, Input, Select, Modal } from './UI';
import { db } from '../services/database';
import { ChatPanel } from '../pages/Chat';

export const ProjectList: React.FC<{ user: User, onSelectProject: (p: Project | null) => void }> = ({ user, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     db.projects.list(user.id).then(res => { setProjects(res); setLoading(false); });
  }, [user.id]);

  const handleDelete = async (e: React.MouseEvent, pid: string) => {
     e.stopPropagation();
     if(confirm('Revoke Initiative? Purging neural context.')) {
        await db.projects.delete(user.id, pid);
        setProjects(p => p.filter(x => x.id !== pid));
     }
  };

  return (
     <div className="animate-reveal space-y-12 pb-40 max-w-[1440px] mx-auto p-6 lg:p-12">
        <div className="flex items-end justify-between border-b pb-10">
          <div className="text-left"><h1 className="text-5xl font-serif font-bold text-slate-900 italic">Mandates</h1></div>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Initialize</Button>
        </div>
        {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : projects.length === 0 ? (
          <div className="py-20 bg-white rounded-[3rem] border border-slate-100 shadow-premium text-center">
             <h3 className="text-xl font-serif font-bold">No Active Mandates</h3>
             <Button onClick={() => setIsModalOpen(true)} className="mt-8">Launch First Initiative</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {projects.map(p => (
                <div key={p.id} onClick={() => onSelectProject(p)} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-premium hover:shadow-float transition-all cursor-pointer group text-left min-h-[300px] flex flex-col justify-between">
                   <div>
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center"><Briefcase size={20} /></div>
                        <button onClick={(e) => handleDelete(e, p.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                     </div>
                     <h3 className="text-xl font-serif font-bold text-slate-900 italic line-clamp-2">{p.name}</h3>
                     <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">"{p.description}"</p>
                   </div>
                   <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                      <span>{p.createdAt}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
  const [form, setForm] = useState({ name: '', goal: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.goal) return;
    setLoading(true);
    const proj: Project = {
      id: Date.now().toString(), name: form.name, description: form.description, goal: form.goal,
      type: 'Strategic planning', timeframe: '3 months', audience: 'Market', budget: 'Standard',
      files: [], tasks: [], kpis: [], intent: '', createdAt: new Date().toLocaleDateString(), lastActive: 'Now'
    };
    await db.projects.create(user.id, proj);
    onCreated(proj);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initialize Mandate">
       <div className="space-y-6 pt-4">
          <Input label="Initiative Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Q4 Growth Sprint" />
          <Input label="Primary Goal" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} placeholder="Establish market share..." />
          <textarea className="w-full p-6 bg-slate-50 rounded-[2rem] h-32 text-sm" placeholder="Mandate summary..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <Button fullWidth onClick={handleSubmit} isLoading={loading}>Authorize Initiative</Button>
       </div>
    </Modal>
  );
};

export const ProjectWorkspace: React.FC<{ user: User, project: Project, onBack: () => void }> = ({ user, project, onBack }) => {
   const [tab, setTab] = useState<'chat'|'tasks'>('chat');
   return (
      <div className="h-full flex flex-col bg-white animate-reveal">
         <div className="h-24 px-8 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
               <button onClick={onBack} className="text-slate-300 hover:text-slate-900 transition-colors"><ChevronLeft size={24} /></button>
               <h2 className="text-xl font-serif font-bold italic">{project.name}</h2>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <button onClick={() => setTab('chat')} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase ${tab === 'chat' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Strategy</button>
               <button onClick={() => setTab('tasks')} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase ${tab === 'tasks' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Tactics</button>
            </div>
         </div>
         <div className="flex-1 overflow-hidden">
            {tab === 'chat' ? <ChatPanel user={user} project={project} /> : <div className="p-10 text-center opacity-30 italic">Deliverables protocol pending calibration.</div>}
         </div>
      </div>
   );
};
