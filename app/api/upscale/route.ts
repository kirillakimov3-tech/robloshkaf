import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json();

  // Загружаем изображение на временный хостинг через KIE
  const uploadRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'recraft/crisp-upscale',
      input: { image: imageBase64 },
    }),
  });

  const uploadData = await uploadRes.json();
  const taskId = uploadData?.data?.taskId;
  if (!taskId) return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });

  // Polling — ждём результат (до 60 секунд)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`https://api.kie.ai/api/v1/jobs/taskDetail?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` },
    });
    const statusData = await statusRes.json();
    const status = statusData?.data?.status;
    if (status === 'succeed') {
      const url = statusData?.data?.output?.imageUrl || statusData?.data?.output?.[0]?.url;
      return NextResponse.json({ url });
    }
    if (status === 'failed') return NextResponse.json({ error: 'Upscale failed' }, { status: 500 });
  }

  return NextResponse.json({ error: 'Timeout' }, { status: 504 });
}