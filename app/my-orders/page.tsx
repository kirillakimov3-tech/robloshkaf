'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  new:       { label: 'Новый',       color: 'bg-yellow-400 text-zinc-900', emoji: '🆕' },
  confirmed: { label: 'Подтверждён', color: 'bg-blue-500 text-white',      emoji: '✅' },
  printing:  { label: 'В печати',    color: 'bg-orange-400 text-white',    emoji: '🖨️' },
  shipped:   { label: 'Отправлен',   color: 'bg-purple-500 text-white',    emoji: '🚚' },
  done:      { label: 'Выполнен',    color: 'bg-green-500 text-white',     emoji: '🎉' },
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  items: Array<{
    id: string;
    username: string;
    shirtColor: string;
    size: string;
    nickname: string;
    previewDataUrl?: string;
  }>;
};

export default function MyOrdersPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notAuthed, setNotAuthed] = useState(false);

  useEffect(() => {
    fetch('/api/roblox/avatar', { credentials: 'include', cache: 'no-store' })
      .then(r => {
        if (r.status === 401) { setNotAuthed(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        const name = data.user?.preferred_username || data.user?.name;
        if (!name) { setNotAuthed(true); setLoading(false); return; }
        setUsername(name);
        return supabase.from('orders').select('*').eq('roblox_username', name).order('created_at', { ascending: false });
      })
      .then((res: any) => {
        if (!res) return;
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const robloxBtn = "rounded-2xl border-2 border-zinc-900 font-black transition-all shadow-[3px_3px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#18181b]";

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="mx-auto max-w-3xl">

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black" style={{ fontFamily: "'Fredoka One', sans-serif" }}>Мои заказы</h1>
            {username && <p className="mt-1 text-zinc-500 font-semibold text-sm">Roblox: {username}</p>}
          </div>
          <div className="flex gap-3">
            <Link href="/designer" className={`${robloxBtn} bg-white px-5 py-2.5 text-sm`}>Конструктор</Link>
            <Link href="/" className={`${robloxBtn} bg-white px-5 py-2.5 text-sm`}>Главная</Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border-2 border-zinc-900 bg-white p-8 text-center shadow-[3px_3px_0px_#18181b]">
            <div className="text-zinc-500 font-semibold animate-pulse">Загружаем заказы...</div>
          </div>
        ) : notAuthed ? (
          <div className="rounded-2xl border-2 border-zinc-900 bg-white p-8 text-center shadow-[3px_3px_0px_#18181b]">
            <div className="text-4xl mb-3">🔐</div>
            <div className="font-black text-lg mb-2">Нужно войти через Roblox</div>
            <p className="text-zinc-500 font-semibold text-sm mb-5">Войди на главной странице чтобы увидеть свои заказы</p>
            <Link href="/" className={`${robloxBtn} inline-flex bg-black text-white px-6 py-3`}>На главную →</Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-zinc-900 bg-white p-8 text-center shadow-[3px_3px_0px_#18181b]">
            <div className="text-4xl mb-3">📦</div>
            <div className="font-black text-lg mb-2">Заказов пока нет</div>
            <p className="text-zinc-500 font-semibold text-sm mb-5">Создай свой первый дизайн в конструкторе!</p>
            <Link href="/designer" className={`${robloxBtn} inline-flex bg-black text-white px-6 py-3`}>Открыть конструктор →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-zinc-300 text-zinc-900', emoji: '📋' };
              return (
                <div key={order.id} className="rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-[3px_3px_0px_#18181b]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-black text-sm text-zinc-500">Заказ #{order.id.slice(0, 8)}</div>
                      <div className="text-xs text-zinc-400 font-semibold mt-0.5">{new Date(order.created_at).toLocaleString('ru-RU')}</div>
                    </div>
                    <span className={`rounded-xl px-3 py-1.5 text-sm font-black ${status.color}`}>
                      {status.emoji} {status.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex gap-1 mb-4">
                    {['new', 'confirmed', 'printing', 'shipped', 'done'].map((s, i) => {
                      const steps = ['new', 'confirmed', 'printing', 'shipped', 'done'];
                      const currentIdx = steps.indexOf(order.status);
                      const isDone = i <= currentIdx;
                      return (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${isDone ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
                      );
                    })}
                  </div>

                  <div className="grid gap-3">
                    {order.items.map((item, i) => (
                      <div key={item.id || i} className="flex gap-3 items-center">
                        {item.previewDataUrl ? (
                          <img src={item.previewDataUrl} alt="превью" className="h-16 w-16 rounded-xl border-2 border-zinc-900 object-contain bg-zinc-50 shrink-0" />
                        ) : (
                          <div className="h-16 w-16 rounded-xl border-2 border-zinc-900 bg-zinc-100 shrink-0 flex items-center justify-center text-2xl">👕</div>
                        )}
                        <div>
                          <div className="font-black text-sm">{item.username}</div>
                          <div className="text-xs font-semibold text-zinc-500">{item.shirtColor === 'white' ? 'Белая' : 'Чёрная'} · {item.size}</div>
                          {item.nickname && <div className="text-xs font-semibold text-zinc-400">Никнейм: {item.nickname}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
