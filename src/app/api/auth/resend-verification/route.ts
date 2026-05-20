import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createVerificationToken } from '@/lib/token';
import { sendVerificationEmail } from '@/lib/mail';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rateLimiter';

const resendSchema = z.object({
  email: z.string().email('Invalid email'),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    try {
      await enforceRateLimit(ip, 'resend-verification');
    } catch (e) {
      const err = e as { status?: number };
      if (err.status === 429) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429 }
        );
      }
      throw e;
    }

    const body = await request.json();
    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return NextResponse.json({ message: 'If the account exists, a verification email has been sent' }, { status: 200 });
    }

    const token = await createVerificationToken(email);
    await sendVerificationEmail(email, token);

    logger.info('Verification email resent', { email });
    return NextResponse.json({ message: 'If the account exists, a verification email has been sent' }, { status: 200 });
  } catch (error) {
    logger.error('Resend verification error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}