import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private accountId: string | null = null;

  private readonly clientId = process.env.ZOHO_CLIENT_ID || '';
  private readonly clientSecret = process.env.ZOHO_CLIENT_SECRET || '';
  private readonly refreshToken = process.env.ZOHO_REFRESH_TOKEN || '';
  private readonly fromAddress = process.env.ZOHO_FROM_ADDRESS || '';
  private readonly zohoAccountsUrl =
    process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';
  private readonly zohoMailUrl =
    process.env.ZOHO_MAIL_URL || 'https://mail.zoho.com';

  private async refreshAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.accessToken;
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(
      `${this.zohoAccountsUrl}/oauth/v2/token?${params.toString()}`,
      { method: 'POST' },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to refresh Zoho access token: ${error}`);
      throw new Error('Failed to refresh Zoho access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return this.accessToken;
  }

  private async getAccountId(): Promise<string> {
    if (this.accountId) {
      return this.accountId;
    }

    const token = await this.refreshAccessToken();

    const response = await fetch(`${this.zohoMailUrl}/api/accounts`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to get Zoho account ID: ${error}`);
      throw new Error('Failed to get Zoho account ID');
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      throw new Error('No Zoho mail accounts found');
    }

    this.accountId = data.data[0].accountId;
    return this.accountId;
  }

  async sendContactEmail(name: string, email: string, message: string) {
    const token = await this.refreshAccessToken();
    const accountId = await this.getAccountId();

    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const response = await fetch(
      `${this.zohoMailUrl}/api/accounts/${accountId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAddress: this.fromAddress,
          toAddress: 'hi@jordancolehunt.com',
          subject: `New Contact Form Submission from ${name}`,
          content: emailContent,
          mailFormat: 'html',
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to send email via Zoho: ${error}`);
      throw new Error('Failed to send email');
    }

    return await response.json();
  }
}
