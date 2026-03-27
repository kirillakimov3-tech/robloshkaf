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

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('roblox-shirt-cart');
    if (!raw) return;
    try {
      const parsed: CartItem[] = JSON.parse(raw);
      setItems(parsed);
    } catch {
      setItems([]);
    }
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

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Корзина</h1>
            <p className="mt-2 text-zinc-600">Твои сохранённые футболки и выбранные размеры.</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/designer"
              className="rounded-2xl border bg-white px-5 py-3 text-sm font-medium"
            >
              Назад в конструктор
            </Link>
            <Link
              href="/"
              className="rounded-2xl border bg-white px-5 py-3 text-sm font-medium"
            >
              Главная
            </Link>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl border bg-white p-5">
          <div>
            <div className="text-lg font-bold">Товаров в корзине: {totalCount}</div>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="rounded-2xl border px-4 py-2 text-sm font-medium"
            >
              Очистить корзину
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-zinc-600">
            Корзина пока пустая.
          </div>
        ) : (
          <div className="grid gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-6 rounded-3xl border bg-white p-5 md:grid-cols-[220px_1fr_auto]"
              >
                <div className="overflow-hidden rounded-2xl border bg-zinc-50">
                  {item.previewDataUrl ? (
                    <img
                      src={item.previewDataUrl}
                      alt="Превью футболки"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-[260px] items-center justify-center text-zinc-400">
                      Нет превью
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xl font-bold">Футболка Roblox</div>
                  <div className="text-sm text-zinc-600">Пользователь: {item.username}</div>
                  <div className="text-sm text-zinc-600">
                    Цвет: {item.shirtColor === 'white' ? 'Белая' : 'Чёрная'}
                  </div>
                  <div className="text-sm text-zinc-600">Размер: {item.size}</div>
                  <div className="text-sm text-zinc-600">
                    Никнейм: {item.nickname || 'Скрыт / удалён'}
                  </div>
                  <div className="text-sm text-zinc-600">
                    Размер никнейма: {item.nicknameSize}
                  </div>
                  <div className="text-sm text-zinc-600">
                    Поворот никнейма: {item.nicknameRotation}°
                  </div>
                </div>

                <div className="flex items-start">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-2xl border px-4 py-2 text-sm font-medium"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}