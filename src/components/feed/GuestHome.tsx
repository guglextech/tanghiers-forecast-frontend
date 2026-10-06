import Link from 'next/link';
import { BrandMark } from '@/components/mba/BrandMark';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { Button } from '@/components/ui/button';
import { publicNav, SITE } from '@/data/site';

export function GuestHome() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground sm:flex" aria-label="Public">
              {publicNav.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0070cc] dark:text-[#66c0ff]">
            {SITE.name}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Happening in the cohort.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            A simple home for students, faculty, and alumni. Sign in to see the feed, courses, and
            resources.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Join the conversation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The feed, library, and calendar stay behind a login.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild size="lg" className="h-11 w-full rounded-full">
              <Link href="/signup">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 w-full rounded-full">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground sm:hidden">
            {publicNav.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? ' · ' : ''}
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <nav className="flex flex-wrap gap-4" aria-label="Legal">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
