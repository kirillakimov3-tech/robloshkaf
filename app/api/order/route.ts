import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address, comment, items } = body;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kirillakimov3@gmail.com';

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const itemsHtml = items.map((item: any, i: number) => `
      <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'}">
        <td style="padding:10px;border:1px solid #e5e7eb">${item.username}</td>
        <td style="padding:10px;border:1px solid #e5e7eb">${item.shirtColor === 'white' ? 'Белая' : 'Чёрная'}</td>
        <td style="padding:10px;border:1px solid #e5e7eb">${item.size}</td>
        <td style="padding:10px;border:1px solid #e5e7eb">${item.nickname || '—'}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
        
        <div style="background:#18181b;padding:24px 32px;border-radius:16px 16px 0 0">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px">
            🛒 Новый заказ — Роблошкаф
          </h1>
          <p style="color:#a1a1aa;margin:6px 0 0;font-size:14px">
            ${new Date().toLocaleString('ru-RU')}
          </p>
        </div>

        <div style="padding:32px;border:2px solid #18181b;border-top:none;border-radius:0 0 16px 16px">

          <div style="background:#ffd93d;border:2px solid #18181b;border-radius:12px;padding:20px;margin-bottom:24px">
            <h2 style="margin:0 0 16px;font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:1px">
              👤 Данные покупателя
            </h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;font-weight:700;width:140px">Имя и фамилия:</td><td style="padding:6px 0">${name}</td></tr>
              <tr><td style="padding:6px 0;font-weight:700">Телефон:</td><td style="padding:6px 0">${phone}</td></tr>
              <tr><td style="padding:6px 0;font-weight:700">Email:</td><td style="padding:6px 0">${email}</td></tr>
              <tr><td style="padding:6px 0;font-weight:700">Адрес:</td><td style="padding:6px 0">${address}</td></tr>
              ${comment ? `<tr><td style="padding:6px 0;font-weight:700">Комментарий:</td><td style="padding:6px 0">${comment}</td></tr>` : ''}
            </table>
          </div>

          <h2 style="margin:0 0 12px;font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:1px">
            👕 Товары (${items.length} шт.)
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#18181b;color:#ffffff">
                <th style="padding:10px;border:1px solid #18181b;text-align:left">Аккаунт</th>
                <th style="padding:10px;border:1px solid #18181b;text-align:left">Цвет</th>
                <th style="padding:10px;border:1px solid #18181b;text-align:left">Размер</th>
                <th style="padding:10px;border:1px solid #18181b;text-align:left">Никнейм</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="background:#f4f4f5;border-radius:12px;padding:16px;font-size:13px;color:#71717a">
            Заказ поступил с сайта <strong>robloshkaf.vercel.app</strong>
          </div>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Роблошкаф <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `🛒 Новый заказ от ${name} — ${items.length} шт.`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
