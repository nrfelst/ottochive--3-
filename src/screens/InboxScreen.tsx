import { ReactNode, useState } from 'react';
import { ArrowLeft, Mail as MailIcon, Reply, Clock, UserCheck, BookOpen, BellOff, Trash2, Sparkles } from 'lucide-react';
import { EmailRecord } from '../types.ts';
import DraftReplyModal from '../components/DraftReplyModal.tsx';

interface InboxScreenProps {
  onBack: () => void;
  email: EmailRecord | null;
}

const LABEL_META: Record<string, { label: string; color: string; bg: string; border: string; icon: ReactNode; action: string; actionDetail: string }> = {
  POSITIVE_REPLY: {
    label: 'Positive Reply',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <UserCheck size={16} />,
    action: '🔥 Follow up today',
    actionDetail: 'This lead has buying intent. Reply within the hour and send a calendar link.',
  },
  SOFT_NO: {
    label: 'Soft No',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Clock size={16} />,
    action: '📅 Schedule follow-up',
    actionDetail: 'Not now doesn\'t mean never. Add a 90-day follow-up task and move on.',
  },
  INTERESTED_NOT_READY: {
    label: 'Interested, Not Ready',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <BookOpen size={16} />,
    action: '📄 Send nurture material',
    actionDetail: 'They want to learn more before committing. Send a case study or one-pager.',
  },
  OOO: {
    label: 'Out of Office',
    color: 'text-on-surface-variant',
    bg: 'bg-surface-container-low',
    border: 'border-outline-variant',
    icon: <BellOff size={16} />,
    action: '⏳ Auto-retry later',
    actionDetail: 'Auto-reply detected. No action needed — follow up when they\'re back.',
  },
  UNSUBSCRIBE: {
    label: 'Unsubscribe',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <Trash2 size={16} />,
    action: '🚫 Remove immediately',
    actionDetail: 'Remove this contact from all sequences now. Required for compliance.',
  },
};

function parseSender(raw: string): { name: string; email: string } {
  // Handles "Sarah Chen <sarah.chen@acmecorp.com>" or plain "sarah@example.com"
  const match = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  if (raw.includes('@')) return { name: raw.split('@')[0], email: raw };
  return { name: raw, email: '' };
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function InboxScreen({ onBack, email }: InboxScreenProps) {
  const [draftOpen, setDraftOpen] = useState(false);
  if (!email) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-on-surface-variant">
        <MailIcon size={48} className="mx-auto mb-4 opacity-20" />
        <p>No email selected.</p>
        <button onClick={onBack} className="mt-4 text-primary font-bold hover:underline">← Back to Inbox</button>
      </div>
    );
  }

  const { name, email: senderEmail } = parseSender(email.sender);
  const meta = LABEL_META[email.label] ?? {
    label: email.label.replace(/_/g, ' '),
    color: 'text-on-surface-variant',
    bg: 'bg-surface-container-low',
    border: 'border-outline-variant',
    icon: <MailIcon size={16} />,
    action: 'Review manually',
    actionDetail: 'Check this email and decide on next steps.',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-32">

      {/* Back + actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={onBack}
          className="bg-surface border border-outline-variant text-on-surface px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm hover:bg-surface-container-low transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm hover:opacity-90 transition-all active:scale-95 shadow-md">
          <Reply size={16} />
          Reply
        </button>
      </div>

      {/* Header */}
      <header className="mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-4 ${meta.bg} ${meta.color} ${meta.border}`}>
          {meta.icon}
          {meta.label}
        </div>

        <h1 className="font-heading text-2xl md:text-3xl font-bold text-on-surface leading-tight tracking-tight mb-4">
          {email.subject}
        </h1>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {getInitials(name)}
          </div>
          <div>
            <p className="font-heading font-bold text-on-surface text-lg">{name}</p>
            <p className="text-on-surface-variant text-sm">{senderEmail || 'Unknown sender'}</p>
          </div>
          <span className="ml-auto text-on-surface-variant text-xs font-medium">{email.date}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Email body */}
        <section className="md:col-span-2 bg-white p-8 rounded-2xl border border-outline-variant soft-bloom">
          <div className="flex items-center gap-2 mb-6">
            <MailIcon className="text-primary" size={20} />
            <h3 className="font-heading text-lg font-bold text-on-surface">Message</h3>
          </div>
          <div className="text-on-surface leading-relaxed whitespace-pre-wrap text-[15px]">
            {email.text}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">

          {/* AI Recommendation */}
          <div className={`p-6 rounded-2xl border ${meta.bg} ${meta.border}`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 text-current">AI Recommendation</p>
            <p className={`font-heading text-lg font-extrabold mb-2 ${meta.color}`}>{meta.action}</p>
            <p className={`text-sm leading-relaxed ${meta.color} opacity-80`}>{meta.actionDetail}</p>
          </div>

          {/* Classification */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-4">Classification</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant font-medium">Category</span>
                <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant font-medium">Classified</span>
                <span className="text-sm font-bold text-on-surface">{email.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant font-medium">Engine</span>
                <span className="text-sm font-bold text-on-surface">Local ML</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-4">Quick Actions</p>
            <div className="space-y-2">
              <button
                onClick={() => setDraftOpen(true)}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles size={14} />
                Draft Reply with AI
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-outline-variant/20 text-sm font-semibold text-on-surface transition-all">
                📋 Copy email text
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-outline-variant/20 text-sm font-semibold text-on-surface transition-all">
                📅 Add follow-up reminder
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-outline-variant/20 text-sm font-semibold text-on-surface transition-all">
                🔗 Log to CRM
              </button>
            </div>
          </div>

        </aside>
      </div>

      <DraftReplyModal
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        emailBody={email.text}
        label={email.label}
        senderName={name}
        subject={email.subject}
      />
    </div>
  );
}
