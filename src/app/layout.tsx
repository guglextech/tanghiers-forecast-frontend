import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import { SITE } from '@/data/site';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Daily forecasts`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ['Lotto Forecast', 'TG', 'daily forecast', 'subscription', 'SMS', 'Stripe'].join(', '),
  authors: [{ name: SITE.name }],
  creator: SITE.project,
  publisher: SITE.name,
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: baseUrl,
    siteName: SITE.name,
    title: `${SITE.name} — Daily forecasts`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#101828" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={SITE.name} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>
          <div className="min-h-screen bg-white text-[#101828]">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
