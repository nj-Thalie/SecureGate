import { NextResponse } from 'next/server';
import { consumeVerificationToken } from '@/lib/token';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

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
