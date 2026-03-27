export const ROBLOX_OAUTH_AUTHORIZE_URL = 'https://apis.roblox.com/oauth/v1/authorize';
export const ROBLOX_OAUTH_TOKEN_URL = 'https://apis.roblox.com/oauth/v1/token';

export function buildRobloxAuthUrl(state: string) {
  console.log('ROBLOX_CLIENT_ID:', process.env.ROBLOX_CLIENT_ID);
  console.log('ROBLOX_REDIRECT_URI:', process.env.ROBLOX_REDIRECT_URI);

  const params = new URLSearchParams({
    client_id: process.env.ROBLOX_CLIENT_ID || '',
    redirect_uri: process.env.ROBLOX_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'openid profile',
    state,
  });

  const url = `${ROBLOX_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
  console.log('ROBLOX_AUTH_URL:', url);

  return url;
}

export async function exchangeCodeForToken(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.ROBLOX_CLIENT_ID || '',
    client_secret: process.env.ROBLOX_CLIENT_SECRET || '',
    redirect_uri: process.env.ROBLOX_REDIRECT_URI || '',
  });

  const res = await fetch(ROBLOX_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return res.json();
}