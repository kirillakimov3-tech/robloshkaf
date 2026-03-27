'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Order = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  comment?: string;
  status: string;
  items: Array<{
    id: string;
    username: string;
    shirtColor: 'white' | 'black';
    size: string;
    nickname: string;
    nicknameSize: number;
    avatarType: string;
    previewDataUrl?: string;
  }>;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новый',       color: 'bg-yellow-400 text-zinc-900' },
  confirmed:  { label: 'Подтверждён', color: 'bg-blue-500 text-white' },
  printing:   { label: 'В печати',    color: 'bg-orange-400 text-white' },
  shipped:    { label: 'Отправлен',   color: 'bg-purple-500 text-white' },
  done:       { label: 'Выполнен',    color: 'bg-green-500 text-white' },
};

const ADMIN_USERNAME = 'kadralievm';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Проверяем авторизацию через Roblox сессию
    fetch('/api/roblox/avatar', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const username = data?.user?.preferred_username || data?.user?.name;
        if (username === ADMIN_USERNAME) {
          setAuthorized(true);
          loadOrders();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const downloadMockup = (item: any) => {
    if (!item.previewDataUrl) return alert('Нет превью для этого товара');
    const link = document.createElement('a');
    link.download = `mockup-${item.username}-${item.size}.png`;
    link.href = item.previewDataUrl;
    link.click();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white font-black text-xl animate-pulse">Загрузка...</div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 p-10 text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-white mb-2">Доступ закрыт</h1>
          <p className="text-zinc-400 font-semibold mb-6">Эта страница только для администратора</p>
          <a href="/" className="inline-flex rounded-xl border-2 border-zinc-700 bg-zinc-800 px-6 py-3 font-black text-white hover:bg-zinc-700 transition">
            На главную
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div className="border-b-2 border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E02020] border-2 border-zinc-700">
            <span className="text-sm font-black">А</span>
          </div>
          <div>
            <div className="font-black text-lg leading-none" style={{ fontFamily: "'Fredoka One', sans-serif" }}>Роблошкаф — Админка</div>
            <div className="text-xs text-zinc-500 font-semibold">{orders.length} заказов всего</div>
          </div>
        </div>
        <a href="/" className="rounded-xl border-2 border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-black hover:bg-zinc-700 transition">
          На сайт →
        </a>
      </div>

      <div className="flex h-[calc(100vh-65px)]">

        {/* Sidebar — список заказов */}
        <div className="w-80 border-r-2 border-zinc-800 flex flex-col shrink-0">
          {/* Фильтры */}
          <div className="p-3 border-b border-zinc-800 flex flex-wrap gap-1.5">
            {[['all', 'Все'], ...Object.entries(STATUS_LABELS).map(([k, v]) => [k, v.label])].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-black transition ${
                  filter === key ? 'bg-yellow-400 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Список */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 font-semibold text-sm">Заказов нет</div>
            ) : filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className={`w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-900 transition ${
                  selected?.id === order.id ? 'bg-zinc-800' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm truncate">{order.name}</span>
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ml-2 shrink-0 ${STATUS_LABELS[order.status]?.color || 'bg-zinc-700 text-white'}`}>
                    {STATUS_LABELS[order.status]?.label || order.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-semibold">{order.items.length} шт. · {order.items.map(i => i.size).join(', ')}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{new Date(order.created_at).toLocaleString('ru-RU')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Детали заказа */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-zinc-600 font-semibold">
              Выбери заказ из списка
            </div>
          ) : (
            <div className="max-w-2xl space-y-5">

              {/* Статус */}
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-black text-xl" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
                  Заказ #{selected.id.slice(0, 8)}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selected.id, key)}
                      className={`rounded-xl border-2 border-zinc-700 px-3 py-1.5 text-xs font-black transition ${
                        selected.status === key ? color : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Покупатель */}
              <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 p-5">
                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400 mb-4">👤 Покупатель</h3>
                <div className="space-y-2">
                  {[
                    ['Имя', selected.name],
                    ['Телефон', selected.phone],
                    ['Email', selected.email],
                    ['Адрес', selected.address],
                    ['Дата', new Date(selected.created_at).toLocaleString('ru-RU')],
                    ...(selected.comment ? [['Комментарий', selected.comment]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-sm font-black text-zinc-500 w-28 shrink-0">{k}:</span>
                      <span className="text-sm font-semibold text-zinc-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Товары */}
              <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 p-5">
                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400 mb-4">👕 Товары ({selected.items.length} шт.)</h3>
                <div className="space-y-4">
                  {selected.items.map((item, i) => (
                    <div key={item.id || i} className="rounded-xl border-2 border-zinc-700 bg-zinc-800 p-4 flex gap-4">
                      {item.previewDataUrl && (
                        <img
                          src={item.previewDataUrl}
                          alt="превью"
                          className="h-24 w-24 rounded-xl border-2 border-zinc-600 object-contain bg-zinc-700 shrink-0"
                        />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="font-black">{item.username}</div>
                        <div className="text-sm text-zinc-400 font-semibold">
                          {item.shirtColor === 'white' ? 'Белая' : 'Чёрная'} · {item.size}
                        </div>
                        {item.nickname && (
                          <div className="text-sm text-zinc-400 font-semibold">Никнейм: {item.nickname}</div>
                        )}
                        <button
                          onClick={() => downloadMockup(item)}
                          className="mt-2 inline-flex rounded-xl border-2 border-yellow-400 bg-yellow-400 text-zinc-900 px-3 py-1.5 text-xs font-black hover:bg-yellow-300 transition"
                        >
                          📥 Скачать макет
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
