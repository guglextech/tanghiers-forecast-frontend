import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLockup } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page could not be found.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <BrandLockup />
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#667085]">
        That address is not part of Tanghiers.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-full bg-[#101828] px-5 text-sm font-semibold text-white">
          Home
        </Link>
        <Link href="/pricing" className="inline-flex h-11 items-center rounded-full border border-[#d0d5dd] px-5 text-sm font-semibold">
          Pricing
        </Link>
      </div>
    </main>
  );
}
