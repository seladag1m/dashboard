
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, X, Target, Info, ShieldCheck, Paperclip, FileText, Image as ImageIcon, Trash2, Zap } from 'lucide-react';
import { generateChatResponse } from '../services/gemini';
import { Message, User as UserType, Project, ArtifactData, ProjectFile } from '../types';
import { SimpleMarkdown } from '../components/Markdown';
import { ArtifactRenderer } from '../components/Artifacts';
import { Button, Skeleton } from '../components/UI';

export const ChatPanel: React.FC<{ user: UserType, project?: Project, externalTrigger?: string }> = ({ user, project, externalTrigger }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<ProjectFile[]>([]);
  const [displayContent, setDisplayContent] = useState<Record<string, string>>({});
  const contentBufferRef = useRef<Record<string, string>>({});
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalTrigger && messages.length === 0) {
      handleSend(externalTrigger);
    }
  }, [externalTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, displayContent, loading]);

  useEffect(() => {
    const processBuffers = () => {
      let needsUpdate = false;
      const nextDisplay = { ...displayContent };
      Object.keys(contentBufferRef.current).forEach(id => {
        const fullText = contentBufferRef.current[id];
        const currentText = nextDisplay[id] || "";
        if (currentText.length < fullText.length) {
          const charsToAdd = 5;
          nextDisplay[id] = fullText.substring(0, currentText.length + charsToAdd);
          needsUpdate = true;
        }
      });
      if (needsUpdate) setDisplayContent(nextDisplay);
    };
    const interval = setInterval(processBuffers, 25);
    return () => clearInterval(interval);
  }, [displayContent]);

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
          id: `att-${Date.now()}-${i}`, name: file.name, type: file.name.split('.').pop() || 'file',
          size: (file.size / 1024).toFixed(0) + 'KB', mimeType: file.type, content: content
        });
      }
      setAttachments(prev => [...prev, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => setAttachments(prev => prev.filter(a => a.id !== id));

  const resilientJSONParse = (jsonStr: string): any => {
    try {
        let cleaned = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
        cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(cleaned);
    } catch (e) { return null; }
  };

  const parseArtifact = (text: string): { cleanText: string, artifact: ArtifactData | null } => {
    const marker = "ARTIFACT:";
    const markerIndex = text.lastIndexOf(marker);
    if (markerIndex !== -1) {
      const jsonCandidate = text.substring(markerIndex + marker.length).trim();
      const artifactData = resilientJSONParse(jsonCandidate);
      if (artifactData) {
          const cleanText = text.substring(0, markerIndex).trim();
          return { cleanText, artifact: artifactData };
      }
    }
    return { cleanText: text, artifact: null };
  };

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if ((!text.trim() && attachments.length === 0) || loading) return;
    const userMsg: Message = { 
      id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setAttachments([]); setLoading(true);
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'model', content: '', timestamp: new Date().toISOString() }]);
    let fullContent = "";
    try {
      const stream = await generateChatResponse([...messages, userMsg], text, user, project);
      for await (const chunk of stream) {
        fullContent += chunk.text;
        const { cleanText, artifact } = parseArtifact(fullContent);
        contentBufferRef.current[aiMsgId] = cleanText;
        if (artifact) setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, artifact: artifact } : m));
      }
    } catch (e) {
      contentBufferRef.current[aiMsgId] = "Protocol interrupted. Resetting session.";
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isError: true } : m));
    } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative selection:bg-[#246BFD] selection:text-white">
      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-48 py-32 scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-20 pb-32">
          {messages.length === 0 && (
            <div className="py-24 text-center space-y-12 animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-6xl font-bold text-slate-950 tracking-tighter italic">Strategic <br/><span className="text-slate-200">Mandate.</span></h3>
                <p className="text-lg text-slate-500 font-medium italic opacity-60">"Initialize oversight for {project?.name || 'Institutional Domain'}"</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                 {["Audit rival movements", "Expansion protocol", "Analyze demand"].map((hint, i) => (
                   <button key={i} onClick={() => handleSend(hint)} className="px-6 py-2 rounded-xl bg-white border border-[#F1F5F9] text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:border-slate-950 hover:text-slate-950 transition-all">
                     {hint}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isLatestModelMsg = m.role === 'model' && (loading || (displayContent[m.id]?.length < (contentBufferRef.current[m.id]?.length || 0)));
            const contentToRender = m.role === 'user' ? m.content : (displayContent[m.id] || "");
            const isTypingComplete = m.role === 'model' && contentToRender.length > 0 && contentToRender.length === (contentBufferRef.current[m.id]?.length || 0);

            return (
              <div key={m.id} className={`flex gap-12 animate-reveal ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${m.role === 'user' ? 'bg-white text-slate-200 border-[#F1F5F9]' : 'bg-slate-950 text-white border-slate-950 shadow-lg'}`}>
                  {m.role === 'user' ? <User size={14} /> : <Zap size={14} />}
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    {m.role === 'user' ? (
                      <p className="text-2xl font-bold text-slate-950 tracking-tight italic leading-relaxed">"{m.content}"</p>
                    ) : (
                      <div className="space-y-10 ai-briefing">
                        <SimpleMarkdown isStreaming={isLatestModelMsg}>{contentToRender}</SimpleMarkdown>
                      </div>
                    )}
                    {m.role === 'model' && !contentToRender && loading && <Skeleton height="100px" className="rounded-2xl" />}
                  </div>
                  {m.artifact && isTypingComplete && (
                    <div className="mt-12 animate-fade-in">
                      <ArtifactRenderer artifact={m.artifact} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Module */}
      <div className="p-12 border-t border-[#F1F5F9] bg-white">
        <div className="max-w-4xl mx-auto">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
              {attachments.map(a => (
                <div key={a.id} className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest group">
                  <FileText size={12} />
                  <span className="truncate max-w-[150px]">{a.name}</span>
                  <button onClick={() => removeAttachment(a.id)} className="p-1 hover:bg-white/20 rounded-full transition-all"><X size={10} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center gap-4 bg-white rounded-2xl border border-[#F1F5F9] px-6 py-4 focus-within:border-slate-300 shadow-premium transition-all">
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-300 hover:text-slate-950 transition-all"><Paperclip size={18} /></button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Inquire with institutional mandate hub..."
              className="flex-1 bg-transparent border-none py-2 text-sm focus:outline-none resize-none no-scrollbar font-medium"
              rows={1}
            />
            <button onClick={() => handleSend()} disabled={(!input.trim() && attachments.length === 0) || loading} className="w-10 h-10 flex items-center justify-center bg-slate-950 text-white rounded-xl hover:bg-brand-blue disabled:opacity-20 transition-all">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
