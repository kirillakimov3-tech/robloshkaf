'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_PASSWORD = 'robloshkaf2026';

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

type InventoryItem = {
  id: string;
  color: string;
  size: string;
  in_stock: boolean;
  quantity: number;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новый',       color: 'bg-yellow-400 text-zinc-900' },
  confirmed: { label: 'Подтверждён', color: 'bg-blue-500 text-white' },
  printing:  { label: 'В печати',    color: 'bg-orange-400 text-white' },
  shipped:   { label: 'Отправлен',   color: 'bg-purple-500 text-white' },
  done:      { label: 'Выполнен',    color: 'bg-green-500 text-white' },
};

const SIZES = ['S', 'M', 'L', 'XL'];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [tab, setTab] = useState<'orders' | 'inventory'>('orders');

  useEffect(() => {
    // Проверяем сохранённый пароль
    const saved = localStorage.getItem('admin_authed');
    if (saved === ADMIN_PASSWORD) {
      setAuthed(true);
      loadOrders();
      loadInventory();
    }
  }, []);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState('all');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shopOpen, setShopOpen] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_authed', ADMIN_PASSWORD);
      setAuthed(true);
      setPasswordError(false);
      loadOrders();
      loadInventory();
    } else {
      setPasswordError(true);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoadingOrders(false);
  };

  const loadInventory = async () => {
    setLoadingInventory(true);
    const { data: inv } = await supabase.from('inventory').select('*');
    const { data: settings } = await supabase.from('settings').select('*');
    setInventory(inv || []);
    const shopSetting = settings?.find(s => s.key === 'shop_open');
    setShopOpen(shopSetting?.value === 'true');
    setLoadingInventory(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const updateInventory = async (id: string, field: 'in_stock' | 'quantity', value: boolean | number) => {
    await supabase.from('inventory').update({ [field]: value }).eq('id', id);
    setInventory(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleShop = async () => {
    const next = !shopOpen;
    await supabase.from('settings').update({ value: String(next) }).eq('key', 'shop_open');
    setShopOpen(next);
  };

  const downloadMockup = (item: any) => {
    if (!item.previewDataUrl) return alert('Нет превью');
    const link = document.createElement('a');
    link.download = `mockup-${item.username}-${item.size}.png`;
    link.href = item.previewDataUrl;
    link.click();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // ── LOGIN ──
  if (!authed) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
                Роблошкаф
              </h1>
              <p className="text-zinc-500 font-semibold text-sm mt-1">Вход в админку</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Введи пароль"
                className={`w-full rounded-xl border-2 px-4 py-3 bg-zinc-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                  passwordError ? 'border-red-500' : 'border-zinc-600'
                }`}
              />
              {passwordError && (
                <p className="text-red-400 text-sm font-semibold">Неверный пароль</p>
              )}
              <button
                onClick={handleLogin}
                className="w-full rounded-xl border-2 border-zinc-900 bg-[#E02020] py-3 font-black text-white shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── ADMIN ──
  return (
    <main className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div className="border-b-2 border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E02020] border-2 border-zinc-700 font-black text-sm">А</div>
          <div>
            <div className="font-black text-lg leading-none" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
              Роблошкаф — Админка
            </div>
            <div className="text-xs text-zinc-500 font-semibold">{orders.length} заказов</div>
          </div>
        </div>
        <div className="flex gap-2">
          {(['orders', 'inventory'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-black transition ${
                tab === t ? 'border-yellow-400 bg-yellow-400 text-zinc-900' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {t === 'orders' ? '📋 Заказы' : '📦 Товары'}
            </button>
          ))}
          <a href="/" className="rounded-xl border-2 border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-black hover:bg-zinc-700 transition">
            На сайт →
          </a>
        </div>
      </div>

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <div className="flex h-[calc(100vh-65px)]">
          {/* Sidebar */}
          <div className="w-80 border-r-2 border-zinc-800 flex flex-col shrink-0">
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

            <div className="overflow-y-auto flex-1">
              {loadingOrders ? (
                <div className="p-6 text-center text-zinc-500 font-semibold text-sm animate-pulse">Загрузка...</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 font-semibold text-sm">Заказов нет</div>
              ) : filtered.map(order => (
                <button
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className={`w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-900 transition ${selected?.id === order.id ? 'bg-zinc-800' : ''}`}
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

          {/* Detail */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selected ? (
              <div className="flex h-full items-center justify-center text-zinc-600 font-semibold">Выбери заказ</div>
            ) : (
              <div className="max-w-2xl space-y-5">
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

                <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 p-5">
                  <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400 mb-4">👕 Товары ({selected.items.length} шт.)</h3>
                  <div className="space-y-4">
                    {selected.items.map((item, i) => (
                      <div key={item.id || i} className="rounded-xl border-2 border-zinc-700 bg-zinc-800 p-4 flex gap-4">
                        {item.previewDataUrl && (
                          <img src={item.previewDataUrl} alt="превью" className="h-24 w-24 rounded-xl border-2 border-zinc-600 object-contain bg-zinc-700 shrink-0" />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="font-black">{item.username}</div>
                          <div className="text-sm text-zinc-400 font-semibold">
                            {item.shirtColor === 'white' ? 'Белая' : 'Чёрная'} · {item.size}
                          </div>
                          {item.nickname && <div className="text-sm text-zinc-400 font-semibold">Никнейм: {item.nickname}</div>}
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
      )}

      {/* ── INVENTORY TAB ── */}
      {tab === 'inventory' && (
        <div className="p-6 max-w-3xl">
          {/* Магазин вкл/выкл */}
          <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 p-5 mb-6 flex items-center justify-between">
            <div>
              <div className="font-black text-lg">Магазин</div>
              <div className="text-sm text-zinc-500 font-semibold">
                {shopOpen ? '✅ Открыт — покупатели могут делать заказы' : '🔴 Закрыт — заказы отключены'}
              </div>
            </div>
            <button
              onClick={toggleShop}
              className={`rounded-xl border-2 border-zinc-700 px-5 py-2.5 font-black transition shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] ${
                shopOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {shopOpen ? 'Закрыть магазин' : 'Открыть магазин'}
            </button>
          </div>

          {/* Белые футболки */}
          {(['white', 'black'] as const).map(color => (
            <div key={color} className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 p-5 mb-5">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <span className={`inline-block h-5 w-5 rounded-md border-2 border-zinc-600 ${color === 'white' ? 'bg-white' : 'bg-zinc-900'}`} />
                {color === 'white' ? 'Белая футболка' : 'Чёрная футболка'}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {SIZES.map(size => {
                  const item = inventory.find(i => i.color === color && i.size === size);
                  if (!item) return null;
                  return (
                    <div key={size} className={`rounded-xl border-2 p-3 transition ${item.in_stock ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-700 bg-zinc-850 opacity-60'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-lg">{size}</span>
                        <button
                          onClick={() => updateInventory(item.id, 'in_stock', !item.in_stock)}
                          className={`rounded-lg px-2 py-1 text-xs font-black border transition ${
                            item.in_stock ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-white' : 'border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          {item.in_stock ? 'Есть' : 'Нет'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateInventory(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                          className="h-7 w-7 rounded-lg border border-zinc-600 bg-zinc-700 font-black text-sm hover:bg-zinc-600 transition flex items-center justify-center"
                        >−</button>
                        <span className="flex-1 text-center font-black text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateInventory(item.id, 'quantity', item.quantity + 1)}
                          className="h-7 w-7 rounded-lg border border-zinc-600 bg-zinc-700 font-black text-sm hover:bg-zinc-600 transition flex items-center justify-center"
                        >+</button>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-semibold text-center mt-1">шт. в наличии</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
