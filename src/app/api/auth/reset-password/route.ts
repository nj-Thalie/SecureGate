import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { consumePasswordResetToken } from '@/lib/token';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rateLimiter';
import { validateOrigin } from '@/lib/csrf';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export async function POST(request: Request) {
  try {
    const csrf = validateOrigin(request);
    if (csrf.error) return csrf.error;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    try {
      await enforceRateLimit(ip, 'reset-password');
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

    const body = (await request.json()) as ResetPasswordInput;
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { token, password } = parsed.data;

    const email = await consumePasswordResetToken(token);
    if (!email) {
      // Generic response to avoid token enumeration
      return NextResponse.json({ message: 'Reset password failed. Token may be expired or invalid.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    logger.info('Password reset', { email });
    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (error) {
    logger.error('Reset password error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
