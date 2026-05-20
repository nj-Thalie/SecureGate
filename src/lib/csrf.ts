import { NextResponse } from 'next/server';

export function validateOrigin(request: Request): { error: NextResponse | null } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const allowedOrigin = process.env.APP_URL || 'http://localhost:3000';

  if (origin && origin !== allowedOrigin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  if (!origin && referer && !referer.startsWith(allowedOrigin)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { error: null };
}
