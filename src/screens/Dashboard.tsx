import { useState, useEffect, ReactNode } from 'react';
import { Search, AlertTriangle, TrendingUp, MessageSquare, ArrowRight, Reply, RefreshCw, UserCheck, Clock, BookOpen, BellOff, Trash2 } from 'lucide-react';
import { Screen } from '../types.ts';
import { getEmails } from '../services/api.ts';

interface DashboardProps {
  onNavigate: (screen: Screen, email?: EmailRecord) => void;
}

interface EmailRecord {
  date: string;
  sender: string;
  subject: string;
  label: string;
  text: string;
}

const LABEL_META: Record<string, { label: string; barColor: string; bg: string; textColor: string; icon: ReactNode }> = {
  POSITIVE_REPLY:       { label: 'Positive Reply',        barColor: 'bg-green-500',        bg: 'bg-green-50',               textColor: 'text-green-700',          icon: <UserCheck size={13} /> },
  SOFT_NO:              { label: 'Soft No',               barColor: 'bg-amber-400',        bg: 'bg-amber-50',               textColor: 'text-amber-700',          icon: <Clock size={13} /> },
  INTERESTED_NOT_READY: { label: 'Interested, Not Ready', barColor: 'bg-blue-400',         bg: 'bg-blue-50',                textColor: 'text-blue-700',           icon: <BookOpen size={13} /> },
  OOO:                  { label: 'Out of Office',         barColor: 'bg-surface-dim',      bg: 'bg-surface-container-low',  textColor: 'text-on-surface-variant', icon: <BellOff size={13} /> },
  UNSUBSCRIBE:          { label: 'Unsubscribe',           barColor: 'bg-red-400',          bg: 'bg-red-50',                 textColor: 'text-red-700',            icon: <Trash2 size={13} /> },
};

function parseSenderName(raw: string): string {
  const match = raw.match(/^(.*?)\s*</);
  if (match) return match[1].trim();
  if (raw.includes('@')) return raw.split('@')[0];
  return raw;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    const data = await getEmails();
    setEmails(data);
    setLoading(false);
  };

  useEffect(() => { fetchEmails(); }, []);

  const filtered = search
    ? emails.filter(e =>
        e.sender.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase()) ||
        e.text.toLowerCase().includes(search.toLowerCase())
      )
    : emails;

  const urgentEmails = filtered.filter(e => e.label === 'POSITIVE_REPLY');
  const otherEmails  = filtered.filter(e => e.label !== 'POSITIVE_REPLY');

  const counts = emails.reduce<Record<string, number>>((acc, e) => {
    acc[e.label] = (acc[e.label] || 0) + 1;
    return acc;
  }, {});
  const total = emails.length || 1;
  const hotLeadPct = Math.round(((counts['POSITIVE_REPLY'] || 0) / total) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface mb-2">Executive Clarity</h2>
          <p className="text-on-surface-variant text-lg">Focus on what matters. Your inbox, distilled.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="p-3 bg-surface border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors text-primary disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-11 pr-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Hot Leads */}
        <section className="lg:col-span-8 space-y-5">
          <div className="flex items-center gap-2 px-1">
            <AlertTriangle className="text-error" size={22} />
            <h3 className="font-heading text-xl md:text-2xl font-bold">Hot Leads ({urgentEmails.length})</h3>
          </div>

          {urgentEmails.length > 0 ? urgentEmails.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('inbox', item)}
              className="bg-surface p-6 rounded-2xl border border-outline-variant soft-bloom card-lift cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                    {getInitials(parseSenderName(item.sender))}
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface">{parseSenderName(item.sender)}</h4>
                    <span className="text-xs text-on-surface-variant">{item.date}</span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
                  <UserCheck size={12} /> Hot Lead
                </span>
              </div>
              <p className="text-on-surface font-semibold mb-2 truncate">"{item.subject}"</p>
              <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{item.text}</p>
              <div className="flex gap-3">
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 hover:opacity-90">
                  Respond Now
                </button>
                <button className="bg-surface border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container-low">
                  View Email
                </button>
              </div>
            </div>
          )) : (
            <div className="bg-surface/50 p-12 rounded-2xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant">
              <AlertTriangle size={40} className="opacity-20 mb-4" />
              <p className="font-medium">No hot leads in your recent sync.</p>
              {emails.length === 0 && <p className="text-xs mt-2 opacity-70">Run your connector script to pull data.</p>}
            </div>
          )}
        </section>

        {/* Pipeline Breakdown */}
        <section className="lg:col-span-4 space-y-5">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp className="text-primary" size={22} />
            <h3 className="font-heading text-xl md:text-2xl font-bold">Pipeline</h3>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-6 soft-bloom space-y-5">
            {emails.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6 opacity-70">
                No data yet — run the connector to populate.
              </p>
            ) : (
              <>
                <div className="text-center pb-5 border-b border-outline-variant">
                  <p className="text-5xl font-heading font-extrabold text-on-surface">{emails.length}</p>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">Emails classified</p>
                </div>
                <div className="space-y-4">
                  {Object.entries(LABEL_META).map(([key, meta]) => {
                    const count = counts[key] || 0;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${meta.textColor}`}>
                            {meta.icon}
                            {meta.label}
                          </div>
                          <span className="text-xs font-bold text-on-surface">{count}</span>
                        </div>
                        <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                          <div className={`${meta.barColor} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {emails.length > 0 && (
            <div className="bg-primary rounded-2xl p-6 text-white soft-bloom">
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">Hot Lead Rate</p>
              <p className="text-5xl font-heading font-extrabold mb-1">{hotLeadPct}%</p>
              <p className="text-sm opacity-80">of replies show buying intent</p>
            </div>
          )}
        </section>

        {/* All Replies */}
        <section className="lg:col-span-12 space-y-5 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-secondary" size={22} />
              <h3 className="font-heading text-xl md:text-2xl font-bold">All Replies ({otherEmails.length})</h3>
            </div>
          </div>

          {otherEmails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherEmails.slice(0, 6).map((item, i) => {
                const meta = LABEL_META[item.label];
                return (
                  <div
                    key={i}
                    onClick={() => onNavigate('inbox', item)}
                    className="bg-surface p-6 rounded-2xl border border-outline-variant soft-bloom card-lift cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                        {getInitials(parseSenderName(item.sender))}
                      </div>
                      <h4 className="font-semibold text-on-surface truncate flex-1">{parseSenderName(item.sender)}</h4>
                    </div>
                    {meta && (
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 ${meta.bg} ${meta.textColor}`}>
                        {meta.icon}
                        {meta.label}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-on-surface mb-2 truncate">{item.subject}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">{item.text}</p>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant">
                      <span className="text-on-surface-variant text-xs">{item.date}</span>
                      <Reply size={14} className="text-outline" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-2xl">
              {emails.length === 0 ? 'No emails yet — run the connector to pull data.' : 'No other replies found.'}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
