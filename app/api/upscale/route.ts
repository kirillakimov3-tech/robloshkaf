import { NextRequest, NextResponse } from 'next/server';

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
  if (!imageUrl) return NextResponse.json({ error: 'Failed to upload', detail: uploadData }, { status: 500 });

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

  return NextResponse.json({ taskId });
}