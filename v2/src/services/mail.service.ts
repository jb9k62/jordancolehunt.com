import { Injectable } from '@nestjs/common';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailService {
  private mg: any;
  private domain: string;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '',
    });
    this.domain = process.env.MAILGUN_DOMAIN || '';
  }

  async sendContactEmail(name: string, email: string, message: string) {
    const messageData = {
      from: `${name} <mailgun@${this.domain}>`,
      to: 'hi@jordancolehunt.com',
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    return await this.mg.messages.create(this.domain, messageData);
  }
}
