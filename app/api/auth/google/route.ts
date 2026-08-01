import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function clientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || '';
}

function redirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    'https://www.pinstack.cc/api/auth/google/callback'
  );
}

/** GET /api/auth/google — start Google OAuth */
export async function GET(req: NextRequest) {
  const id = clientId();
  if (!id) {
    return NextResponse.redirect(
      new URL('/login?error=google_not_configured', req.url)
    );
  }

  const next = req.nextUrl.searchParams.get('next') || '/dashboard';
  const safeNext = next.startsWith('/') ? next : '/dashboard';
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  res.cookies.set('oauth_next', safeNext, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return res;
}
