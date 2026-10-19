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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Daily forecasts`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ['Tanghiers', 'TG', 'daily forecast', 'subscription', 'SMS', 'Stripe'].join(', '),
  authors: [{ name: SITE.name }],
  creator: SITE.project,
  publisher: SITE.name,
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    ...(siteUrl ? { url: siteUrl } : {}),
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
    statusBarStyle: 'black-translucent',
    title: SITE.name,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#001a58',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={SITE.name} />
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
