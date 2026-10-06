'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { BrandMark } from '@/components/mba/BrandMark';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { mainNav, secondaryNav } from '@/components/app/nav-config';
import { MobileBottomNav } from '@/components/app/MobileBottomNav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/components/app/SessionProvider';
import { starterPosts, suggestedPeople, type FeedPost } from '@/data/feed';
import { upcomingEvents } from '@/data/events';
import { handleFromName, initialsFromName } from '@/lib/session';
import { formatDisplayDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

const FEED_KEY = 'mba.feed.posts';

function readSavedPosts(): FeedPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FEED_KEY);
    return raw ? (JSON.parse(raw) as FeedPost[]) : [];
  } catch {
    return [];
  }
}

export function FeedHome() {
  const { user, logout } = useSession();
  const [draft, setDraft] = React.useState('');
  const [posts, setPosts] = React.useState<FeedPost[]>(starterPosts);

  React.useEffect(() => {
    const saved = readSavedPosts();
    if (saved.length) {
      setPosts(saved);
    }
  }, []);

  const publish = (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !user) return;

    const next: FeedPost = {
      id: `post_${Date.now()}`,
      author: user.name,
      handle: handleFromName(user.name),
      initials: initialsFromName(user.name),
      time: 'now',
      body,
      likes: 0,
      replies: 0,
    };
    const updated = [next, ...posts];
    setPosts(updated);
    window.localStorage.setItem(FEED_KEY, JSON.stringify(updated));
    setDraft('');
  };

  const toggleLike = (id: string) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px]">
        <aside className="sticky top-0 hidden h-screen w-[255px] shrink-0 flex-col justify-between px-3 py-3 lg:flex">
          <div>
            <div className="px-3 pb-4">
              <BrandMark compact />
            </div>
            <nav className="space-y-0.5" aria-label="Home">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const home = item.href === '/';
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={home ? 'page' : undefined}
                    className={cn(
                      'flex h-12 items-center gap-4 rounded-full px-3 text-[19px] transition-colors hover:bg-muted',
                      home && 'font-bold',
                    )}
                  >
                    <Icon className="size-[26px]" strokeWidth={home ? 2.4 : 1.8} />
                    {item.title}
                  </Link>
                );
              })}
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex h-12 items-center gap-4 rounded-full px-3 text-[19px] text-foreground/80 transition-colors hover:bg-muted"
                  >
                    <Icon className="size-[26px]" strokeWidth={1.8} />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between rounded-full p-2 hover:bg-muted">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initialsFromName(user?.name ?? '')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{user ? handleFromName(user.name) : ''}</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={logout}>
                Log out
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 border-x border-border pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:max-w-[600px] lg:pb-0">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
            <h1 className="text-[17px] font-bold">Home</h1>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button type="button" variant="ghost" size="sm" className="lg:hidden" onClick={logout}>
                Log out
              </Button>
            </div>
          </header>

          <form onSubmit={publish} className="flex gap-3 border-b border-border px-4 py-3">
            <Avatar>
              <AvatarFallback>{initialsFromName(user?.name ?? '')}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="What's happening in the cohort?"
                rows={3}
                className="min-h-[72px] resize-none border-0 bg-transparent px-0 text-[17px] shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={!draft.trim()} className="h-9 rounded-full px-5">
                  Post
                </Button>
              </div>
            </div>
          </form>

          <ul>
            {posts.map((post) => (
              <li key={post.id} className="flex gap-3 border-b border-border px-4 py-3">
                <Avatar>
                  <AvatarFallback>{post.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px]">
                    <span className="font-bold">{post.author}</span>{' '}
                    <span className="text-muted-foreground">
                      @{post.handle} · {post.time}
                    </span>
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed">{post.body}</p>
                  <div className="mt-2 flex max-w-sm justify-between text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <MessageCircle className="size-4" />
                      {post.replies}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Repeat2 className="size-4" />
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={cn(
                        'inline-flex items-center gap-1 text-xs hover:text-[#f91880]',
                        post.liked && 'text-[#f91880]',
                      )}
                    >
                      <Heart className={cn('size-4', post.liked && 'fill-current')} />
                      {post.likes}
                    </button>
                    <Share className="size-4" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </main>

        <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 overflow-y-auto px-6 py-3 xl:block">
          <section className="rounded-2xl bg-card p-4">
            <h2 className="text-xl font-bold">Upcoming</h2>
            <ul className="mt-3 space-y-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <li key={event.id}>
                  <p className="text-xs text-muted-foreground">
                    {event.type} · {formatDisplayDate(event.date)}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug">{event.title}</p>
                </li>
              ))}
            </ul>
            <Link href="/calendar" className="mt-4 inline-block text-sm text-[#0070cc]">
              See calendar
            </Link>
          </section>

          <section className="mt-4 rounded-2xl bg-card p-4">
            <h2 className="text-xl font-bold">Who to follow</h2>
            <ul className="mt-3 space-y-3">
              {suggestedPeople.map((person) => (
                <li key={person.handle} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{person.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{person.handle}</p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/network">View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
      <MobileBottomNav />
    </div>
  );
}
