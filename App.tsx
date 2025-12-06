
import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/Landing';
import { AppRoute, User } from './types';
import { db } from './services/database';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Session
  useEffect(() => {
    const session = db.auth.getSession();
    if (session) {
      setUser(session);
      setRoute(AppRoute.CHAT); // We keep the route enum as CHAT but render Dashboard
    } else {
      setRoute(AppRoute.LOGIN); 
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setRoute(AppRoute.CHAT);
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 animate-pulse flex items-center justify-center shadow-lg shadow-blue-500/30">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
          </div>
          <p className="text-zinc-400 text-sm font-medium tracking-wide animate-pulse">Initializing Consult AI...</p>
        </div>
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
      onUpdateUser={handleUpdateUser} 
    />
  );
};

export default App;
