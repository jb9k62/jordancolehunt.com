import { Controller, Post, Body, HttpCode, HttpStatus, HttpException, Req } from '@nestjs/common';
import { Request } from 'express';
import { MailService } from '../services/mail.service';
import { HcaptchaService } from '../services/hcaptcha.service';

interface ContactDto {
  name: string;
  email: string;
  message: string;
  'h-captcha-response': string;
}

@Controller('api')
export class ContactController {
  constructor(
    private readonly mailService: MailService,
    private readonly hcaptchaService: HcaptchaService
  ) { }

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactForm(@Body() body: ContactDto, @Req() request: Request) {
    const { name, email, message, 'h-captcha-response': hcaptchaToken } = body;

    // Validation
    if (!name || !email || !message) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    // Verify hCaptcha token
    // Extract remote IP for enhanced security (supports proxies)
    const remoteIp = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || request.headers['x-real-ip'] as string
      || request.socket.remoteAddress;

    await this.hcaptchaService.verifyToken(hcaptchaToken, remoteIp);

    try {
      await this.mailService.sendContactEmail(name, email, message);
      return {
        success: true,
        message: 'Message sent successfully!'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException(
        'Failed to send message. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
