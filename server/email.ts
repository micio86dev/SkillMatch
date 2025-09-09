import sgMail = require('@sendgrid/mail');

import type { User } from '../shared/schema';
import { translateMessage } from './translations';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not found. Email notifications will be disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email would be sent:', { to, subject });
    return false;
  }

  try {
    const msg = {
      to,
      from: {
        email: 'noreply@vibesync.app',
        name: 'VibeSync'
      },
      subject,
      html
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}