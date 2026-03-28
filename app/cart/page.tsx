'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type CartItem = {
  id: string;
  username: string;
  shirtColor: 'white' | 'black';
  size: 'S' | 'M' | 'L' | 'XL';
  nickname: string;
  nicknameSize: number;
  nicknameRotation: number;
  avatarUrl: string | null;
  previewDataUrl?: string;
  createdAt: string;
};

type Step = 'cart' | 'form' | 'success';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('cart');
  const [submitting, setSubmitting] = useState(false);
  const [robloxUsername, setRobloxUsername] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    comment: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    const raw = localStorage.getItem('roblox-shirt-cart');
    if (!raw) return;
    try {
      setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
    // Fetch roblox username
    fetch('/api/roblox/avatar', { credentials: 'include', cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user?.preferred_username || data?.user?.name) {
          setRobloxUsername(data.user.preferred_username || data.user.name);
        }
      }).catch(() => {});
  }, []);

  const totalCount = useMemo(() => items.length, [items]);

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem('roblox-shirt-cart', JSON.stringify(next));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('roblox-shirt-cart');
    window.dispatchEvent(new Event('cart-updated'));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Введите имя и фамилию';
    if (!form.phone.trim()) e.phone = 'Введите телефон';
    if (!form.email.trim()) e.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Некорректный email';
    if (!form.address.trim()) e.address = 'Введите адрес доставки';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, robloxUsername, items }),
      });
      if (res.ok) {
        clearCart();
        setStep('success');
      } else {
        alert('Ошибка при отправке. Попробуй ещё раз.');
      }
    } catch {
      alert('Ошибка сети. Попробуй ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof typeof form) =>
    `w-full rounded-xl border-2 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition shadow-[2px_2px_0px_#18181b] ${
      errors[field] ? 'border-red-500' : 'border-zinc-900'
    }`;

  const robloxBtn = "rounded-2xl border-2 border-zinc-900 font-black transition-all shadow-[3px_3px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#18181b]";

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
              {step === 'cart' ? 'Корзина' : step === 'form' ? 'Оформление заказа' : 'Заказ оформлен!'}
            </h1>
            <p className="mt-1 text-zinc-500 font-semibold text-sm">
              {step === 'cart' ? 'Твои сохранённые футболки и выбранные размеры.' :
               step === 'form' ? 'Заполни данные для доставки.' :
               'Мы получили твой заказ и скоро свяжемся с тобой.'}
            </p>
          </div>
          <div className="flex gap-3">
            {step === 'form' && (
              <button onClick={() => setStep('cart')} className={`${robloxBtn} bg-white px-5 py-2.5 text-sm`}>
                ← Назад
              </button>
            )}
            <Link href="/designer" className={`${robloxBtn} bg-white px-5 py-2.5 text-sm`}>
              Конструктор
            </Link>
            <Link href="/" className={`${robloxBtn} bg-white px-5 py-2.5 text-sm`}>
              Главная
            </Link>
          </div>
        </div>

        {/* ── STEP: CART ── */}
        {step === 'cart' && (
          <>
            <div className="mb-5 flex items-center justify-between rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-[3px_3px_0px_#18181b]">
              <div className="font-black text-lg">Товаров: {totalCount}</div>
              {items.length > 0 && (
                <button onClick={clearCart} className={`${robloxBtn} bg-white px-4 py-2 text-sm`}>
                  Очистить корзину
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border-2 border-zinc-900 bg-white p-8 text-center shadow-[3px_3px_0px_#18181b]">
                <div className="text-4xl mb-3">🛒</div>
                <div className="font-black text-lg mb-2">Корзина пустая</div>
                <p className="text-zinc-500 font-semibold text-sm mb-5">Сначала создай дизайн в конструкторе</p>
                <Link href="/designer" className={`${robloxBtn} inline-flex bg-black text-white px-6 py-3`}>
                  Открыть конструктор →
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="grid gap-4 rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-[3px_3px_0px_#18181b] md:grid-cols-[180px_1fr_auto]">
                      <div className="overflow-hidden rounded-xl border-2 border-zinc-900 bg-zinc-50">
                        {item.previewDataUrl ? (
                          <img src={item.previewDataUrl} alt="Превью" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-[180px] items-center justify-center text-zinc-400 font-semibold text-sm">Нет превью</div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="font-black text-lg">Футболка Roblox</div>
                        <div className="inline-flex rounded-lg border-2 border-zinc-900 bg-yellow-400 px-2 py-0.5 text-xs font-black">{item.size}</div>
                        <div className="text-sm font-semibold text-zinc-600">👤 {item.username}</div>
                        <div className="text-sm font-semibold text-zinc-600">🎨 {item.shirtColor === 'white' ? 'Белая' : 'Чёрная'}</div>
                        {item.nickname && <div className="text-sm font-semibold text-zinc-600">✏️ {item.nickname}</div>}
                      </div>

                      <div className="flex items-start">
                        <button onClick={() => removeItem(item.id)} className={`${robloxBtn} bg-white px-4 py-2 text-sm`}>
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep('form')}
                  className={`${robloxBtn} w-full bg-[#E02020] text-white py-4 text-base`}
                >
                  Оформить заказ ({totalCount} шт.) →
                </button>
              </>
            )}
          </>
        )}

        {/* ── STEP: FORM ── */}
        {step === 'form' && (
          <div className="grid gap-6 md:grid-cols-[1fr_340px]">

            {/* Form */}
            <div className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-[4px_4px_0px_#18181b] space-y-5">
              <h2 className="font-black text-lg border-b-2 border-zinc-100 pb-3">Данные для доставки</h2>

              {[
                { field: 'name' as const, label: 'Имя и фамилия', placeholder: 'Иван Иванов', type: 'text' },
                { field: 'phone' as const, label: 'Телефон', placeholder: '+7 (999) 123-45-67', type: 'tel' },
                { field: 'email' as const, label: 'Email', placeholder: 'ivan@example.com', type: 'email' },
                { field: 'address' as const, label: 'Адрес доставки', placeholder: 'Город, улица, дом, квартира, индекс', type: 'text' },
              ].map(({ field, label, placeholder, type }) => (
                <div key={field}>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className={inputClass(field)}
                  />
                  {errors[field] && <p className="mt-1 text-xs font-semibold text-red-500">{errors[field]}</p>}
                </div>
              ))}

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Комментарий (необязательно)</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Пожелания к заказу..."
                  rows={3}
                  className="w-full rounded-xl border-2 border-zinc-900 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition shadow-[2px_2px_0px_#18181b] resize-none"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-[4px_4px_0px_#18181b]">
                <h2 className="font-black text-lg mb-4 border-b-2 border-zinc-100 pb-3">Итог заказа</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.previewDataUrl && (
                        <img src={item.previewDataUrl} alt="" className="h-12 w-12 rounded-lg border-2 border-zinc-900 object-contain bg-zinc-50" />
                      )}
                      <div>
                        <div className="font-black text-sm">{item.username}</div>
                        <div className="text-xs font-semibold text-zinc-500">
                          {item.shirtColor === 'white' ? 'Белая' : 'Чёрная'} · {item.size}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t-2 border-zinc-100">
                  <div className="flex justify-between font-black">
                    <span>Итого:</span>
                    <span>{totalCount} шт.</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-semibold mt-1">Стоимость уточним после подтверждения</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`${robloxBtn} w-full bg-[#E02020] text-white py-4 text-base disabled:opacity-60`}
              >
                {submitting ? '⏳ Отправляем...' : '✅ Подтвердить заказ'}
              </button>

              <p className="text-xs text-zinc-400 font-semibold text-center">
                Мы свяжемся с тобой для подтверждения оплаты и уточнения деталей
              </p>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && (
          <div className="rounded-2xl border-2 border-zinc-900 bg-white p-10 text-center shadow-[4px_4px_0px_#18181b]">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
              Заказ оформлен!
            </h2>
            <p className="text-zinc-600 font-semibold mb-2">
              Мы получили твой заказ и скоро свяжемся с тобой.
            </p>
            <p className="text-zinc-500 font-semibold text-sm mb-8">
              Подтверждение отправлено на <strong>{form.email}</strong>
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/designer" className={`${robloxBtn} bg-black text-white px-6 py-3`}>
                Создать ещё →
              </Link>
              <Link href="/" className={`${robloxBtn} bg-white px-6 py-3`}>
                На главную
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
