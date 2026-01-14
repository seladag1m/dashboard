
import React from 'react';

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-950">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const SimpleMarkdown = ({ children, isStreaming }: { children?: React.ReactNode, isStreaming?: boolean }) => {
  if (typeof children !== 'string') return null;
  const lines = children.split('\n');
  
  const isHeader = (text: string) => {
    const keywords = ['CONCLUSION', 'RECOMMENDATION', 'STRATEGIC MOVE', 'NEXT STEPS', 'SUMMARY', 'KEY INSIGHT', 'ANALYSIS'];
    return keywords.some(k => text.toUpperCase().includes(k));
  };

  return (
    <div className={`space-y-6 text-sm text-slate-600 leading-relaxed font-inter ${isStreaming ? 'streaming-cursor' : ''}`}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2"></div>;

        const isSpecial = isHeader(trimmed);
        const style = { animationDelay: `${Math.min(i * 0.05, 1)}s` };

        let content;

        if (trimmed.startsWith('### ')) {
          content = <h3 className="text-[10px] font-bold mt-8 mb-4 text-slate-950 uppercase tracking-[0.25em] border-b border-[#F1F5F9] pb-2">{trimmed.slice(4)}</h3>;
        } else if (trimmed.startsWith('## ')) {
          content = <h2 className="text-sm font-bold mt-10 mb-5 text-slate-950 uppercase tracking-[0.1em]">{trimmed.slice(3)}</h2>;
        } else if (trimmed.startsWith('# ')) {
          content = <h1 className="text-lg font-bold mt-12 mb-6 text-slate-950 tracking-tight">{trimmed.slice(2)}</h1>;
        }
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
           content = (
             <div className="flex gap-4 ml-1 group text-left">
               <span className="mt-2 w-1 h-1 rounded-full bg-[#246BFD] shrink-0"></span>
               <span className="text-slate-600 font-medium">{parseBold(trimmed.slice(2))}</span>
             </div>
           );
        }
        else if (trimmed.startsWith('> ')) {
          content = (
            <div className="border-l-2 border-[#246BFD] bg-[#F8FAFC] px-8 py-6 my-6 italic text-slate-700 font-medium text-left">
              {parseBold(trimmed.slice(2))}
            </div>
          );
        }
        else {
          content = <p className={`text-left ${isSpecial ? 'font-bold text-slate-950 tracking-tight' : ''}`}>{parseBold(line)}</p>;
        }

        return (
          <div key={i} className="animate-reveal" style={style}>
            {content}
          </div>
        );
      })}
    </div>
  );
};
