
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, X, Target, Info, ShieldCheck, Paperclip, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { generateChatResponse } from '../services/gemini';
import { Message, User as UserType, Project, ArtifactData, ProjectFile } from '../types';
import { SimpleMarkdown } from '../components/Markdown';
import { ArtifactRenderer } from '../components/Artifacts';
import { Button } from '../components/UI';

export const ChatPanel: React.FC<{ user: UserType, project?: Project, externalTrigger?: string }> = ({ user, project, externalTrigger }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<ProjectFile[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalTrigger && messages.length === 0) {
      handleSend(externalTrigger);
    }
  }, [externalTrigger]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          id: `att-${Date.now()}-${i}`,
          name: file.name,
          type: file.name.split('.').pop() || 'file',
          size: (file.size / 1024).toFixed(0) + 'KB',
          mimeType: file.type,
          content: content
        });
      }
      setAttachments(prev => [...prev, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const resilientJSONParse = (jsonStr: string): any => {
    try {
        let cleaned = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
        cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
        if (cleaned.split('"').length % 2 === 0 && !cleaned.endsWith('"')) {
            cleaned += '"';
        }
        return JSON.parse(cleaned);
    } catch (e) {
        try {
            let temp = jsonStr.trim();
            const openBraces = (temp.match(/{/g) || []).length;
            const closeBraces = (temp.match(/}/g) || []).length;
            if (openBraces > closeBraces) temp += "}".repeat(openBraces - closeBraces);
            return JSON.parse(temp.replace(/,\s*([\]}])/g, '$1'));
        } catch (e2) {
            return null;
        }
    }
  };

  const parseArtifact = (text: string): { cleanText: string, artifact: ArtifactData | null } => {
    const marker = "ARTIFACT:";
    const markerIndex = text.lastIndexOf(marker);
    
    if (markerIndex !== -1) {
      const jsonCandidate = text.substring(markerIndex + marker.length).trim();
      let braceCount = 0;
      let startIndex = -1;
      let endIndex = -1;

      for (let i = 0; i < jsonCandidate.length; i++) {
        if (jsonCandidate[i] === '{') {
          if (braceCount === 0) startIndex = i;
          braceCount++;
        } else if (jsonCandidate[i] === '}') {
          braceCount--;
          if (braceCount === 0 && startIndex !== -1) {
            endIndex = i;
            break;
          }
        }
      }

      if (startIndex !== -1 && endIndex !== -1) {
        const jsonStr = jsonCandidate.substring(startIndex, endIndex + 1);
        const artifactData = resilientJSONParse(jsonStr);
        if (artifactData) {
            const cleanText = text.substring(0, markerIndex).trim();
            return { cleanText, artifact: artifactData };
        }
      }
    }
    return { cleanText: text, artifact: null };
  };

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if ((!text.trim() && attachments.length === 0) || loading) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: text, 
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'model', content: '', timestamp: new Date() }]);

    let fullContent = "";
    try {
      // Pass the current message and history to the service.
      // History in the service already handles history truncation.
      const stream = await generateChatResponse([...messages, userMsg], text, user, project);
      for await (const chunk of stream) {
        fullContent += chunk.text;
        const { cleanText, artifact } = parseArtifact(fullContent);
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: cleanText, artifact: artifact || m.artifact } : m));
      }
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: "Neural calibration interrupted. Please re-engage protocol.", isError: true } : m));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative selection:bg-brand-blue/5 selection:text-brand-blue">
      {/* Header */}
      <header className="px-6 lg:px-10 h-20 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
            <Bot size={20} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
               <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Strategy Engine</h2>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Intelligence</p>
          </div>
        </div>
        {project && (
           <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
              <Target size={12} className="text-brand-blue" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest truncate max-w-[150px]">{project.name}</span>
           </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-24 py-10 lg:py-16 scroll-smooth no-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12 pb-10">
          {messages.length === 0 && (
            <div className="py-20 text-center space-y-8 animate-reveal">
              <h3 className="text-5xl lg:text-6xl font-serif text-slate-900 italic font-light tracking-tight leading-tight">
                 Strategic <br/><span className="text-slate-200">Mandate Initiated.</span>
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest">
                Deploying institutional frameworks. <br/>Upload context to begin.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                 {[
                   "Audit rival Q4 movements",
                   "Draft expansion manifesto",
                   "Analyze regional demand",
                   "Map market strike zones"
                 ].map((hint, i) => (
                   <button 
                     key={i} 
                     onClick={() => handleSend(hint)}
                     className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                   >
                     {hint}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex gap-6 animate-reveal ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${m.role === 'user' ? 'bg-white text-slate-300 border-slate-100' : 'bg-slate-900 text-white border-slate-900'}`}>
                {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`flex-1 max-w-2xl space-y-4 ${m.role === 'user' ? 'text-right' : ''}`}>
                <div className={`text-sm lg:text-base leading-relaxed text-left ${m.role === 'user' ? 'text-slate-800 bg-slate-50 p-6 rounded-3xl rounded-tr-none border border-slate-100 inline-block shadow-sm' : 'text-slate-900 font-medium'}`}>
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {m.attachments.map(a => (
                        <div key={a.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                           <FileText size={12} className="text-brand-blue" />
                           <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <SimpleMarkdown>{m.content}</SimpleMarkdown>
                </div>
                {m.artifact && (
                  <div className="mt-6 text-left">
                    <ArtifactRenderer artifact={m.artifact} />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && !messages[messages.length-1]?.content && (
            <div className="flex gap-3 items-center text-brand-blue/40 animate-pulse">
               <Loader2 className="animate-spin" size={14} />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Synthesizing market response...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 lg:px-24 py-6 border-t border-slate-50 bg-white/90 backdrop-blur-xl sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-reveal">
              {attachments.map(a => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-full shadow-lg text-[10px] font-bold group border border-slate-800">
                  <FileText size={12} />
                  <span className="truncate max-w-[120px]">{a.name}</span>
                  <button onClick={() => removeAttachment(a.id)} className="p-0.5 hover:bg-white/20 rounded-full transition-colors">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center gap-4 bg-slate-50 rounded-[2rem] border border-slate-100 p-2 transition-all group focus-within:ring-4 focus-within:ring-brand-blue/5 focus-within:border-brand-blue/20 focus-within:bg-white">
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-white rounded-full transition-all"
              title="Attach context files"
            >
              <Paperclip size={18} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Engage strategy hub..."
              className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none resize-none no-scrollbar font-medium placeholder:text-slate-300"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachments.length === 0) || loading}
              className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-brand-blue disabled:opacity-20 transition-all shadow-xl active:scale-95 shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-6 opacity-30">
            <div className="flex items-center gap-2">
              <ShieldCheck size={10} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Context Isolated</span>
            </div>
            <div className="flex items-center gap-2">
              <Info size={10} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Grounding Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
