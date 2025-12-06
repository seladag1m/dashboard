import React from 'react';

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-text-headline">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const SimpleMarkdown = ({ children }: { children?: React.ReactNode }) => {
  if (typeof children !== 'string') return null;
  const lines = children.split('\n');
  
  return (
    <div className="space-y-3 text-sm text-text-primary leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2"></div>;

        // Headers
        if (trimmed.startsWith('### ')) return <h3 key={i} className="text-sm font-bold mt-4 mb-2 text-text-headline uppercase tracking-wide">{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="text-lg font-serif font-bold mt-6 mb-3 text-text-headline">{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={i} className="text-xl font-serif font-bold mt-6 mb-4 text-text-headline border-b border-bg-neutral pb-2">{trimmed.slice(2)}</h1>;
        
        // Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
           return (
             <div key={i} className="flex gap-3 ml-1 group">
               <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0 group-hover:scale-125 transition-transform"></span>
               <span className="text-text-secondary">{parseBold(trimmed.slice(2))}</span>
             </div>
           );
        }

        // Ordered Lists (Simple check for "1. ")
        if (/^\d+\.\s/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s/, '');
          const num = trimmed.match(/^\d+/)?.[0];
          return (
             <div key={i} className="flex gap-3 ml-1">
               <span className="font-mono font-bold text-accent text-xs mt-0.5">{num}.</span>
               <span className="text-text-secondary">{parseBold(content)}</span>
             </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <div key={i} className="border-l-4 border-accent bg-bg-soft pl-4 py-2 my-2 italic text-text-secondary rounded-r-lg">
              {parseBold(trimmed.slice(2))}
            </div>
          );
        }

        // Paragraphs
        return <p key={i}>{parseBold(line)}</p>;
      })}
    </div>
  );
};