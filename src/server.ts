import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { sendContactEmail } from './services/mail';
import { verifyHcaptcha } from './services/hcaptcha';

const PORT = Number(process.env.PORTINT || 3001);
const HOST = '127.0.0.1';
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'https://jordancolehunt.com';

const app = Fastify({ logger: true });

// Restrict cross-origin access to the production origin only (same-origin is
// always allowed). This avoids reflecting arbitrary Origins on /api/contact.
app.register(cors, { origin: ALLOWED_ORIGIN.split(',').map((o) => o.trim()) });

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  'h-captcha-response'?: string;
}

// No-store on all /api and /healthz replies
app.addHook('onSend', async (request, reply) => {
  const url = request.raw.url || '';
  if (url.startsWith('/api') || url === '/healthz') {
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');
  }
});

app.get('/healthz', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

app.post<{ Body: ContactBody }>('/api/contact', async (request, reply) => {
  const { name, email, message, 'h-captcha-response': hcaptchaToken } = request.body || {};

  // Validation
  if (!name || !email || !message) {
    return reply.code(400).send({ success: false, message: 'Missing required fields' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return reply.code(400).send({ success: false, message: 'Invalid email format' });
  }

  // Client remote IP, supporting proxies (Nginx sets these headers)
  const remoteIp =
    (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    (request.headers['x-real-ip'] as string | undefined) ||
    request.socket.remoteAddress;

  try {
    await verifyHcaptcha(hcaptchaToken, remoteIp);
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: (error as Error).message });
  }

  try {
    await sendContactEmail(name as string, email as string, message as string);
    return reply.send({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return reply
      .code(500)
      .send({ success: false, message: 'Failed to send message. Please try again later.' });
  }
});

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Fastify listening on http://${HOST}:${PORT}`);
});
