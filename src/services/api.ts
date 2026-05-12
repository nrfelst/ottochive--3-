export async function classifyEmail(text: string) {
  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Classification failed');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { label: 'ERROR', confidence: 0 };
  }
}

export async function getEmails() {
  try {
    const response = await fetch('/api/emails');
    if (!response.ok) throw new Error('Failed to fetch emails');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function getHealth() {
  try {
    const response = await fetch('/api/health');
    return await response.json();
  } catch {
    return { status: 'down' };
  }
}

export async function getConfig(): Promise<{ configured: boolean; email?: string; provider?: string; demo?: boolean; demoOnly?: boolean }> {
  try {
    const response = await fetch('/api/config');
    return await response.json();
  } catch {
    return { configured: false };
  }
}

export async function saveConfig(config: {
  email: string;
  password: string;
  imapServer: string;
  imapPort: number;
  provider: string;
}): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await response.json();
  } catch {
    return { success: false };
  }
}

export async function deleteConfig(): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/config', { method: 'DELETE' });
    return await response.json();
  } catch {
    return { success: false };
  }
}

export async function draftReply(
  emailBody: string,
  label: string,
  senderName: string
): Promise<{ draft?: string; error?: string }> {
  try {
    const response = await fetch('/api/draft-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailBody, label, senderName }),
    });
    return await response.json();
  } catch {
    return { error: 'Network error — could not reach the server.' };
  }
}

export async function testConnection(
  email: string,
  password: string,
  imapServer: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, imapServer }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}
