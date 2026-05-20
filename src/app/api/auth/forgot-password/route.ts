import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/token';
import { sendPasswordResetEmail } from '@/lib/mail';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rateLimiter';
import { validateOrigin } from '@/lib/csrf';

const forgotSchema = z.object({
  email: z.string().email('Invalid email'),
});

type ForgotInput = z.infer<typeof forgotSchema>;

export async function POST(request: Request) {
  try {
    const csrf = validateOrigin(request);
    if (csrf.error) return csrf.error;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    try {
      await enforceRateLimit(ip, 'forgot-password');
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

    const body = (await request.json()) as ForgotInput;
    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = await createPasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
    }

    logger.info('Forgot password request processed', { email: user?.email ?? 'unknown' });
    return NextResponse.json({ message: 'If the email exists, a reset link has been sent' }, { status: 200 });
  } catch (error) {
    logger.error('Forgot password error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
