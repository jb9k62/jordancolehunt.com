import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { MailService } from '../services/mail.service';

interface ContactDto {
  name: string;
  email: string;
  message: string;
}

@Controller('api')
export class ContactController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactForm(@Body() body: ContactDto) {
    const { name, email, message } = body;

    // Validation
    if (!name || !email || !message) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

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
