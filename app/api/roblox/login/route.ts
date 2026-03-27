import { NextResponse } from 'next/server';
import { buildRobloxAuthUrl } from '@/lib/roblox';

export async function GET() {
  const state = crypto.randomUUID();
  const url = buildRobloxAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set('roblox_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}