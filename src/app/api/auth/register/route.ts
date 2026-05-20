import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createVerificationToken } from '@/lib/token';
import { sendVerificationEmail } from '@/lib/mail';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rateLimiter';
import { validateOrigin } from '@/lib/csrf';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterInput = z.infer<typeof registerSchema>;

export async function POST(request: Request) {
  try {
    const csrf = validateOrigin(request);
    if (csrf.error) return csrf.error;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    try {
      await enforceRateLimit(ip, 'register');
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

    const body = (await request.json()) as RegisterInput;
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const name = parsed.data.name.trim();
    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.emailVerified) {
        return NextResponse.json({ message: 'Check your email to verify your account' }, { status: 200 });
      }
      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashed },
      });
      const token = await createVerificationToken(existing.email);
      await sendVerificationEmail(existing.email, token);
      logger.info('Resent verification email for existing user', { email });
      return NextResponse.json({ message: 'Check your email to verify your account' }, { status: 200 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true },
    });

    const token = await createVerificationToken(newUser.email);
    await sendVerificationEmail(newUser.email, token);

    logger.info('User registered', { userId: newUser.id });
    return NextResponse.json({ message: 'Check your email to verify your account' }, { status: 201 });
  } catch (error) {
    logger.error('Register error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
