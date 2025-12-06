
import React, { useState } from 'react';
import { LucideIcon, X, Check, Loader2, Eye, EyeOff } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', icon: Icon, isLoading, fullWidth, className = '', ...props 
}) => {
  // Micro-interactions: translateY on hover, active compress
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] active:translate-y-0 relative overflow-hidden transform hover:-translate-y-px";
  
  const variants = {
    // Bright Consult Blue (#296CFF) -> Deep Indigo Blue (#0B3CBA)
    primary: "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 border border-transparent",
    accent: "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 border border-transparent",
    // White background, Navy border
    secondary: "bg-white text-text-primary border border-bg-neutral hover:border-text-secondary hover:shadow-md shadow-sm",
    // Outline
    outline: "bg-transparent border border-bg-neutral text-text-secondary hover:text-accent hover:border-accent hover:bg-accent-light/50",
    // Ghost
    ghost: "text-text-secondary hover:bg-bg-soft hover:text-text-primary shadow-none hover:shadow-none translate-y-0 hover:translate-y-0",
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs rounded-lg",
    sm: "px-4 py-2 text-xs rounded-xl",
    md: "px-5 py-3 text-sm rounded-xl", // 12px radius
    lg: "px-8 py-4 text-base rounded-2xl", // 16px radius
    icon: "p-2.5 aspect-square rounded-xl",
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        <>
          {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2.5' : ''}`} strokeWidth={2} />}
          {children}
        </>
      )}
    </button>
  );
};

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  subtle?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, subtle, className = '', type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide ml-1">{label}</label>}
      <div className="relative group">
        {/* Input Container */}
        <div className={`relative flex items-center px-4 ${subtle ? 'h-10' : 'h-12'} bg-white rounded-xl border border-bg-neutral transition-all duration-200 shadow-input group-focus-within:border-accent group-focus-within:shadow-glow`}>
          {Icon && (
            <Icon className="w-5 h-5 mr-3 text-text-light group-focus-within:text-accent transition-colors" />
          )}
          
          <input
            className={`block w-full h-full bg-transparent text-sm text-text-primary placeholder-text-light focus:outline-none ${className}`}
            type={inputType}
            {...props}
          />

          {isPassword && (
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-text-light hover:text-text-secondary focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-error pl-1 animate-fade-in">{error}</p>}
    </div>
  );
};

// --- SELECT ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => (
  <div className="w-full space-y-2">
    {label && <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide ml-1">{label}</label>}
    <div className="relative group">
      <select
        className={`block w-full rounded-xl border bg-white py-3.5 pl-4 pr-10 text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-glow transition-all shadow-input appearance-none ${error ? 'border-error' : 'border-bg-neutral'} ${className}`}
        {...props}
      >
        <option value="" disabled selected>Select an option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-light group-focus-within:text-accent">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
    {error && <p className="text-xs text-error pl-1">{error}</p>}
  </div>
);

// --- LOGO ---
export const Logo: React.FC<{ collapsed?: boolean; light?: boolean }> = ({ collapsed, light }) => (
  <div className={`flex items-center gap-3 select-none ${light ? 'text-white' : 'text-text-headline'}`}>
    <div className={`relative flex items-center justify-center transition-all ${collapsed ? 'w-8 h-8' : 'w-9 h-9'}`}>
      <div className="relative w-full h-full bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    </div>
    {!collapsed && (
      <span className="font-serif text-xl font-bold tracking-tight">
        CONSULT <span className="font-sans text-[10px] font-bold text-accent uppercase tracking-widest ml-1 inline-block bg-accent-light px-1.5 py-0.5 rounded-md">AI</span>
      </span>
    )}
  </div>
);

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-bg-neutral">
        {title && (
          <div className="px-8 py-6 border-b border-bg-soft flex justify-between items-center bg-white">
            <h3 className="text-lg font-bold text-text-headline">{title}</h3>
            <button onClick={onClose} className="text-text-light hover:text-text-primary transition-colors p-2 rounded-full hover:bg-bg-soft">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-0 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// --- CARD ---
// Updated to be flex flex-col so internal charts can take full height
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-2xl border border-bg-neutral shadow-card hover:shadow-soft transition-all duration-300 flex flex-col ${className}`}>
    {(title || action) && (
      <div className="px-6 py-5 border-b border-bg-soft flex justify-between items-center shrink-0">
        {title && <h3 className="font-semibold text-text-primary text-base">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6 md:p-8 flex-1 min-h-0 relative">{children}</div>
  </div>
);
