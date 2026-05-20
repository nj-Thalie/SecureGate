import { Resend } from 'resend';
import { logger } from './logger';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error('Missing RESEND_FROM_EMAIL');
  return { client: new Resend(apiKey), from };
}

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const verificationLink = `${process.env.APP_URL}/auth?mode=verify-email&token=${token}`;
    const { client, from } = getResend();
    await client.emails.send({
      from,
      to: email,
      subject: 'Verify your SecureGate account',
      html: `<p>Please verify your email by clicking the link below. This link expires in 15 minutes.</p><p><a href="${verificationLink}">Verify Email</a></p>`,
    });
  } catch (error) {
    logger.error('Failed to send verification email', { error });
    throw new Error('Failed to send email');
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const resetLink = `${process.env.APP_URL}/auth?mode=reset-password&token=${token}`;
    const { client, from } = getResend();
    await client.emails.send({
      from,
      to: email,
      subject: 'SecureGate password reset',
      html: `<p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p><p><a href="${resetLink}">Reset Password</a></p>`,
    });
  } catch (error) {
    logger.error('Failed to send password reset email', { error });
    throw new Error('Failed to send email');
  }
};
