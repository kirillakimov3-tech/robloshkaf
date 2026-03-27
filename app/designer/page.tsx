'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShirtDesigner from '@/components/ShirtDesigner';
import Logo from '@/components/Logo';

type AvatarResponse = {
  avatarUrl: string | null;
  headshotUrl?: string | null;
  fullAvatarUrl?: string | null;
  user?: {
    preferred_username?: string;
    name?: string;
  };
};

export default function DesignerPage() {
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(null);
  const [fullAvatarUrl, setFullAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState('Demo User');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadAvatar() {
      try {
        const res = await fetch('/api/roblox/avatar', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (cancelled) return;

        if (res.status === 401) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data: AvatarResponse = await res.json();
        setHeadshotUrl(data.headshotUrl ?? data.avatarUrl ?? null);
        setFullAvatarUrl(data.fullAvatarUrl ?? null);
        setUsername(data.user?.preferred_username || data.user?.name || 'Roblox User');
      } catch (error) {
        console.error('Failed to load avatar:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function syncCartCount() {
      try {
        const raw = localStorage.getItem('roblox-shirt-cart');
        const parsed = raw ? JSON.parse(raw) : [];
        setCartCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setCartCount(0);
      }
    }

    loadAvatar();
    syncCartCount();

    window.addEventListener('cart-updated', syncCartCount);
    window.addEventListener('storage', syncCartCount);

    return () => {
      cancelled = true;
      window.removeEventListener('cart-updated', syncCartCount);
      window.removeEventListener('storage', syncCartCount);
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-6">
      <div className="mx-auto max-w-7xl">

        {/* Navbar */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </Link>

          <Link
            href="/cart"
            id="cart-button"
            className="relative rounded-2xl border-2 border-zinc-900 bg-white px-5 py-2.5 text-sm font-black shadow-[3px_3px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#18181b] transition-all"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            🛒 Корзина
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-zinc-900 bg-[#E02020] px-1.5 text-xs font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border-2 border-zinc-900 bg-white p-6 font-semibold text-zinc-600 shadow-[4px_4px_0px_#18181b]" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Загружаем персонажа Roblox...
          </div>
        ) : !isAuthorized ? (
          <div className="rounded-2xl border-2 border-zinc-900 bg-white p-8 shadow-[4px_4px_0px_#18181b]">
            <div className="mb-3 text-xl font-black" style={{ fontFamily: "'Fredoka One', sans-serif" }}>Нужно войти через Roblox</div>
            <p className="mb-5 text-zinc-600 font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Сессия не найдена. Сначала войди на главной странице.
            </p>
            <a
              href="/"
              className="inline-flex rounded-2xl border-2 border-zinc-900 bg-[#E02020] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#18181b] transition-all"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Перейти на главную
            </a>
          </div>
        ) : (
         <ShirtDesigner
  headshotUrl={headshotUrl}
  fullAvatarUrl={fullAvatarUrl}
  username={username}
  isAdmin={username === 'kadralievm'}
/>
        )}
      </div>
    </main>
  );
}
