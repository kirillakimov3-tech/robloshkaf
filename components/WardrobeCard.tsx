'use client';

import { useState, useEffect } from 'react';

const SHIRTS = [
  { emoji: '👕', color: 'bg-white', label: 'Белая футболка' },
  { emoji: '🖤', color: 'bg-zinc-900', label: 'Чёрная футболка' },
  { emoji: '👾', color: 'bg-white', label: 'С аватаром' },
  { emoji: '✏️', color: 'bg-white', label: 'С никнеймом' },
];

interface WardrobeCardProps {
  username?: string | null;
}

export default function WardrobeCard({ username }: WardrobeCardProps) {
  const [current, setCurrent] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayed, setDisplayed] = useState(0);

  // Auto-cycle every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      triggerSwitch((displayed + 1) % SHIRTS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [displayed]);

  const triggerSwitch = (nextIndex: number) => {
    if (isAnimating || nextIndex === displayed) return;
    setIsAnimating(true);
    setCurrent(nextIndex);

    // Phase 1: close doors
    setDoorsOpen(false);

    // Phase 2: after doors close, swap content, then open
    setTimeout(() => {
      setDisplayed(nextIndex);
      setDoorsOpen(true);
    }, 400);

    // Phase 3: done
    setTimeout(() => {
      setIsAnimating(false);
    }, 900);
  };

  const shirt = SHIRTS[displayed];

  return (
    <div className="flex flex-col gap-4">
      {/* Main card */}
      <div
        className="relative rounded-[28px] border-4 border-zinc-900 bg-zinc-950 overflow-hidden aspect-[4/5] shadow-[8px_8px_0px_#18181b]"
        style={{ minHeight: 380 }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Content (behind doors) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <div
            className={`flex h-44 w-44 items-center justify-center rounded-[20px] border-4 border-zinc-700 ${shirt.color} shadow-[4px_4px_0px_#374151] transition-all duration-300`}
          >
            <span className="text-6xl">{shirt.emoji}</span>
          </div>

          <div className="rounded-2xl border-2 border-zinc-700 bg-white/10 backdrop-blur px-5 py-3 text-white text-center">
            <div className="text-[10px] text-white/40 mb-1 uppercase tracking-widest font-bold">
              {shirt.label}
            </div>
            <div
              className="font-black text-xl"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              {username ?? 'YourUsername'}
            </div>
          </div>
        </div>

        {/* LEFT DOOR */}
        <div
          className="absolute top-0 left-0 bottom-0 z-20 bg-zinc-900 border-r-2 border-zinc-700"
          style={{
            width: '50%',
            transformOrigin: 'left center',
            transform: doorsOpen ? 'perspective(800px) rotateY(-90deg)' : 'perspective(800px) rotateY(0deg)',
            transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Door handle */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-2 rounded-full bg-zinc-600 border border-zinc-500" />
          {/* Door panel lines */}
          <div className="absolute inset-4 border border-zinc-700 rounded-xl opacity-40" />
          <div className="absolute inset-6 border border-zinc-700 rounded-lg opacity-20" />
        </div>

        {/* RIGHT DOOR */}
        <div
          className="absolute top-0 right-0 bottom-0 z-20 bg-zinc-900 border-l-2 border-zinc-700"
          style={{
            width: '50%',
            transformOrigin: 'right center',
            transform: doorsOpen ? 'perspective(800px) rotateY(90deg)' : 'perspective(800px) rotateY(0deg)',
            transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Door handle */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-2 rounded-full bg-zinc-600 border border-zinc-500" />
          {/* Door panel lines */}
          <div className="absolute inset-4 border border-zinc-700 rounded-xl opacity-40" />
          <div className="absolute inset-6 border border-zinc-700 rounded-lg opacity-20" />
        </div>

        {/* Badges */}
        <div
          className="absolute top-4 right-4 z-30 rounded-xl border-2 border-yellow-400 bg-yellow-400 px-3 py-1.5 text-xs font-black text-zinc-900 shadow-[2px_2px_0px_#713f12]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          УНИКАЛЬНАЯ
        </div>
        <div
          className="absolute bottom-4 left-4 z-30 rounded-xl border-2 border-zinc-600 bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-black text-white"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          S · M · L · XL
        </div>
      </div>

      {/* Arrows + dots */}
      <div className="flex items-center justify-center gap-3">
        {/* Left arrow */}
        <button
          onClick={() => triggerSwitch((displayed - 1 + SHIRTS.length) % SHIRTS.length)}
          disabled={isAnimating}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b] disabled:opacity-40 transition-all text-base leading-none"
        >
          ←
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {SHIRTS.map((_, i) => (
            <button
              key={i}
              onClick={() => triggerSwitch(i)}
              className={`rounded-full border-2 border-zinc-900 transition-all duration-200 ${
                displayed === i
                  ? 'w-6 h-3 bg-yellow-400'
                  : 'w-3 h-3 bg-zinc-300 hover:bg-zinc-400'
              }`}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => triggerSwitch((displayed + 1) % SHIRTS.length)}
          disabled={isAnimating}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b] disabled:opacity-40 transition-all text-base leading-none"
        >
          →
        </button>
      </div>
    </div>
  );
}
