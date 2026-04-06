import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 минут для Vercel Pro, 60 сек для Free

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json();

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  const formData = new FormData();
  formData.append('image', base64Data);
  formData.append('key', process.env.IMGBB_API_KEY!);

  const uploadRes = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadData = await uploadRes.json();
  const imageUrl = uploadData?.data?.url;
  if (!imageUrl) return NextResponse.json({ error: 'Failed to upload image', detail: uploadData }, { status: 500 });

  const taskRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'recraft/crisp-upscale',
      input: { image: imageUrl },
    }),
  });

  const taskData = await taskRes.json();
  const taskId = taskData?.data?.taskId;
  if (!taskId) return NextResponse.json({ error: 'Failed to create task', detail: taskData }, { status: 500 });

  // Polling — 50 попыток по 1 секунде
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statusRes = await fetch(`https://api.kie.ai/api/v1/jobs/taskDetail?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` },
    });
  const statusData = await statusRes.json();
    const status = statusData?.data?.status;
    console.log(`Poll ${i}:`, JSON.stringify(statusData?.data));
    if (status === 'succeed') {
      const url = statusData?.data?.output?.imageUrl || statusData?.data?.output?.[0]?.url;
      return NextResponse.json({ url });
    }
    if (status === 'failed') return NextResponse.json({ error: 'Upscale failed', detail: statusData }, { status: 500 });
  }

  return NextResponse.json({ error: 'Timeout' }, { status: 504 });
}