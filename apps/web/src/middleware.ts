import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('lumi_token')?.value;
  
  // Create a regex to match the dashboard route with or without locale prefix
  // e.g. /dashboard, /en/dashboard, /ar/dashboard
  const isDashboard = req.nextUrl.pathname.match(/^(\/[a-z]{2})?\/dashboard/);

  if (isDashboard && !token) {
    // Determine the locale prefix if it exists
    const match = req.nextUrl.pathname.match(/^(\/[a-z]{2})\//);
    const localePrefix = match ? match[1] : '';
    const loginUrl = new URL(`${localePrefix}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
