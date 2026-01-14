
import React from 'react';
import { LucideIcon, Loader2, ChevronDown, X } from 'lucide-react';

export const Button: React.FC<any> = ({ children, variant = 'primary', size = 'md', icon: Icon, isLoading, fullWidth, className = '', ...props }) => {
  const base = "inline-flex items-center justify-center font-inter font-medium transition-subtle focus:outline-none disabled:opacity-50 select-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[#0F172A] text-white hover:bg-black",
    action: "bg-[#246BFD] text-white hover:bg-[#1B54D8]",
    outline: "bg-white text-slate-700 border border-[#F1F5F9] hover:border-slate-300",
    ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
    white: "bg-white text-[#0F172A] hover:bg-slate-50 border border-[#F1F5F9]",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
  };

  const sizes = {
    sm: "px-4 py-2 text-[11px] rounded-xl gap-2 tracking-wide uppercase font-bold",
    md: "px-6 py-3 text-xs rounded-2xl gap-2 tracking-wide uppercase font-bold",
    lg: "px-8 py-4 text-sm rounded-3xl gap-3 tracking-wide uppercase font-bold",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
        <>
          {Icon && <Icon className="w-4 h-4" strokeWidth={2.5} />}
          {children}
        </>
      )}
    </button>
  );
};

export const Card: React.FC<any> = ({ children, title, className = '', headerAction, noPadding }) => (
  <div className={`bg-white rounded-[24px] border border-[#F1F5F9] shadow-premium transition-subtle ${className}`}>
    {(title || headerAction) && (
      <div className="px-8 py-6 flex items-center justify-between border-b border-[#F1F5F9]/50">
        {title && <h3 className="text-xs font-bold text-slate-950 uppercase tracking-[0.2em]">{title}</h3>}
        {headerAction}
      </div>
    )}
    <div className={noPadding ? '' : 'px-8 py-8'}>{children}</div>
  </div>
);

export const Logo: React.FC<any> = ({ light, collapsed, className = '' }) => (
  <div className={`flex items-center gap-3 select-none transition-subtle ${className}`}>
    <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${light ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'}`}>
       <div className="w-3 h-3 rotate-45 border-[2px] border-current rounded-sm"></div>
    </div>
    {!collapsed && (
      <span className={`text-sm font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-subtle ${light ? 'text-white' : 'text-slate-950'}`}>
        Consult<span className="text-[#246BFD]">AI</span>
      </span>
    )}
  </div>
);

export const Input: React.FC<any> = ({ label, subtle, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>}
    <input 
      className={`w-full h-12 px-6 rounded-2xl border border-[#F1F5F9] bg-white focus:border-slate-300 outline-none transition-subtle placeholder:text-slate-300 text-sm font-medium ${subtle ? 'bg-slate-50 border-transparent' : ''} ${className}`}
      {...props}
    />
  </div>
);

// Added Select component to fix reference errors in Auth and Projects
export const Select: React.FC<any> = ({ label, options, value, onChange, className = '' }) => (
  <div className="w-full">
    {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full h-12 px-6 rounded-2xl border border-[#F1F5F9] bg-white focus:border-slate-300 outline-none appearance-none transition-subtle text-sm font-medium pr-12 ${className}`}
        value={value}
        onChange={onChange}
      >
        {options.map((opt: any) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
    </div>
  </div>
);

export const Modal: React.FC<any> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-[32px] w-full max-w-2xl p-12 relative z-10 border border-[#F1F5F9] animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-10 sticky top-0 bg-white z-10 pb-2">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-subtle text-slate-300 hover:text-slate-950">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string, width?: string, height?: string }> = ({ className = '', width, height }) => (
  <div className={`bg-slate-50 animate-pulse rounded-2xl ${className}`} style={{ width, height }}></div>
);
