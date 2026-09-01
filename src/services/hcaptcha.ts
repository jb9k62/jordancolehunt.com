/**
 * hCaptcha verification.
 * Ported from the NestJS HcaptchaService to a plain module for Fastify.
 */
import { verify } from 'hcaptcha';

const SECRET = process.env.HCAPTCHA_SECRET || '';

interface VerifyResult {
  success?: boolean;
  'error-codes'?: string[];
}

/**
 * Verifies an hCaptcha token from the client.
 * @throws Error('hcaptcha:bad_request') / Error('hcaptcha:failed') / Error('hcaptcha:internal')
 */
export async function verifyHcaptcha(token?: string, remoteIp?: string): Promise<void> {
  if (!SECRET) {
    throw new Error('hcaptcha:internal');
  }

  if (!token) {
    const err = new Error('hCaptcha token is required') as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }

  try {
    const data = (await verify(SECRET, token, remoteIp)) as VerifyResult;

    if (!data.success) {
      console.error('hCaptcha verification failed:', data['error-codes']);
      const err = new Error('Captcha verification failed. Please try again.') as Error & { statusCode?: number };
      err.statusCode = 400;
      throw err;
    }
  } catch (error) {
    // Re-throw errors we created above
    if (error && (error as { statusCode?: number }).statusCode) {
      throw error;
    }
    console.error('Error verifying hCaptcha:', error);
    const err = new Error('Failed to verify captcha. Please try again.') as Error & { statusCode?: number };
    err.statusCode = 500;
    throw err;
  }
}
