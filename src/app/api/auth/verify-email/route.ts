import { NextResponse } from 'next/server';
import { z } from 'zod';
import { consumeVerificationToken } from '@/lib/token';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rateLimiter';
import { validateOrigin } from '@/lib/csrf';

const verifySchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const csrf = validateOrigin(request);
    if (csrf.error) return csrf.error;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    try {
      await enforceRateLimit(ip, 'verify-email');
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
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { token } = parsed.data;

    const email = await consumeVerificationToken(token);
    if (!email) {
      // Generic response to avoid enumeration
      return NextResponse.json({ message: 'Verification failed. Token may be expired or invalid.' }, { status: 400 });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    logger.info('Email verified', { email });
    return NextResponse.json({ message: 'Email verified' }, { status: 200 });
  } catch (error) {
    logger.error('Verify email error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
