import { ActionItem, EmailData, Stats } from './types.ts';

export const DUMMY_STATS: Stats = {
  totalEmails: 142,
  totalEmailsChange: '+12% vs avg',
  topCategory: 'Logistics & Shipping',
  topCategoryVolume: '42% of today\'s volume',
  highPriority: '07'
};

export const DUMMY_ACTION_ITEMS: ActionItem[] = [
  {
    id: '1',
    type: 'invoice',
    sender: 'Sarah Jenkins',
    senderEntity: 'Apex Corp',
    title: 'Approve Q4 Marketing Budget',
    summary: 'Requesting final sign-off on the revised Q4 digital spend by EOD Thursday. Changes were made to the search engine allocation as requested.',
    time: 'Today, 10:45 AM'
  },
  {
    id: '2',
    type: 'shipping',
    sender: 'UPS Logistics',
    title: 'Reschedule Delivery for Order #8821',
    summary: 'The delivery attempt at the main warehouse failed today due to incorrect gate code. Needs immediate update to ensure arrival tomorrow.',
    time: 'Today, 09:12 AM'
  },
  {
    id: '3',
    type: 'meeting',
    sender: 'Marcus Lee',
    title: 'Sync: Website Refresh Feedback',
    summary: 'Invitation for tomorrow at 10:00 AM. Includes preliminary mockups for the new landing page.',
    time: 'Yesterday'
  }
];

export const DUMMY_URGENT_ITEMS = [
  {
    id: 'u1',
    sender: 'Sarah Jenkins',
    category: 'Client Dispute',
    time: '2h ago',
    text: 'The final shipment arrived with significant structural damage, and we need an immediate replacement strategy for Monday\'s launch.'
  },
  {
    id: 'u2',
    sender: 'Legal Council',
    category: 'Compliance Alert',
    time: '5h ago',
    text: 'Action required: The updated privacy regulation for Q3 requires an immediate signature on the data processing addendum.'
  }
];

export const SELECTED_EMAIL: EmailData = {
  id: 'e1',
  subject: 'Quarterly Partnership Review & Technical Onboarding',
  sender: 'Julianne Davenport',
  role: 'Lead Technical Architect @ TechFlow Solutions',
  time: 'Today, 10:42 AM',
  senderEmail: 'j.davenport@techflow.io',
  senderImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu_yeOB6BcZQh5PN22YZR_q7bLLzPrHgf9xAx5FKIh1l_Tn2u6E8I46ayWW6ThkkCc__dMXWesfa_HFbTkfcMIPTjYN2enXC1-Q313aMHpp6sVTzp__GayyVaQo3PZGcvCoiYTlsdl1PLDycGg_Q9h2khvOChk56HLF6mTMTBb9XNJLukqETk0NZoARvh6gbFoB1FZViLTsNUiJ4Bs_9fuHmW0EwOXaRQkpLfECpQXV3yJPaAGSZ1nQSmF_I-KXuV7hKHxoNeCq7c',
  summaryPoints: [
    'Julianne is requesting a review of the Q3 technical roadmap before Friday\'s executive briefing.',
    'Two major blocking issues identified in the authentication module need immediate developer attention.',
    'Invitation extended for a partner-only networking event in San Francisco next month.',
    'Attached technical specs for the new API integration require your signature by end of week.'
  ],
  originalText: `Hi team,

I hope you’re all having a great week. I’ve just finished reviewing the Q3 technical roadmap and I’d like to sync up before our executive briefing this Friday. There are a few points where our alignment is critical, especially regarding the timeline for the v2 rollout.

Specifically, the authentication module is currently showing two critical bugs that I believe are blockers for the beta release. We need to triage these immediately. Can your dev lead take a look at the attached logs?

On a lighter note, I'd love to invite you all to our Partner Gala in San Francisco on the 15th of next month. It would be a great chance to catch up in person.

Please find the API integration documents attached. We need your signature on the MOU by EOD Friday to stay on track.

Best regards,
Julianne Davenport
Lead Technical Architect, TechFlow Solutions
San Francisco, CA`
};
