import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, Loader, ChevronRight, Shield, Zap, ExternalLink, Sparkles } from 'lucide-react';
import { saveConfig, testConnection } from '../services/api.ts';

interface Provider {
  id: string;
  name: string;
  logo: string;
  imapServer: string;
  color: string;
  appPasswordUrl: string;
  appPasswordSteps: string[];
}

const PROVIDERS: Provider[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    logo: 'G',
    imapServer: 'imap.gmail.com',
    color: '#EA4335',
    appPasswordUrl: 'https://myaccount.google.com/apppasswords',
    appPasswordSteps: [
      'Go to your Google Account → Security',
      'Under "How you sign in to Google", select 2-Step Verification',
      'At the bottom, choose App passwords',
      'Select "Mail" and "Other device", name it Ottochive',
      'Copy the 16-character password shown',
    ],
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    logo: 'O',
    imapServer: 'outlook.office365.com',
    color: '#0078D4',
    appPasswordUrl: 'https://account.microsoft.com/security',
    appPasswordSteps: [
      'Go to account.microsoft.com → Security',
      'Under "Advanced security options", click Get started',
      'Scroll to "App passwords" and click Create a new app password',
      'Copy the generated password',
    ],
  },
  {
    id: 'yahoo',
    name: 'Yahoo Mail',
    logo: 'Y',
    imapServer: 'imap.mail.yahoo.com',
    color: '#6001D2',
    appPasswordUrl: 'https://login.yahoo.com/account/security',
    appPasswordSteps: [
      'Go to your Yahoo Account Security page',
      'Under "App passwords", click Generate app password',
      'Select "Other App" and enter Ottochive',
      'Copy the generated password',
    ],
  },
  {
    id: 'icloud',
    name: 'Apple iCloud',
    logo: '',
    imapServer: 'imap.mail.me.com',
    color: '#555555',
    appPasswordUrl: 'https://appleid.apple.com',
    appPasswordSteps: [
      'Go to appleid.apple.com and sign in',
      'Under "Sign-In and Security", select App-Specific Passwords',
      'Click the + button to generate a new password',
      'Name it Ottochive and click Create',
      'Copy the displayed password',
    ],
  },
  {
    id: 'custom',
    name: 'Other / Custom IMAP',
    logo: '@',
    imapServer: '',
    color: '#515f74',
    appPasswordUrl: '',
    appPasswordSteps: [
      'Use your regular email password, or an app-specific password if your provider supports it',
      'Make sure IMAP access is enabled in your email account settings',
    ],
  },
];

type Step = 'provider' | 'credentials' | 'success';

interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [step, setStep] = useState<Step>('provider');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customImap, setCustomImap] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const imapServer = selectedProvider?.id === 'custom' ? customImap : selectedProvider?.imapServer ?? '';

  async function handleDemo() {
    await saveConfig({ email: '', password: '', imapServer: '', imapPort: 993, provider: '', demo: true } as any);
    onComplete();
  }

  async function handleConnect() {
    if (!email || !password || !imapServer) return;
    setTesting(true);
    setTestError(null);

    const result = await testConnection(email, password, imapServer);
    if (!result.success) {
      setTestError(result.error || 'Connection failed. Check your credentials and try again.');
      setTesting(false);
      return;
    }

    await saveConfig({
      email,
      password,
      imapServer,
      imapPort: 993,
      provider: selectedProvider?.id ?? 'custom',
    });

    setTesting(false);
    setStep('success');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <Mail className="text-white" size={32} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-on-surface">Ottochive</h1>
          <p className="text-on-surface-variant mt-1">Private AI email intelligence</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Step 1: Provider selection ─── */}
          {step === 'provider' && (
            <motion.div
              key="provider"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <div className="bg-white rounded-3xl border border-outline-variant soft-bloom p-8">
                <h2 className="font-heading text-2xl font-bold text-on-surface mb-2">Connect your inbox</h2>
                <p className="text-on-surface-variant text-sm mb-8">
                  Choose your email provider. Your credentials are stored locally — never sent to any server.
                </p>

                <div className="space-y-3">
                  {PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => { setSelectedProvider(provider); setStep('credentials'); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all group text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: provider.color }}
                      >
                        {provider.logo}
                      </div>
                      <span className="font-semibold text-on-surface flex-grow">{provider.name}</span>
                      <ChevronRight className="text-outline group-hover:text-primary transition-colors" size={18} />
                    </button>
                  ))}
                </div>

                {/* Demo mode */}
                <div className="mt-6 pt-6 border-t border-outline-variant">
                  <button
                    onClick={handleDemo}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-semibold text-sm"
                  >
                    <Sparkles size={16} />
                    Try with demo data — no email needed
                  </button>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-outline-variant flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <Shield size={14} className="text-primary" />
                    Zero-cloud
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <Zap size={14} className="text-primary" />
                    Local AI
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <CheckCircle size={14} className="text-primary" />
                    Private by design
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Credentials ─── */}
          {step === 'credentials' && selectedProvider && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <div className="bg-white rounded-3xl border border-outline-variant soft-bloom p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: selectedProvider.color }}
                  >
                    {selectedProvider.logo}
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-on-surface">{selectedProvider.name}</h2>
                    <p className="text-on-surface-variant text-xs">Enter your credentials below</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="text-sm font-bold text-on-surface-variant block mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`you@${selectedProvider.id === 'custom' ? 'example.com' : selectedProvider.imapServer.replace('imap.', '')}`}
                      className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Custom IMAP server */}
                  {selectedProvider.id === 'custom' && (
                    <div>
                      <label className="text-sm font-bold text-on-surface-variant block mb-2">IMAP server</label>
                      <input
                        type="text"
                        value={customImap}
                        onChange={(e) => setCustomImap(e.target.value)}
                        placeholder="imap.yourprovider.com"
                        className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm font-mono"
                      />
                    </div>
                  )}

                  {/* App password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-on-surface-variant">App password</label>
                      {selectedProvider.appPasswordUrl && (
                        <button
                          onClick={() => setShowHelp(!showHelp)}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          {showHelp ? 'Hide help' : 'How do I get one?'}
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {showHelp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-xs font-bold text-on-surface mb-3">Steps to generate an app password:</p>
                            <ol className="space-y-2">
                              {selectedProvider.appPasswordSteps.map((step, i) => (
                                <li key={i} className="flex gap-2 text-xs text-on-surface-variant">
                                  <span className="font-bold text-primary flex-shrink-0">{i + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                            {selectedProvider.appPasswordUrl && (
                              <a
                                href={selectedProvider.appPasswordUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                              >
                                Open settings page <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Paste your app password here"
                        className="w-full px-4 py-3 pr-12 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant opacity-70">
                      Stored locally on your device. Never transmitted to any external server.
                    </p>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {testError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start"
                    >
                      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-bold text-red-700">Connection failed</p>
                        <p className="text-xs text-red-600 mt-1">{testError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { setStep('provider'); setTestError(null); }}
                    className="px-5 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-low transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={!email || !password || (selectedProvider.id === 'custom' && !customImap) || testing}
                    className="flex-grow py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                  >
                    {testing ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Testing connection…
                      </>
                    ) : (
                      <>
                        Connect inbox
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Success ─── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white rounded-3xl border border-outline-variant soft-bloom p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
                    <CheckCircle className="text-green-500" size={40} />
                  </div>
                </div>
                <h2 className="font-heading text-2xl font-bold text-on-surface mb-2">You're connected!</h2>
                <p className="text-on-surface-variant text-sm mb-2">
                  Ottochive is now linked to <span className="font-bold text-on-surface">{email}</span>.
                </p>
                <p className="text-on-surface-variant text-sm mb-8">
                  Start the Python connector to begin pulling and classifying your inbox.
                </p>

                {/* Quick-start command */}
                <div className="bg-surface-container-low rounded-xl p-4 mb-8 text-left">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Start the connector</p>
                  <div className="space-y-2">
                    <code className="block text-xs bg-on-surface text-surface rounded-lg px-3 py-2 font-mono">
                      python reader/train.py
                    </code>
                    <code className="block text-xs bg-on-surface text-surface rounded-lg px-3 py-2 font-mono">
                      uvicorn reader.server:app --port 8001
                    </code>
                    <code className="block text-xs bg-on-surface text-surface rounded-lg px-3 py-2 font-mono">
                      python reader/connector.py
                    </code>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-98"
                >
                  Open Dashboard
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
