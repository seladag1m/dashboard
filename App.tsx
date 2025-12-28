
import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/Landing';
import { AppRoute, User } from './types';
import { db } from './services/database';
import { Logo } from './components/UI';
import { ShieldCheck, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Session
  useEffect(() => {
    const init = async () => {
      try {
        const session = db.auth.getSession();
        
        // Clean up legacy sessions without mandatory DNA context
        if (session && (!session.dna || !session.dna.industry)) {
          console.warn("Legacy session detected. Clearing to refresh Business DNA.");
          await db.auth.logout();
          setRoute(AppRoute.LOGIN);
          return;
        }

        if (session) {
          setUser(session);
          setRoute(AppRoute.DASHBOARD); // Corrected to use DASHBOARD instead of CHAT
        } else {
          setRoute(AppRoute.LOGIN);
        }
      } catch (e) {
        console.error("Session init error", e);
      } finally {
        setTimeout(() => setIsInitializing(false), 800);
      }
    };
    init();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setRoute(AppRoute.DASHBOARD); // Corrected to use DASHBOARD
  };

  const handleLogout = async () => {
    await db.auth.logout();
    setUser(null);
    setRoute(AppRoute.LOGIN);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    db.auth.setSession(updatedUser);
  };

  const handleNavigate = (newRoute: AppRoute) => {
     setRoute(newRoute);
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="scale-125 mb-12 animate-reveal">
           <Logo collapsed />
        </div>
        <div className="flex flex-col items-center gap-6 animate-pulse">
           <div className="flex items-center gap-3 text-brand-blue">
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Restoring Strategic Context</span>
           </div>
           <div className="w-64 h-1 bg-slate-50 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-brand-blue/10"></div>
              <div className="h-full bg-brand-blue animate-[loading_1.5s_ease-in-out_infinite] w-1/3 rounded-full shadow-lg shadow-blue-500/50"></div>
           </div>
           <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Institutional DNA Verification In Progress...</p>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  // Router Logic
  if (!user) {
    if (route === AppRoute.REGISTER) return <AuthPage type="register" onNavigate={handleNavigate} onLogin={handleLogin} />;
    if (route === AppRoute.LOGIN) return <AuthPage type="login" onNavigate={handleNavigate} onLogin={handleLogin} />;
    return <LandingPage onNavigate={handleNavigate} />;
  }

  // Authenticated View
  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
    />
  );
};

export default App;
