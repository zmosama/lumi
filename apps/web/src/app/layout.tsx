import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'لومي — نظام إدارة المدارس',
  description: 'منصة متكاملة لإدارة المدارس والسنترات التعليمية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-cairo antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
