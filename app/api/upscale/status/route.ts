import { NextRequest, NextResponse } from 'next/server';
 
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ error: 'No taskId' }, { status: 400 });
 
  const res = await fetch(`https://api.kie.ai/api/v1/jobs/taskDetail?taskId=${taskId}`, {
    headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` },
  });
  const data = await res.json();
  const status = data?.data?.status;
  const url = data?.data?.output?.imageUrl || data?.data?.output?.[0]?.url;
 
  return NextResponse.json({ status, url });
}
 