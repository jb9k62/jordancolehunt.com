/**
 * Zoho Mail integration via OAuth2 refresh token.
 * Ported from the NestJS MailService to a plain module for Fastify.
 */

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || '';
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || '';
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '';
const ZOHO_FROM_ADDRESS = process.env.ZOHO_FROM_ADDRESS || '';
const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';
const ZOHO_MAIL_URL = process.env.ZOHO_MAIL_URL || 'https://mail.zoho.com';

let accessToken: string | null = null;
let tokenExpiresAt = 0;
let accountId: string | null = null;

async function refreshAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (accessToken && Date.now() < tokenExpiresAt - 300000) {
    return accessToken;
  }

  const params = new URLSearchParams({
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    refresh_token: ZOHO_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  const response = await fetch(
    `${ZOHO_ACCOUNTS_URL}/oauth/v2/token?${params.toString()}`,
    { method: 'POST' },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to refresh Zoho access token: ${error}`);
    throw new Error('Failed to refresh Zoho access token');
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return accessToken as string;
}

async function getAccountId(): Promise<string> {
  if (accountId) {
    return accountId;
  }

  const token = await refreshAccessToken();

  const response = await fetch(`${ZOHO_MAIL_URL}/api/accounts`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to get Zoho account ID: ${error}`);
    throw new Error('Failed to get Zoho account ID');
  }

  const data = (await response.json()) as { data?: { accountId: string }[] };
  if (!data.data || data.data.length === 0) {
    throw new Error('No Zoho mail accounts found');
  }

  accountId = data.data[0].accountId;
  return accountId;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactEmail(name: string, email: string, message: string) {
  const token = await refreshAccessToken();
  const id = await getAccountId();

  // Escape user-supplied values so they cannot inject HTML into the email body
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');

  const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `;

  const response = await fetch(
    `${ZOHO_MAIL_URL}/api/accounts/${id}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromAddress: ZOHO_FROM_ADDRESS,
        toAddress: 'hi@jordancolehunt.com',
        subject: `New Contact Form Submission from ${safeName}`,
        content: emailContent,
        mailFormat: 'html',
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to send email via Zoho: ${error}`);
    throw new Error('Failed to send email');
  }

  return await response.json();
}
