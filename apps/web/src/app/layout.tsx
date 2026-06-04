import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Lumi — نظام إدارة المدارس',
  description: 'منصة متكاملة لإدارة المدارس والسنترات التعليمية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans")}>
      <body className="font-cairo antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
