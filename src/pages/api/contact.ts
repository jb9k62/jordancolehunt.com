import { NextApiRequest, NextApiResponse } from 'next';
import formData from "form-data"
import Mailgun from 'mailgun.js';

interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: string } | { message: string }>
) {
  if (req.method !== 'POST') {
    // Only allow POST requests
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY as string,
  });

  const { name, email, message } = req.body as ContactRequestBody;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and message.' });
  }

  const data = {
    from: email.toLowerCase().replaceAll(' ', ''),
    to: 'hi@jordancolehunt.com',
    subject: `Hello from ${name}!`,
    text: message,
  };

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN as string, data);
    res.status(200).json({ message: 'Your contact information has been received.' });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'An error occurred while sending your message.' });
  }
}
