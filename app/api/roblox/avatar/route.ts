import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('roblox_access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userInfoRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!userInfoRes.ok) throw new Error(`userinfo failed: ${await userInfoRes.text()}`);

    const userInfo = await userInfoRes.json();
    const userId = userInfo.sub;

    // Headshot — голова
    const headshotUrl = new URL('https://thumbnails.roblox.com/v1/users/avatar-headshot');
    headshotUrl.searchParams.set('userIds', String(userId));
    headshotUrl.searchParams.set('size', '720x720');
    headshotUrl.searchParams.set('format', 'Png');
    headshotUrl.searchParams.set('isCircular', 'false');

    // Стандартная поза
    const fullAvatarUrl = new URL('https://thumbnails.roblox.com/v1/users/avatar');
    fullAvatarUrl.searchParams.set('userIds', String(userId));
    fullAvatarUrl.searchParams.set('size', '720x720');
    fullAvatarUrl.searchParams.set('format', 'Png');
    fullAvatarUrl.searchParams.set('isCircular', 'false');

    // Динамичная поза (AvatarFull с type=AvatarThumbnailType.FullBodyShot)
    // Roblox возвращает позу из анимации пользователя если она есть
    const actionAvatarUrl = new URL('https://thumbnails.roblox.com/v1/users/avatar');
    actionAvatarUrl.searchParams.set('userIds', String(userId));
    actionAvatarUrl.searchParams.set('size', '720x720');
    actionAvatarUrl.searchParams.set('format', 'Png');
    actionAvatarUrl.searchParams.set('isCircular', 'false');
    actionAvatarUrl.searchParams.set('thumbnailType', 'AvatarFull');

    const [headshotRes, fullAvatarRes, actionAvatarRes] = await Promise.all([
      fetch(headshotUrl.toString(), { cache: 'no-store' }),
      fetch(fullAvatarUrl.toString(), { cache: 'no-store' }),
      fetch(actionAvatarUrl.toString(), { cache: 'no-store' }),
    ]);

    const headshotData = headshotRes.ok ? await headshotRes.json() : null;
    const fullAvatarData = fullAvatarRes.ok ? await fullAvatarRes.json() : null;
    const actionAvatarData = actionAvatarRes.ok ? await actionAvatarRes.json() : null;

    const headshotImageUrl = headshotData?.data?.[0]?.imageUrl || null;
    const fullAvatarImageUrl = fullAvatarData?.data?.[0]?.imageUrl || null;
    const actionAvatarImageUrl = actionAvatarData?.data?.[0]?.imageUrl || null;

    return NextResponse.json({
      user: userInfo,
      headshotUrl: headshotImageUrl,
      fullAvatarUrl: actionAvatarImageUrl || fullAvatarImageUrl,
      avatarUrl: headshotImageUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load avatar' }, { status: 500 });
  }
}
