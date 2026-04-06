import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roblox Shirt Configurator',
  description: 'Create a T-shirt with your Roblox avatar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}