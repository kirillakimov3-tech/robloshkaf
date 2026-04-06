import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/roblox';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = req.cookies.get('roblox_oauth_state')?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL('/?error=oauth_state', req.url));
  }

  try {
    const tokenData = await exchangeCodeForToken(code);

    const response = NextResponse.redirect(new URL('/designer', req.url));

    response.cookies.set('roblox_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenData.expires_in || 3600,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/?error=oauth_callback', req.url));
  }
}