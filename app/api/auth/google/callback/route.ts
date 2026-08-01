import { NextRequest, NextResponse } from 'next/server';

function clientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || '';
}

function clientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
}

function redirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    'https://www.pinstack.cc/api/auth/google/callback'
  );
}

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'https://api.pinstack.cc/api'
  ).replace(/\/$/, '');
}

function siteOrigin(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (configured) return configured;
  return req.nextUrl.origin;
}

/** GET /api/auth/google/callback — exchange code, create session via backend */
export async function GET(req: NextRequest) {
  const origin = siteOrigin(req);
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, origin));

  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const oauthError = req.nextUrl.searchParams.get('error');

    if (oauthError) {
      return fail(oauthError === 'access_denied' ? 'google_cancelled' : 'google_failed');
    }

    const savedState = req.cookies.get('oauth_state')?.value;
    const nextPath = req.cookies.get('oauth_next')?.value || '/dashboard';

    if (!code || !state || !savedState || state !== savedState) {
      return fail('google_state_mismatch');
    }

    const id = clientId();
    const secret = clientSecret();
    if (!id || !secret) {
      return fail('google_not_configured');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: id,
        client_secret: secret,
        redirect_uri: redirectUri(),
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json().catch(() => ({}))) as {
      id_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenData.id_token) {
      console.error('Google token exchange failed:', tokenData);
      return fail('google_token_exchange');
    }

    const backendRes = await fetch(`${apiBase()}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: tokenData.id_token }),
      cache: 'no-store',
    });

    const backendData = (await backendRes.json().catch(() => ({}))) as {
      success?: boolean;
      token?: string;
      user?: { id: string; name: string; email: string; isVerified?: boolean };
      message?: string;
    };

    if (!backendRes.ok || !backendData.success || !backendData.token || !backendData.user) {
      console.error('Backend Google login failed:', backendData);
      return fail(backendData.message || 'google_backend_failed');
    }

    // Hand token to client page via short-lived httpOnly cookie (avoids long JWT in URL)
    const safeNext = nextPath.startsWith('/') ? nextPath : '/dashboard';
    const res = NextResponse.redirect(new URL(`/auth/callback?next=${encodeURIComponent(safeNext)}`, origin));

    res.cookies.set(
      'oauth_session',
      encodeURIComponent(JSON.stringify({ token: backendData.token, user: backendData.user })),
      {
        httpOnly: false, // client must read for localStorage setAuth
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 120,
        path: '/',
      }
    );
    res.cookies.delete('oauth_state');
    res.cookies.delete('oauth_next');

    return res;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return fail('google_failed');
  }
}
