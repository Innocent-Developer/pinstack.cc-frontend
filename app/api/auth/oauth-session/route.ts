import { NextRequest, NextResponse } from 'next/server';

/**
 * One-shot handoff after Google OAuth.
 * Reads the short-lived httpOnly oauth_session cookie set by /api/auth/google/callback,
 * returns token+user to the client, then clears the cookie.
 */
export async function GET(req: NextRequest) {
  const raw = req.cookies.get('oauth_session')?.value;
  if (!raw) {
    return NextResponse.json({ success: false, message: 'No pending Google session' }, { status: 401 });
  }

  try {
    const parsed = JSON.parse(raw) as {
      token?: string;
      user?: { id: string; name: string; email: string; isVerified?: boolean };
    };

    if (!parsed.token || !parsed.user?.id || !parsed.user?.email) {
      const res = NextResponse.json({ success: false, message: 'Invalid session payload' }, { status: 400 });
      res.cookies.set('oauth_session', '', { httpOnly: true, path: '/', maxAge: 0 });
      return res;
    }

    const res = NextResponse.json({
      success: true,
      token: parsed.token,
      user: {
        id: parsed.user.id,
        name: parsed.user.name,
        email: parsed.user.email,
        isVerified: parsed.user.isVerified ?? true,
      },
    });

    res.cookies.set('oauth_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return res;
  } catch {
    const res = NextResponse.json({ success: false, message: 'Corrupt session cookie' }, { status: 400 });
    res.cookies.set('oauth_session', '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
  }
}
