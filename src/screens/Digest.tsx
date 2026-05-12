import { useState, useEffect, ReactNode } from 'react';
import { Share2, Mail, Zap, UserCheck, Clock, BookOpen, BellOff, Trash2, TrendingUp, RefreshCw } from 'lucide-react';
import { getEmails } from '../services/api.ts';

interface EmailRecord {
  date: string;
  sender: string;
  subject: string;
  label: string;
  text: string;
}

const LABEL_META: Record<string, { label: string; short: string; barColor: string; bg: string; textColor: string; borderColor: string; icon: ReactNode; action: string }> = {
  POSITIVE_REPLY:       { label: 'Positive Reply',        short: 'Hot Lead', barColor: 'bg-green-500', bg: 'bg-green-50',              textColor: 'text-green-700',          borderColor: 'border-green-200',      icon: <UserCheck size={14}/>, action: 'Reply within the hour — send a calendar link.' },
  SOFT_NO:              { label: 'Soft No',               short: 'Soft No',  barColor: 'bg-amber-400', bg: 'bg-amber-50',              textColor: 'text-amber-700',          borderColor: 'border-amber-200',      icon: <Clock size={14}/>,     action: 'Add a 90-day follow-up task.' },
  INTERESTED_NOT_READY: { label: 'Interested, Not Ready', short: 'Nurture',  barColor: 'bg-blue-400',  bg: 'bg-blue-50',               textColor: 'text-blue-700',           borderColor: 'border-blue-200',       icon: <BookOpen size={14}/>,  action: 'Send a case study or product one-pager.' },
  OOO:                  { label: 'Out of Office',         short: 'OOO',      barColor: 'bg-gray-300',  bg: 'bg-surface-container-low', textColor: 'text-on-surface-variant', borderColor: 'border-outline-variant', icon: <BellOff size={14}/>,  action: 'No action needed — retry when they return.' },
  UNSUBSCRIBE:          { label: 'Unsubscribe',           short: 'Remove',   barColor: 'bg-red-400',   bg: 'bg-red-50',                textColor: 'text-red-700',            borderColor: 'border-red-200',        icon: <Trash2 size={14}/>,   action: 'Remove from all sequences immediately.' },
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

export default function Digest() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getEmails().then(data => { setEmails(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const counts = emails.reduce<Record<string, number>>((acc, e) => {
    acc[e.label] = (acc[e.label] || 0) + 1;
    return acc;
  }, {});

  const total = emails.length;
  const hotLeads = emails.filter(e => e.label === 'POSITIVE_REPLY');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const topEntry = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  const topMeta = topEntry ? LABEL_META[topEntry[0]] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-32">
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">Today's Report</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-on-surface leading-tight">Daily Digest</h2>
          <p className="text-on-surface-variant text-lg mt-1">Summary for {today}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-3 bg-surface border border-outline-variant rounded-xl text-primary hover:bg-surface-container-low transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md active:scale-95">
            <Share2 size={18} />
            Share Report
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-on-surface-variant">
          <RefreshCw size={24} className="animate-spin mr-3" />
          <span className="font-medium">Loading digest...</span>
        </div>
      ) : total === 0 ? (
        <div className="text-center py-24 text-on-surface-variant border border-dashed border-outline-variant rounded-2xl">
          <Mail size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No emails classified yet.</p>
          <p className="text-sm mt-2 opacity-70">Run the connector script to pull your inbox.</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
            <div className="bg-white border border-outline-variant rounded-2xl p-6 soft-bloom card-lift">
              <div className="p-2 bg-secondary-container rounded-lg w-fit mb-4"><Mail className="text-primary" size={22} /></div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Total Replies</p>
              <p className="text-4xl font-heading font-extrabold text-on-surface">{total}</p>
            </div>

            <div className="bg-white border border-outline-variant rounded-2xl p-6 soft-bloom card-lift">
              <div className="p-2 bg-green-100 rounded-lg w-fit mb-4"><UserCheck className="text-green-700" size={22} /></div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Hot Leads</p>
              <p className="text-4xl font-heading font-extrabold text-on-surface">{counts['POSITIVE_REPLY'] || 0}</p>
            </div>

            <div className="md:col-span-2 bg-white border border-outline-variant rounded-2xl p-6 soft-bloom card-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-surface-container-low rounded-lg"><TrendingUp className="text-secondary" size={22} /></div>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Top Category</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  {topMeta ? (
                    <>
                      <p className={`text-xl md:text-2xl font-heading font-extrabold mb-1 ${topMeta.textColor}`}>{topMeta.label}</p>
                      <p className="text-on-surface-variant text-sm">{topEntry[1]} of {total} ({Math.round((Number(topEntry[1])/total)*100)}%)</p>
                    </>
                  ) : <p className="text-on-surface-variant">No data</p>}
                </div>
                <div className="flex items-end gap-1 h-14">
                  {Object.entries(LABEL_META).map(([key, meta]) => {
                    const pct = Math.max(10, Math.round(((counts[key] || 0) / total) * 100));
                    return <div key={key} className={`w-3.5 rounded-t-sm ${meta.barColor}`} style={{ height: `${pct}%` }} title={`${meta.label}: ${counts[key] || 0}`} />;
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <section className="lg:col-span-2 space-y-5">
              <h3 className="font-heading text-xl md:text-2xl font-bold flex items-center gap-3">
                <Zap className="text-primary fill-current" size={22} />
                Action Items
              </h3>
              <div className="space-y-4">
                {emails.map((item, i) => {
                  const meta = LABEL_META[item.label];
                  if (!meta) return null;
                  return (
                    <div key={i} className="bg-white border border-outline-variant rounded-2xl p-6 soft-bloom card-lift flex gap-5">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full ${meta.bg} border ${meta.borderColor} flex items-center justify-center font-bold text-sm ${meta.textColor}`}>
                          {getInitials(parseSenderName(item.sender))}
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${meta.bg} ${meta.textColor}`}>
                            {meta.icon} {meta.short}
                          </span>
                          <span className="text-on-surface-variant text-sm font-semibold">{parseSenderName(item.sender)}</span>
                        </div>
                        <h4 className="font-heading text-base font-extrabold text-on-surface mb-1 truncate">{item.subject}</h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-3">{item.text}</p>
                        <p className={`text-xs font-bold ${meta.textColor}`}>→ {meta.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="bg-white border border-outline-variant rounded-2xl p-6 soft-bloom">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-5 opacity-70">Breakdown</p>
                <div className="space-y-4">
                  {Object.entries(LABEL_META).map(([key, meta]) => {
                    const count = counts[key] || 0;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${meta.textColor}`}>{meta.icon} {meta.label}</div>
                          <span className="text-xs font-bold text-on-surface">{count} <span className="text-on-surface-variant font-normal">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                          <div className={`${meta.barColor} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hotLeads.length > 0 && (
                <div className="bg-primary rounded-2xl p-6 text-white soft-bloom space-y-4">
                  <div className="flex items-center gap-3">
                    <UserCheck size={22} />
                    <h4 className="text-lg font-heading font-extrabold">Hot Lead Spotlight</h4>
                  </div>
                  <div className="space-y-3">
                    {hotLeads.slice(0, 3).map((e, i) => (
                      <div key={i} className="bg-white/10 rounded-xl px-4 py-3">
                        <p className="font-bold text-sm">{parseSenderName(e.sender)}</p>
                        <p className="text-white/70 text-xs truncate mt-0.5">{e.subject}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-white/50 text-center uppercase tracking-widest">
                    {hotLeads.length} lead{hotLeads.length !== 1 ? 's' : ''} ready to close
  				  </p>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
