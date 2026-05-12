import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Copy, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { draftReply } from '../services/api.ts';

interface DraftReplyModalProps {
  open: boolean;
  onClose: () => void;
  emailBody: string;
  label: string;
  senderName: string;
  subject: string;
}

const LABEL_DISPLAY: Record<string, { name: string; color: string }> = {
  POSITIVE_REPLY:       { name: 'Positive Reply — Warm & Urgent',       color: 'text-green-700' },
  SOFT_NO:              { name: 'Soft No — Polite Follow-up',            color: 'text-amber-700' },
  INTERESTED_NOT_READY: { name: 'Interested — Educational & Helpful',    color: 'text-blue-700'  },
  OOO:                  { name: 'Out of Office — Brief Acknowledgement', color: 'text-on-surface-variant' },
  UNSUBSCRIBE:          { name: 'Unsubscribe — Graceful Exit',           color: 'text-red-700'   },
};

export default function DraftReplyModal({
  open, onClose, emailBody, label, senderName, subject
}: DraftReplyModalProps) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setDraft('');
    setCopied(false);
    setSent(false);
    const result = await draftReply(emailBody, label, senderName);
    if (result.error) {
      setError(result.error);
    } else {
      setDraft(result.draft ?? '');
    }
    setLoading(false);
  };

  // Auto-generate when modal opens
  useEffect(() => {
    if (open) generate();
  }, [open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    // In production this would connect to your email send API
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 2000);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [draft]);

  const meta = LABEL_DISPLAY[label] ?? { name: label, color: 'text-on-surface-variant' };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl pointer-events-auto flex flex-col max-h-[90vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-outline-variant flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-primary" size={18} />
                    <h2 className="font-heading text-xl font-extrabold text-on-surface">AI Draft Reply</h2>
                  </div>
                  <p className={`text-xs font-bold ${meta.color}`}>Tone: {meta.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Re: {subject}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-outline hover:text-on-surface"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto px-8 py-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-on-surface-variant">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="text-primary animate-pulse" size={24} />
                    </div>
                    <p className="font-medium text-sm">Drafting your reply...</p>
                  </div>
                )}

                {error && !loading && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-bold text-red-700">Could not generate draft</p>
                      <p className="text-xs text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && draft && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        Edit before sending
                      </p>
                      <button
                        onClick={generate}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <RefreshCw size={12} />
                        Regenerate
                      </button>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      className="w-full text-sm text-on-surface leading-relaxed bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                      style={{ minHeight: '200px' }}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-outline-variant flex items-center justify-between gap-3 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    disabled={!draft || loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant font-bold text-sm hover:bg-surface-container-low transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {copied ? (
                      <><CheckCircle size={15} className="text-green-600" /> Copied!</>
                    ) : (
                      <><Copy size={15} /> Copy</>
                    )}
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={!draft || loading || sent}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    {sent ? (
                      <><CheckCircle size={15} /> Sent!</>
                    ) : (
                      <><Send size={15} /> Send Reply</>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
