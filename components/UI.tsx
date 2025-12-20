
import React from 'react';
import { LucideIcon, Loader2, Search, X, ChevronDown } from 'lucide-react';

export const Button: React.FC<any> = ({ children, variant = 'primary', size = 'md', icon: Icon, isLoading, fullWidth, className = '', ...props }) => {
  const base = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 select-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[#246BFD] text-white hover:bg-[#1B54D8] shadow-lg shadow-blue-500/10",
    secondary: "bg-[#0F172A] text-white hover:bg-black",
    outline: "bg-white text-slate-700 border border-slate-200 hover:border-blue-500 hover:text-blue-500",
    ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    white: "bg-white text-[#0F172A] hover:bg-slate-50 border border-slate-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-xl gap-2",
    md: "px-6 py-3 text-sm rounded-2xl gap-2",
    lg: "px-8 py-4 text-base rounded-3xl gap-3",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (
        <>
          {Icon && <Icon className="w-4 h-4" strokeWidth={2.5} />}
          {children}
        </>
      )}
    </button>
  );
};

export const Card: React.FC<any> = ({ children, title, className = '', headerAction, noPadding }) => (
  <div className={`bg-white rounded-[2rem] border border-slate-100/50 shadow-premium overflow-hidden ${className}`}>
    {(title || headerAction) && (
      <div className="px-8 py-6 flex items-center justify-between">
        {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
        {headerAction}
      </div>
    )}
    <div className={noPadding ? '' : 'px-8 pb-8 pt-0'}>{children}</div>
  </div>
);

export const Logo: React.FC<any> = ({ light, collapsed }) => (
  <div className={`flex items-center gap-3 select-none ${light ? 'text-white' : 'text-slate-900'}`}>
    <div className={`w-9 h-9 flex items-center justify-center rounded-2xl ${light ? 'bg-white text-slate-900' : 'bg-[#246BFD] text-white'}`}>
      <div className="w-4 h-4 rotate-45 border-2 border-current rounded-sm"></div>
    </div>
    {!collapsed && (
      <span className="text-xl font-bold tracking-tight">Consult<span className="text-[#246BFD]">AI</span></span>
    )}
  </div>
);

export const GlobalSearch: React.FC = () => (
  <div className="relative w-full max-w-xl">
    <input 
      type="text" 
      placeholder="Search task, competitors, or signals..." 
      className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm placeholder:text-slate-400"
    />
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
      <kbd className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] text-slate-400 font-bold">⌘</kbd>
      <kbd className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] text-slate-400 font-bold">F</kbd>
    </div>
  </div>
);

// Input component added to resolve export errors in Auth.tsx, Modules.tsx, and Projects.tsx
export const Input: React.FC<any> = ({ label, subtle, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{label}</label>}
    <input 
      className={`w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-sm ${subtle ? 'bg-slate-50/50 border-transparent' : ''} ${className}`}
      {...props}
    />
  </div>
);

// Select component added to resolve export errors in Auth.tsx, Modules.tsx, and Projects.tsx
export const Select: React.FC<any> = ({ label, options, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer pr-10 ${className}`}
        {...props}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);

// AbstractGraphic component added to resolve export errors in Auth.tsx
export const AbstractGraphic: React.FC<any> = ({ variant, className = '' }) => {
  if (variant === 'waves') {
    return (
      <svg className={className} viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 300C200 200 400 400 600 300C800 200 1000 400 1200 300" stroke="currentColor" strokeWidth="2" />
        <path d="M0 400C200 300 400 500 600 400C800 300 1000 500 1200 400" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      </svg>
    );
  }
  if (variant === 'mesh') {
    return (
      <div className={`absolute inset-0 opacity-10 ${className}`} style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    );
  }
  return null;
};

// Modal component added to resolve export errors in Projects.tsx
export const Modal: React.FC<any> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 relative z-10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
