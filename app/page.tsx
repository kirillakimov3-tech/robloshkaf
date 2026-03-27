'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Logo from '@/components/Logo';
import WardrobeCard from '@/components/WardrobeCard';

type AvatarResponse = {
  avatarUrl: string | null;
  headshotUrl?: string | null;
  fullAvatarUrl?: string | null;
  user?: {
    preferred_username?: string;
    name?: string;
  };
};

const steps = [
  {
    number: '01',
    emoji: '🔑',
    title: 'Войди через Roblox',
    description: 'Авторизуйся одним кликом — мы подтянем твоего персонажа автоматически.',
  },
  {
    number: '02',
    emoji: '🎨',
    title: 'Настрой дизайн',
    description: 'Выбери цвет футболки, расположи аватара, добавь никнейм.',
  },
  {
    number: '03',
    emoji: '📦',
    title: 'Оформи заказ',
    description: 'Добавь в корзину и оформи доставку. Футболка приедет прямо к тебе.',
  },
];

const features = [
  { icon: '🎮', label: 'Твой Roblox-аватар' },
  { icon: '🎨', label: 'Белая или чёрная' },
  { icon: '✏️', label: 'Никнейм на футболке' },
  { icon: '📦', label: 'Размеры S–XL' },
];

// Квадратная буква О — стиль Roblox (используется только в других местах если нужно)

export default function HomePage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setNavVisible(true);
      } else if (currentY > lastScrollY.current) {
        setNavVisible(false); // скролл вниз — прячем
      } else {
        setNavVisible(true);  // скролл вверх — показываем
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    async function loadUser() {
      try {
        const res = await fetch('/api/roblox/avatar', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) { setLoading(false); return; }
        const data: AvatarResponse = await res.json();
        setAvatarUrl(data.headshotUrl ?? data.avatarUrl ?? null);
        setUsername(data.user?.preferred_username || data.user?.name || 'Roblox User');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md border-b-2 border-zinc-900"
        style={{
          transform: navVisible ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Logo size="md" />

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-32 rounded-xl bg-zinc-100 animate-pulse" />
          ) : username ? (
            <div className="flex items-center gap-2 rounded-xl border-2 border-zinc-900 bg-white px-3 py-1.5 shadow-[2px_2px_0px_#18181b]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E02020] text-xs font-black text-white">
                  {username.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-black" style={{ fontFamily: "'Nunito', sans-serif" }}>{username}</span>
            </div>
          ) : (
            <a
              href="/api/roblox/login"
              className="rounded-xl border-2 border-zinc-900 bg-[#E02020] px-4 py-2 text-sm font-black text-white shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b] transition-all"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Войти через Roblox
            </a>
          )}

          {username && (
            <Link
              href="/cart"
              className="rounded-xl border-2 border-zinc-900 bg-white px-4 py-2 text-sm font-black shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b] transition-all"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              🛒 Корзина
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-5xl">

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              <Image
                src="/robloshkaf-logo.png"
                alt="Роблошкаф"
                width={480}
                height={200}
                className="mb-6 max-w-full"
                style={{ objectFit: 'contain' }}
                priority
              />

              <p className="text-lg text-zinc-600 mb-8 leading-relaxed font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Войди через Roblox, настрой дизайн и закажи футболку с&nbsp;твоим аватаром.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {features.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-zinc-900 bg-white px-3 py-2 text-sm font-black shadow-[2px_2px_0px_#18181b]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {username ? (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/designer"
                    className="rounded-2xl border-2 border-zinc-900 bg-[#E02020] px-7 py-3.5 font-black text-white text-base shadow-[4px_4px_0px_#18181b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#18181b] transition-all"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Открыть конструктор →
                  </Link>
                  <Link
                    href="/cart"
                    className="rounded-2xl border-2 border-zinc-900 bg-white px-7 py-3.5 font-black text-base shadow-[4px_4px_0px_#18181b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#18181b] transition-all"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    🛒 Корзина
                  </Link>
                </div>
              ) : (
                <a
                  href="/api/roblox/login"
                  className="inline-flex rounded-2xl border-2 border-zinc-900 bg-[#E02020] px-7 py-3.5 font-black text-white text-base shadow-[4px_4px_0px_#18181b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#18181b] transition-all"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Войти через Roblox →
                </a>
              )}
            </div>

            {/* Wardrobe card with door animation */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
              }}
            >
              <WardrobeCard username={username} />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>Как это работает</p>
            <h2 className="text-4xl font-black tracking-tight text-white" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
              Три шага до футболки
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="rounded-[20px] border-2 border-zinc-700 bg-zinc-900 p-6 hover:border-yellow-400 transition-colors"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 0.12 + 0.2}s, transform 0.5s ease ${i * 0.12 + 0.2}s`,
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-yellow-400 bg-yellow-400 text-xl font-black text-zinc-900 shadow-[2px_2px_0px_#713f12]">
                    {step.emoji}
                  </div>
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{step.number}</span>
                </div>
                <h3 className="font-black text-lg mb-2 text-white">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-semibold">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#E02020]">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-5xl font-black tracking-tight mb-5 text-white"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Готов создать<br />свою футболку?
          </h2>
          <p className="text-lg text-red-100 mb-8 font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Авторизуйся и запусти конструктор — займёт меньше минуты.
          </p>
          {username ? (
            <Link
              href="/designer"
              className="inline-flex rounded-2xl border-2 border-zinc-900 bg-white px-8 py-4 font-black text-zinc-900 text-lg shadow-[4px_4px_0px_#18181b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#18181b] transition-all"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Открыть конструктор →
            </Link>
          ) : (
            <a
              href="/api/roblox/login"
              className="inline-flex rounded-2xl border-2 border-zinc-900 bg-white px-8 py-4 font-black text-zinc-900 text-lg shadow-[4px_4px_0px_#18181b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#18181b] transition-all"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Войти через Roblox →
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-zinc-900 px-6 py-6 bg-white">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Logo size="sm" />
          <span className="text-sm text-zinc-400 font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
            © 2026 Роблошкаф
          </span>
        </div>
      </footer>

    </main>
  );
}
