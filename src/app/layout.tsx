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
  manifest: '/manifest.json',
  applicationName: SITE.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE.name,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#101828' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>
          <div className="min-h-screen bg-white text-[#101828]">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
