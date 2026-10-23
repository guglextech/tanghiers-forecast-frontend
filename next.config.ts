import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  customWorkerSrc: "worker",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/",
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/support', destination: '/contact', permanent: false },
      { source: '/help', destination: '/contact', permanent: false },
      { source: '/app', destination: '/feed', permanent: false },
      { source: '/dashboard', destination: '/feed', permanent: false },
      { source: '/settings', destination: '/account', permanent: false },
      { source: '/billing/cancel', destination: '/billing/failed', permanent: false },
      { source: '/billing/failure', destination: '/billing/failed', permanent: false },
      { source: '/notification', destination: '/notifications', permanent: false },
      { source: '/courses', destination: '/', permanent: false },
      { source: '/library', destination: '/', permanent: false },
      { source: '/calendar', destination: '/', permanent: false },
      { source: '/network', destination: '/', permanent: false },
      { source: '/career', destination: '/', permanent: false },
      { source: '/curriculum', destination: '/', permanent: false },
      { source: '/resources', destination: '/', permanent: false },
      { source: '/events', destination: '/', permanent: false },
      { source: '/blogs', destination: '/', permanent: false },
      { source: '/blogs/:slug', destination: '/', permanent: false },
    ];
  },
};

export default withPWA(nextConfig);
