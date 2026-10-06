import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { footerNav, SITE } from '@/data/site';

export default function SiteFooter() {
  return (
    <footer className="bg-[#0b1220] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div>
          <p className="text-lg font-semibold tracking-tight">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">{SITE.tagline}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Public
          </p>
          <ul className="mt-3 space-y-2">
            {footerNav.public.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/65 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="bg-white/10" />
      <div className="mx-auto flex w-full max-w-6xl px-4 py-5 text-xs text-white/40 sm:px-6">
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
