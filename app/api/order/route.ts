import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address, comment, robloxUsername, items } = body;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({ name, phone, email, address, comment, roblox_username: robloxUsername, items })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kirillakimov3@gmail.com';

    if (RESEND_API_KEY) {
      const itemsHtml = items.map((item: any, i: number) => `
        <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'}">
          <td style="padding:10px;border:1px solid #e5e7eb">${item.username}</td>
          <td style="padding:10px;border:1px solid #e5e7eb">${item.shirtColor === 'white' ? 'Белая' : 'Чёрная'}</td>
          <td style="padding:10px;border:1px solid #e5e7eb">${item.size}</td>
          <td style="padding:10px;border:1px solid #e5e7eb">${item.nickname || '—'}</td>
        </tr>
      `).join('');

      const html = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#18181b;padding:24px 32px;border-radius:16px 16px 0 0">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900">🛒 Новый заказ — Роблошкаф</h1>
            <p style="color:#a1a1aa;margin:6px 0 0;font-size:14px">${new Date().toLocaleString('ru-RU')} · ID: ${order.id}</p>
          </div>
          <div style="padding:32px;border:2px solid #18181b;border-top:none;border-radius:0 0 16px 16px">
            <div style="background:#ffd93d;border:2px solid #18181b;border-radius:12px;padding:20px;margin-bottom:24px">
              <h2 style="margin:0 0 12px;font-size:16px;font-weight:900">👤 Данные покупателя</h2>
              <table style="width:100%">
                <tr><td style="padding:5px 0;font-weight:700;width:140px">Имя:</td><td>${name}</td></tr>
                <tr><td style="padding:5px 0;font-weight:700">Телефон:</td><td>${phone}</td></tr>
                <tr><td style="padding:5px 0;font-weight:700">Email:</td><td>${email}</td></tr>
                <tr><td style="padding:5px 0;font-weight:700">Адрес:</td><td>${address}</td></tr>
                <tr><td style="padding:5px 0;font-weight:700">Roblox:</td><td>${robloxUsername || '—'}</td></tr>
                ${comment ? `<tr><td style="padding:5px 0;font-weight:700">Комментарий:</td><td>${comment}</td></tr>` : ''}
              </table>
            </div>
            <h2 style="margin:0 0 12px;font-size:16px;font-weight:900">👕 Товары (${items.length} шт.)</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <thead>
                <tr style="background:#18181b;color:#fff">
                  <th style="padding:10px;border:1px solid #18181b;text-align:left">Аккаунт</th>
                  <th style="padding:10px;border:1px solid #18181b;text-align:left">Цвет</th>
                  <th style="padding:10px;border:1px solid #18181b;text-align:left">Размер</th>
                  <th style="padding:10px;border:1px solid #18181b;text-align:left">Никнейм</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <a href="https://robloshkaf.vercel.app/admin" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:12px;font-weight:900;text-decoration:none">
              Открыть в админке →
            </a>
          </div>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Роблошкаф <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `🛒 Новый заказ от ${name} — ${items.length} шт.`,
          html,
        }),
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
