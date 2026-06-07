import type { Metadata } from 'next';
import '../globals.css';
import { Providers } from '../providers';
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Lumi — نظام إدارة المدارس',
  description: 'منصة متكاملة لإدارة المدارس والسنترات التعليمية',
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const dir = locale.startsWith('ar') ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={cn("font-sans")}>
      <body className="font-cairo antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
