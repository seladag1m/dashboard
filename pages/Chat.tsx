
import React, { useState, useRef, useEffect } from 'react';
import { SimpleMarkdown } from '../components/Markdown';
import { 
  Send, BrainCircuit, Loader2, RotateCcw, Zap, X, Sparkles, Paperclip, 
  Image as ImageIcon, FileText
} from 'lucide-react';
import { Logo } from '../components/UI';
import { generateChatResponse, generateMarketingImage } from '../services/gemini';
import { Message, User, ArtifactData, PersonalizationSettings, ChatSession } from '../types';
import { ArtifactRenderer } from '../components/Artifacts';
import { db } from '../services/database';

// Simplified props for the panel
interface ChatPanelProps {
  user: User;
  onUpdateUser?: (user: User) => void;
  language: string;
  className?: string;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  externalTrigger?: string | null;
  onTriggerHandled?: () => void;
}

const SUGGESTIONS = [
  "Analyze current market risks",
  "Develop a digital transformation roadmap",
  "Create a SWOT analysis",
  "Draft a product launch framework"
];

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({ base64: base64Data, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  user, 
  language, 
  className = '', 
  isCollapsed, 
  toggleCollapse,
  externalTrigger,
  onTriggerHandled 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => Date.now().toString());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Attachments
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Layout Controls
  const [useThinking, setUseThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isChatEmpty = messages.length === 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isChatEmpty) {
      scrollToBottom();
    }
  }, [messages, isLoading, isChatEmpty, isCollapsed]);

  // --- DATABASE INTEGRATION ---
  
  // Load History on Mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const latest = await db.chats.getLatest(user.id);
        if (latest) {
          setMessages(latest.messages);
          setSessionId(latest.id);
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    };
    loadHistory();
  }, [user.id]);

  // Save History on Update
  useEffect(() => {
    if (messages.length === 0) return;

    const saveSession = async () => {
      const firstMsg = messages.find(m => m.role === 'user');
      const title = firstMsg 
        ? (firstMsg.content.length > 40 ? firstMsg.content.substring(0, 40) + '...' : firstMsg.content)
        : 'New Session';

      const session: ChatSession = {
        id: sessionId,
        title,
        messages,
        lastModified: Date.now()
      };
      
      await db.chats.save(user.id, session);
    };

    const timeout = setTimeout(saveSession, 1000); 
    return () => clearTimeout(timeout);
  }, [messages, sessionId, user.id]);

  // Handle external triggers from dashboard modules
  useEffect(() => {
    if (externalTrigger && !isLoading) {
      handleSend(externalTrigger);
      if (onTriggerHandled) onTriggerHandled();
    }
  }, [externalTrigger]);

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(Date.now().toString());
    setInput('');
    setAttachment(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Logic
  const parseMessageContent = (content: string): { cleanText: string, artifact: ArtifactData | undefined } => {
    const widgetRegex = /```json-widget\s*([\s\S]*?)\s*```/;
    const match = content.match(widgetRegex);
    
    if (match) {
      try {
        const jsonStr = match[1];
        const artifact = JSON.parse(jsonStr) as ArtifactData;
        const cleanText = content.replace(match[0], '').trim();
        return { cleanText, artifact };
      } catch (e) {
        console.error("Widget Parse Error", e);
      }
    }
    return { cleanText: content, artifact: undefined };
  };

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !attachment) || isLoading) return;
    
    let imageData: { base64: string, mimeType: string } | undefined;
    if (attachment) {
       try {
         imageData = await fileToGenerativePart(attachment);
       } catch (e) {
         console.error("Failed to read file", e);
       }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    // If attachment, visually append it to message (mock) or store metadata
    if (attachment) {
       userMsg.content = `[Attached: ${attachment.name}] ${text}`;
    }

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null); // Clear attachment
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'model',
      content: '',
      timestamp: new Date()
    }]);

    try {
      const stream = await generateChatResponse(
        messages.concat(userMsg), 
        text, 
        user, 
        undefined, // Context snapshot
        useThinking,
        language,
        imageData // Pass image data if present
      );
      
      let fullText = '';
      let currentArtifact: ArtifactData | undefined;

      for await (const chunk of stream) {
         if (chunk.text === "###API_KEY_MISSING###") {
             fullText = "⚠️ System Config Error: API Key missing.";
         } else {
             fullText += chunk.text;
         }
        
        const { cleanText, artifact } = parseMessageContent(fullText);
        if (artifact) currentArtifact = artifact;

        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId 
            ? { 
                ...msg, 
                content: cleanText, 
                artifact: currentArtifact,
                groundingMetadata: chunk.groundingMetadata || msg.groundingMetadata,
              } 
            : msg
        ));
      }

      if (currentArtifact && currentArtifact.type === 'image_request') {
        const base64 = await generateMarketingImage(currentArtifact.data.prompt);
        if (base64) {
          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? {
             ...msg, artifact: { type: 'image', title: 'Generated Visual', data: { ...currentArtifact!.data, base64 } }
          } : msg));
        }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white relative ${className}`}>
      
      {/* 1. Header with Depth */}
      <div className="h-20 px-6 border-b border-bg-neutral/50 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-blue-600 flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Sparkles size={18} fill="currentColor" />
           </div>
           <div>
              <h3 className="font-bold text-base text-text-headline leading-none flex items-center gap-2">
                 AI Advisor
                 <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-[10px] font-bold uppercase tracking-wider">Pro</span>
              </h3>
              <p className="text-xs text-text-secondary font-medium mt-1">Strategic Consultant • Online</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
              onClick={handleNewSession}
              className="p-2.5 text-text-secondary hover:text-text-primary rounded-xl hover:bg-bg-soft transition-colors"
              title="New Session"
           >
              <RotateCcw size={18} />
           </button>
           <button 
             onClick={() => setUseThinking(!useThinking)}
             className={`p-2.5 rounded-xl transition-all border border-transparent ${useThinking ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'text-text-secondary hover:bg-bg-soft'}`}
             title="Toggle Deep Reasoning"
           >
             <BrainCircuit size={18} />
           </button>
        </div>
      </div>

      {/* 2. Messages Area */}
      {/* Added pb-36 to prevent floating input from covering messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-10 bg-[#F8F9FC] pb-36">
        {isChatEmpty && (
           <div className="mt-12 sm:mt-20 text-center animate-fade-in px-4">
              <div className="inline-block p-6 rounded-3xl bg-white shadow-float border border-white/60 ring-1 ring-bg-neutral mb-8">
                 <Logo collapsed />
              </div>
              <h4 className="text-2xl font-serif font-bold text-text-headline mb-3">How can I help you strategize?</h4>
              <p className="text-text-secondary text-base mb-10 max-w-lg mx-auto leading-relaxed">
                 I can analyze market trends, review uploaded documents, or generate strategic frameworks for {user.companyName}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                 {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => handleSend(s)} className="text-left text-sm p-5 bg-white border border-bg-neutral/60 rounded-2xl hover:border-accent hover:shadow-lg hover:-translate-y-0.5 transition-all text-text-secondary hover:text-text-primary group">
                       <span className="block mb-1 group-hover:text-accent transition-colors"><Zap size={16}/></span>
                       {s}
                    </button>
                 ))}
              </div>
           </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex flex-col animate-slide-up w-full max-w-4xl mx-auto group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-6 text-sm leading-7 shadow-sm relative z-10 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-accent to-blue-700 text-white rounded-br-none shadow-md shadow-accent/20' 
                : 'bg-white border border-bg-neutral text-text-primary rounded-tl-none shadow-soft'
            }`}>
              <SimpleMarkdown>{msg.content}</SimpleMarkdown>
            </div>
            
            <div className={`mt-2 text-[10px] font-medium text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>

            {msg.artifact && (
               <div className="mt-6 w-full max-w-[95%]">
                  <ArtifactRenderer artifact={msg.artifact} />
               </div>
            )}
          </div>
        ))}
        
        {isLoading && (
           <div className="flex items-center gap-4 text-text-secondary text-xs animate-pulse ml-2 max-w-4xl mx-auto bg-white/50 px-4 py-3 rounded-full w-fit">
              <div className="flex gap-1.5">
                 <span className="w-2 h-2 bg-accent rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-accent rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150"></span>
              </div>
              <span className="font-medium tracking-wide">Analyzing data streams...</span>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Floating Input Bar (Next Level UI) */}
      <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-8 z-30">
         <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/50 shadow-float ring-1 ring-black/5 p-2 transition-all duration-300 focus-within:shadow-2xl focus-within:ring-accent/20">
            
            {/* Attachment Preview */}
            {attachment && (
               <div className="px-4 pt-3 pb-1 flex items-center gap-3 animate-slide-up">
                  <div className="relative group">
                     <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-500">
                        {attachment.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                     </div>
                     <button 
                        onClick={removeAttachment}
                        className="absolute -top-1.5 -right-1.5 bg-zinc-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                     >
                        <X size={10} />
                     </button>
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-bold text-text-primary truncate">{attachment.name}</p>
                     <p className="text-[10px] text-text-light uppercase tracking-wider">{(attachment.size / 1024).toFixed(0)}KB</p>
                  </div>
               </div>
            )}

            <div className="flex items-end gap-2">
               <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileSelect} 
                  accept="image/*,.pdf,.txt"
               />
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3.5 mb-1 rounded-full transition-all ${attachment ? 'bg-accent/10 text-accent' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'}`}
                  title="Attach file"
               >
                  <Paperclip size={20} strokeWidth={2.5} />
               </button>
               
               <textarea
                 ref={textareaRef}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                   }
                 }}
                 placeholder="Type a message or drag a file..."
                 className="flex-1 bg-transparent border-0 py-4 text-sm text-text-primary placeholder-zinc-400 focus:ring-0 resize-none max-h-32 min-h-[56px] leading-relaxed"
                 rows={1}
               />
               
               <button 
                 onClick={() => handleSend()}
                 disabled={(!input.trim() && !attachment) || isLoading}
                 className="p-3.5 mb-1 bg-accent text-white rounded-full shadow-lg shadow-accent/30 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all duration-200"
               >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} fill="currentColor" className="ml-0.5" />}
               </button>
            </div>
         </div>
         <p className="text-center text-[10px] text-zinc-400 font-medium mt-3 drop-shadow-sm">
            AI can make mistakes. Review generated insights.
         </p>
      </div>
    </div>
  );
};
