'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShirtDesigner from '@/components/ShirtDesigner';

type AvatarResponse = {
  avatarUrl: string | null;
  user?: {
    preferred_username?: string;
    name?: string;
  };
};

export default function DesignerPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState('Demo User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAvatar() {
      try {
        const res = await fetch('/api/roblox/avatar', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data: AvatarResponse = await res.json();

        setAvatarUrl(data.avatarUrl ?? null);
        setUsername(data.user?.preferred_username || data.user?.name || 'Roblox User');
      } catch (error) {
        console.error('Failed to load avatar:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAvatar();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Конструктор футболки</h1>
            <p className="text-zinc-600 mt-2">
              Перемещай персонажа, меняй цвет и скачивай макет.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl border px-5 py-3 text-sm font-medium bg-white hover:bg-zinc-100 transition"
          >
            Главная
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-zinc-600">
            Загружаем персонажа Roblox...
          </div>
        ) : (
          <ShirtDesigner avatarUrl={avatarUrl} username={username} />
        )}
      </div>
    </main>
  );
}