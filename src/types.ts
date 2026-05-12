export interface EmailRecord {
  date: string;
  sender: string;
  subject: string;
  label: string;
  text: string;
}

export type Screen = 'setup' | 'dashboard' | 'inbox' | 'digest' | 'settings';

export interface ActionItem {
  id: string;
  type: 'invoice' | 'shipping' | 'meeting' | 'urgent';
  title: string;
  sender: string;
  senderEntity?: string;
  summary: string;
  time: string;
  completed?: boolean;
}

export interface Stats {
  totalEmails: number;
  totalEmailsChange: string;
  topCategory: string;
  topCategoryVolume: string;
  highPriority: string;
}

export interface EmailData {
  id: string;
  subject: string;
  sender: string;
  role: string;
  time: string;
  summaryPoints: string[];
  originalText: string;
  senderImage: string;
  senderEmail: string;
}
