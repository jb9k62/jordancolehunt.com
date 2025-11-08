import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { verify } from 'hcaptcha';

@Injectable()
export class HcaptchaService {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.HCAPTCHA_SECRET;

    if (!this.secret) {
      throw new Error('HCAPTCHA_SECRET is not defined in environment variables');
    }
  }

  /**
   * Verifies an hCaptcha token from the client
   * @param token - The hCaptcha response token from the client
   * @param remoteIp - Optional remote IP address for enhanced security
   * @returns Promise that resolves if verification succeeds
   * @throws HttpException if verification fails
   */
  async verifyToken(token: string, remoteIp?: string): Promise<void> {
    if (!token) {
      throw new HttpException(
        'hCaptcha token is required',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const data = await verify(this.secret, token, remoteIp);

      if (!data.success) {
        console.error('hCaptcha verification failed:', data['error-codes']);
        throw new HttpException(
          'Captcha verification failed. Please try again.',
          HttpStatus.BAD_REQUEST
        );
      }

      // Verification successful
      return;
    } catch (error) {
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise, log the error and throw a generic error
      console.error('Error verifying hCaptcha:', error);
      throw new HttpException(
        'Failed to verify captcha. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
