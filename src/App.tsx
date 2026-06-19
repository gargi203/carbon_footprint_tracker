import React, { useState } from 'react';
import { EcoTrackProvider, useEcoTrack } from './context/EcoTrackContext';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Goals } from './pages/Goals';
import { Challenges } from './pages/Challenges';
import { History } from './pages/History';
import ecotrackLogo from './assets/logo.png';
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  Compass, 
  Menu, 
  X, 
  RefreshCw, 
  RotateCcw,
  LogOut,
  User
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    currentUser, 
    userProfile, 
    logout, 
    resetApp 
  } = useEcoTrack();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Gate the app behind authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <header className="glass-panel sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-gray-200/20 dark:border-gray-800/40">
          <div className="flex items-center gap-3">
            <img 
              src={ecotrackLogo} 
              alt="EcoTrack AI brand logo showing leaf node" 
              className="w-10 h-10 rounded-xl shadow-md border border-gray-250/20"
            />
            <div>
              <span className="font-extrabold font-display text-lg tracking-tight text-gray-800 dark:text-white block">EcoTrack AI</span>
              <span className="text-[10px] text-eco-600 dark:text-eco-400 font-bold tracking-wider uppercase block">Sustainability Copilot</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-start">
          <Login />
        </main>

        <footer className="w-full glass-panel border-t border-gray-200/20 dark:border-gray-800/40 py-8 px-6 text-center text-xs text-gray-500 space-y-2.5 mt-8">
          <p className="font-semibold text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} EcoTrack AI. Empowering sustainable habit tracking.</p>
          <p className="max-w-md mx-auto leading-relaxed">
            Calculations are based on average carbon output models from the EPA and carbon offset guides. Recommendations do not guarantee physical utility outcomes, but serve as general instructions.
          </p>
        </footer>
      </div>
    );
  }

  // 2. If user hasn't completed onboarding, render onboarding inside the standard shell
  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <header className="glass-panel sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-gray-200/20 dark:border-gray-800/40">
          <div className="flex items-center gap-3">
            <img 
              src={ecotrackLogo} 
              alt="EcoTrack AI brand logo showing leaf node" 
              className="w-10 h-10 rounded-xl shadow-md border border-gray-250/20"
            />
            <div>
              <span className="font-extrabold font-display text-lg tracking-tight text-gray-800 dark:text-white block">EcoTrack AI</span>
              <span className="text-[10px] text-eco-600 dark:text-eco-400 font-bold tracking-wider uppercase block">Sustainability Copilot</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-150 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <User className="h-3.5 w-3.5 text-eco-600 dark:text-eco-400" />
                <span>{currentUser.name}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-start">
          <Onboarding />
        </main>

        <footer className="w-full glass-panel border-t border-gray-200/20 dark:border-gray-800/40 py-8 px-6 text-center text-xs text-gray-500 space-y-2.5 mt-8">
          <p className="font-semibold text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} EcoTrack AI. Empowering sustainable habit tracking.</p>
          <p className="max-w-md mx-auto leading-relaxed">
            Calculations are based on average carbon output models from the EPA and carbon offset guides. Recommendations do not guarantee physical utility outcomes, but serve as general instructions.
          </p>
        </footer>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="h-4 w-4" /> },
    { id: 'challenges', label: 'Challenges', icon: <Compass className="h-4 w-4" /> },
    { id: 'history', label: 'History & Badges', icon: <Calendar className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>

      {/* Main Branded Navigation Header */}
      <header className="glass-panel sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-gray-200/20 dark:border-gray-800/40">
        <div className="flex items-center gap-3">
          <img 
            src={ecotrackLogo} 
            alt="EcoTrack AI brand logo showing leaf node" 
            className="w-10 h-10 rounded-xl shadow-md border border-gray-250/20"
          />
          <div>
            <span className="font-extrabold font-display text-lg tracking-tight text-gray-800 dark:text-white block">EcoTrack AI</span>
            <span className="text-[10px] text-eco-600 dark:text-eco-400 font-bold tracking-wider uppercase block">Sustainability Copilot</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Primary Navigation">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-eco-100 dark:bg-eco-950/40 text-eco-700 dark:text-eco-300'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
          <button
            onClick={() => handleTabChange('questionnaire')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'questionnaire'
                ? 'bg-eco-100 dark:bg-eco-950/40 text-eco-700 dark:text-eco-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/40'
            }`}
            title="Re-take carbon footprint questionnaire"
          >
            <RefreshCw className="h-4 w-4" /> Re-assess
          </button>
          <button
            onClick={resetApp}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            title="Reset application data"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>

          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
          
          {/* User profile dropdown/display */}
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <User className="h-3.5 w-3.5 text-eco-600 dark:text-eco-400" />
              <span>{currentUser.name}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {currentUser && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
              <User className="h-3 w-3 text-eco-600 dark:text-eco-400 shrink-0" />
              <span className="truncate">{currentUser.name}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="glass-panel md:hidden border-b border-gray-200/20 dark:border-gray-800/40 px-6 py-4 animate-scale-in space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-eco-100 dark:bg-eco-950/40 text-eco-700 dark:text-eco-300 shadow-sm'
                  : 'text-gray-655 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="h-[1px] bg-gray-200 dark:bg-gray-800 my-2" />
          <button
            onClick={() => handleTabChange('questionnaire')}
            className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'questionnaire'
                ? 'bg-eco-100 dark:bg-eco-950/40 text-eco-700 dark:text-eco-300'
                : 'text-gray-655 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850/40'
            }`}
          >
            <RefreshCw className="h-4 w-4" /> Re-assess Footprint
          </button>
          <button
            onClick={resetApp}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Reset Data
          </button>
        </div>
      )}

      {/* Main Core Content Landmark */}
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col justify-start">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'goals' && <Goals />}
        {activeTab === 'challenges' && <Challenges />}
        {activeTab === 'history' && <History />}
        {activeTab === 'questionnaire' && <Onboarding />}
      </main>

      {/* Premium Footer Landmark */}
      <footer className="w-full glass-panel border-t border-gray-200/20 dark:border-gray-800/40 py-8 px-6 text-center text-xs text-gray-500 space-y-2.5 mt-8">
        <p className="font-semibold text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} EcoTrack AI. Empowering sustainable habit tracking.</p>
        <p className="max-w-md mx-auto leading-relaxed">
          Calculations are based on average carbon output models from the EPA and carbon offset guides. Recommendations do not guarantee physical utility outcomes, but serve as general instructions.
          Always log in to save details to your personalized profile.
        </p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EcoTrackProvider>
      <AppContent />
    </EcoTrackProvider>
  );
};

export default App;
