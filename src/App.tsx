import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Inbox,
  Settings,
  FileText,
  Mail,
  Search,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { Screen, EmailRecord } from './types.ts';
import { getConfig } from './services/api.ts';

import SetupScreen from './screens/SetupScreen';
import Dashboard from './screens/Dashboard';
import InboxScreen from './screens/InboxScreen';
import Digest from './screens/Digest';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isDemoOnly, setIsDemoOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConfig().then((cfg) => {
      if (!cfg.configured) {
        setCurrentScreen('setup');
      } else {
        setConnectedEmail(cfg.email ?? null);
        setIsDemo(cfg.demo ?? false);
        setIsDemoOnly(cfg.demoOnly ?? false);
        setCurrentScreen('dashboard');
      }
      setLoading(false);
    });
  }, []);

  const handleNavigate = (screen: Screen, email?: EmailRecord) => {
    if (email) setSelectedEmail(email);
    setCurrentScreen(screen);
  };

  const handleSetupComplete = async () => {
    const cfg = await getConfig();
    setConnectedEmail(cfg.email ?? null);
    setIsDemo(cfg.demo ?? false);
    setIsDemoOnly(cfg.demoOnly ?? false);
    setCurrentScreen('dashboard');
  };

  const handleSignOut = () => {
    setConnectedEmail(null);
    setIsDemo(false);
    setCurrentScreen('setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Mail className="text-white" size={24} />
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Loading Ottochive…</p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'setup') {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={(screen, email) => handleNavigate(screen, email)} />;
      case 'inbox':
        return <InboxScreen email={selectedEmail} onBack={() => setCurrentScreen('dashboard')} />;
      case 'digest':
        return <Digest />;
      case 'settings':
        return <SettingsScreen connectedEmail={connectedEmail} onSignOut={handleSignOut} demoOnly={isDemoOnly} />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans mb-20 md:mb-0">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full bg-surface border-b border-outline-variant z-50 h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          {currentScreen === 'inbox' ? (
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="p-2 hover:bg-surface-container-low rounded-full text-primary transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="text-primary flex items-center justify-center">
              <Mail className="fill-current" size={24} />
            </div>
          )}
          <h1 className="font-heading text-xl md:text-2xl font-bold text-primary">Ottochive</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
            {(['dashboard', 'digest', 'settings'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setCurrentScreen(s)}
                className={`font-heading text-sm font-semibold transition-colors capitalize ${
                  currentScreen === s ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {s === 'dashboard' ? 'Inbox' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-primary hover:bg-surface-container-low rounded-full transition-colors hidden md:block">
              <Search size={20} />
            </button>
            {/* Account avatar — initials from connected email */}
            <button
              onClick={() => setCurrentScreen('settings')}
              className="h-10 w-10 rounded-full bg-secondary-container flex items-center justify-center border border-outline-variant shadow-sm hover:ring-2 hover:ring-primary/30 transition-all"
              title={connectedEmail ?? 'Account'}
            >
              <span className="text-primary font-bold text-sm uppercase">
                {connectedEmail ? connectedEmail[0] : '?'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Demo banner */}
      {isDemo && (
        <div className="fixed top-16 w-full z-40 bg-amber-400 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 py-2 px-4">
          <Sparkles size={13} />
          DEMO MODE — showing sample data. Connect a real inbox in Settings.
          <Sparkles size={13} />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-grow ${isDemo ? 'pt-24' : 'pt-16'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant py-2 pb-safe flex justify-around items-center z-50">
        <button
          onClick={() => setCurrentScreen('dashboard')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all active:scale-95 duration-200 ${
            currentScreen === 'dashboard' ? 'bg-secondary-container text-primary' : 'text-on-surface-variant'
          }`}
        >
          <Inbox size={24} className={currentScreen === 'dashboard' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold mt-1">Inbox</span>
        </button>
        <button
          onClick={() => setCurrentScreen('digest')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all active:scale-95 duration-200 ${
            currentScreen === 'digest' ? 'bg-secondary-container text-primary' : 'text-on-surface-variant'
          }`}
        >
          <FileText size={24} className={currentScreen === 'digest' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold mt-1">Digest</span>
        </button>
        <button
          onClick={() => setCurrentScreen('settings')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all active:scale-95 duration-200 ${
            currentScreen === 'settings' ? 'bg-secondary-container text-primary' : 'text-on-surface-variant'
          }`}
        >
          <Settings size={24} className={currentScreen === 'settings' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold mt-1">Settings</span>
        </button>
      </nav>
    </div>
  );
}
