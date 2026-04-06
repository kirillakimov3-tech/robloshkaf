import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Роблошкаф — футболки с Roblox-аватаром',
  description: 'Создай футболку со своим Roblox-персонажем',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Nunito', sans-serif" }}>{children}</body>
    </html>
  );
}
