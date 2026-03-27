import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizes = {
    sm: { height: 28,  width: 120 },
    md: { height: 36,  width: 154 },
    lg: { height: 64,  width: 274 },
  };

  const s = sizes[size];

  return (
    <Image
      src="/robloshkaf-logo.png"
      alt="Роблошкаф"
      width={s.width}
      height={s.height}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
