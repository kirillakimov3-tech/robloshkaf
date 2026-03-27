import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('roblox_access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userInfoRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!userInfoRes.ok) {
      const text = await userInfoRes.text();
      throw new Error(`userinfo failed: ${text}`);
    }

    const userInfo = await userInfoRes.json();
    const userId = userInfo.sub;

    const headshotUrl = new URL('https://thumbnails.roblox.com/v1/users/avatar-headshot');
    headshotUrl.searchParams.set('userIds', String(userId));
    headshotUrl.searchParams.set('size', '720x720');
    headshotUrl.searchParams.set('format', 'Png');
    headshotUrl.searchParams.set('isCircular', 'false');

    const fullAvatarUrl = new URL('https://thumbnails.roblox.com/v1/users/avatar');
    fullAvatarUrl.searchParams.set('userIds', String(userId));
    fullAvatarUrl.searchParams.set('size', '720x720');
    fullAvatarUrl.searchParams.set('format', 'Png');
    fullAvatarUrl.searchParams.set('isCircular', 'false');

    const [headshotRes, fullAvatarRes] = await Promise.all([
      fetch(headshotUrl.toString(), { cache: 'no-store' }),
      fetch(fullAvatarUrl.toString(), { cache: 'no-store' }),
    ]);

    if (!headshotRes.ok) {
      const text = await headshotRes.text();
      throw new Error(`headshot thumbnail failed: ${text}`);
    }

    if (!fullAvatarRes.ok) {
      const text = await fullAvatarRes.text();
      throw new Error(`full avatar thumbnail failed: ${text}`);
    }

    const headshotData = await headshotRes.json();
    const fullAvatarData = await fullAvatarRes.json();

    const headshotImageUrl = headshotData?.data?.[0]?.imageUrl || null;
    const fullAvatarImageUrl = fullAvatarData?.data?.[0]?.imageUrl || null;

    return NextResponse.json({
      user: userInfo,
      headshotUrl: headshotImageUrl,
      fullAvatarUrl: fullAvatarImageUrl,
      avatarUrl: headshotImageUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load avatar' }, { status: 500 });
  }
}