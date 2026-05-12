import { useState, useEffect } from 'react';
import { Server, Info, FolderOpen, ShieldCheck, HelpCircle, ArrowRight, RefreshCw, Cpu, Mail, LogOut, AlertTriangle } from 'lucide-react';
import { getHealth, deleteConfig } from '../services/api.ts';

interface SettingsScreenProps {
  connectedEmail?: string | null;
  onSignOut?: () => void;
  demoOnly?: boolean;
}

export default function SettingsScreen({ connectedEmail, onSignOut, demoOnly }: SettingsScreenProps) {
  const [status, setStatus] = useState<string>('checking...');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    getHealth().then((health) => {
      if (health.status === 'ok') {
        setStatus('Running');
        setIsOnline(true);
      } else {
        setStatus('Offline');
        setIsOnline(false);
      }
    });
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await deleteConfig();
    setSigningOut(false);
    onSignOut?.();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-32">
      <header className="mb-12">
        <h2 className="font-heading text-4xl font-bold text-on-surface mb-3 tracking-tight">Settings</h2>
        <p className="text-on-surface-variant text-lg">Manage your connected inbox and local model instance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Settings Column */}
        <div className="lg:col-span-7 space-y-8">

          {/* Connected Account Card */}
          <div className="bg-white border border-outline-variant soft-bloom rounded-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-70">Connected Inbox</p>
                <h3 className="text-2xl font-heading font-extrabold text-on-surface">Email Account</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="text-primary" size={22} />
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between border border-outline-variant/30 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase">
                  {connectedEmail ? connectedEmail[0] : '?'}
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant opacity-70">Signed in as</p>
                  <p className="font-heading font-extrabold text-on-surface">{connectedEmail ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold">Active</span>
              </div>
            </div>

            {!demoOnly && (
              <>
                {!showSignOutConfirm ? (
                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    className="flex items-center gap-2 text-sm font-bold text-error hover:underline"
                  >
                    <LogOut size={14} />
                    Disconnect account
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-sm text-red-700 font-medium">
                        This will remove your saved credentials and return you to the setup screen. Your processed email data will not be deleted.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSignOutConfirm(false)}
                        className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="px-4 py-2 rounded-lg bg-error text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {signingOut ? 'Disconnecting…' : 'Yes, disconnect'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status Card */}
          <div className="bg-white border border-outline-variant soft-bloom rounded-2xl p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-70">Current State</p>
                <h3 className="text-2xl font-heading font-extrabold text-on-surface">Local Instance Status</h3>
              </div>
              <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-bold">{status}</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between border border-outline-variant/30">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Server className="text-secondary" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant opacity-70">Active Port</p>
                  <p className="font-heading font-extrabold text-on-surface">8001</p>
                </div>
              </div>
              <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1.5">
                <RefreshCw size={14} />
                Restart Instance
              </button>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white border border-outline-variant soft-bloom rounded-2xl p-8">
            <h3 className="text-2xl font-heading font-extrabold text-on-surface mb-8">Summarization Intensity</h3>
            <div className="space-y-12 py-4">
              <div className="relative">
                <input
                  type="range"
                  className="w-full h-2 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-primary"
                  defaultValue={65}
                />
                <div className="flex justify-between mt-6">
                  <div className="text-center group">
                    <p className="text-sm font-bold text-on-surface-variant transition-colors group-hover:text-primary">Concise</p>
                    <p className="text-[10px] font-medium text-outline">Short & Punchy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-primary">Balanced</p>
                    <p className="text-[10px] font-medium text-outline">Optimized</p>
                  </div>
                  <div className="text-center group">
                    <p className="text-sm font-bold text-on-surface-variant transition-colors group-hover:text-primary">Detailed</p>
                    <p className="text-[10px] font-medium text-outline">Comprehensive</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-4 items-start">
              <Info className="text-primary shrink-0" size={20} />
              <p className="text-sm text-secondary font-medium leading-relaxed">
                Increasing intensity may slightly increase processing time per email thread.
              </p>
            </div>
          </div>

          {/* Storage & Data */}
          <div className="bg-white border border-outline-variant soft-bloom rounded-2xl p-8">
            <h3 className="text-2xl font-heading font-extrabold text-on-surface mb-8">Storage & Data</h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-on-surface-variant block mb-3 opacity-80 uppercase tracking-wider">Storage Path</label>
                <div className="flex gap-3">
                  <div className="flex-grow flex items-center bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 group focus-within:border-primary transition-all">
                    <FolderOpen className="text-outline mr-3 group-focus-within:text-primary transition-colors" size={18} />
                    <code className="text-sm font-medium text-on-surface-variant overflow-hidden truncate">data/processed_emails.csv</code>
                  </div>
                  <button className="bg-white border border-outline-variant px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-low transition-all active:scale-95 shadow-sm">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Training Action */}
          <div className="bg-primary text-white rounded-3xl p-8 soft-bloom relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Cpu className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-extrabold mb-3">Refine Neural Engine</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-8">
                  Training on your recent labels improves summarization accuracy by up to <span className="text-white font-bold">40%</span>.
                </p>
              </div>
              <button className="w-full bg-white text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-secondary-container transition-all active:scale-98 shadow-xl group-hover:shadow-2xl">
                Retrain Model
                <ArrowRight size={18} />
              </button>
              <p className="text-[11px] font-bold text-white/60 text-center uppercase tracking-widest">
                Last retrained: 14 hours ago
              </p>
            </div>
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-primary-container/20 rounded-full blur-2xl"></div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant/30">
                <ShieldCheck className="fill-current" size={24} />
              </div>
              <h4 className="text-xl font-heading font-extrabold text-on-surface">Privacy Notice</h4>
            </div>
            <p className="text-on-surface-variant font-medium leading-relaxed">
              Ottochive operates on a <span className="text-primary font-bold">"Zero-Cloud"</span> architecture. <span className="font-bold text-on-surface">All data stays on your local hardware</span>. No emails, summaries, or metadata are ever transmitted to external servers.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold text-on-surface-variant">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="text-primary" size={14} />
                </div>
                Local LLM Execution
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-on-surface-variant">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="text-primary" size={14} />
                </div>
                Encrypted Label Database
              </li>
            </ul>
          </div>

          {/* Help Center */}
          <div className="border-2 border-outline-variant border-dashed rounded-2xl p-8 flex flex-col items-center text-center space-y-4 group cursor-pointer hover:border-primary transition-all">
            <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <HelpCircle className="text-outline group-hover:text-primary transition-colors" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface mb-1">Need help with configuration?</p>
              <p className="text-xs font-medium text-on-surface-variant opacity-70">View the documentation for advanced CLI commands.</p>
            </div>
            <button className="text-primary font-bold text-sm hover:underline transition-all">Read Docs</button>
          </div>
        </div>
      </div>
    </div>
  );
}
