import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Explicitly extending Component with generics to ensure this.props is correctly typed and accessible
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical System Interruption:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-[#F8FAFC] font-sans p-6">
          <div className="p-16 bg-white rounded-[3rem] shadow-premium border border-slate-100 max-w-md text-center space-y-8 animate-reveal">
            <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl">
              <span className="text-2xl font-bold">!</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-serif font-bold text-slate-900 italic">Session Interrupted.</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                A rendering conflict or network obstruction occurred. Institutional data integrity remains protected.
              </p>
              {this.state.error && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-[10px] font-mono text-slate-400 text-left overflow-auto max-h-40 border border-slate-100">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-black transition-all active:scale-95 shadow-lg"
            >
              Resume Session
            </button>
          </div>
        </div>
      );
    }
    // Correctly accessing children from the props object inherited from Component
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}