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

    const thumbUrl = new URL('https://thumbnails.roblox.com/v1/users/avatar');
    thumbUrl.searchParams.set('userIds', String(userId));
    thumbUrl.searchParams.set('size', '420x420');
    thumbUrl.searchParams.set('format', 'Png');
    thumbUrl.searchParams.set('isCircular', 'false');

    const thumbRes = await fetch(thumbUrl.toString(), { cache: 'no-store' });

    if (!thumbRes.ok) {
      const text = await thumbRes.text();
      throw new Error(`thumbnail failed: ${text}`);
    }

    const thumbData = await thumbRes.json();
    const imageUrl = thumbData?.data?.[0]?.imageUrl || null;

    return NextResponse.json({
      user: userInfo,
      avatarUrl: imageUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load avatar' }, { status: 500 });
  }
}