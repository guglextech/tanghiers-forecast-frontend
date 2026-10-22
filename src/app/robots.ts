import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/i18n/locale-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/feed',
        '/history',
        '/forecasts',
        '/account',
        '/subscription',
        '/messages',
        '/notifications',
        '/notification',
        '/admin',
        '/login',
        '/signup',
        '/verify-email',
        '/reset-password',
        '/unsubscribe',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
