'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleHelp, Home, LogOut, Search, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type AppTopbarProps = {
  onOpenSearch: () => void;
};

export function AppTopbar({ onOpenSearch }: AppTopbarProps) {
  const { logout } = useSession();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex h-14 min-w-0 items-center justify-end gap-3 bg-background px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-8 gap-2 border-border/80 px-3 text-muted-foreground sm:inline-flex"
              onClick={onOpenSearch}
            >
              <Search className="size-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="pointer-events-none ml-0.5 hidden h-5 items-center rounded border border-border/80 bg-muted/70 px-1.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
                ⌘K
              </kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search (⌘K)</TooltipContent>
        </Tooltip>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 sm:hidden"
          aria-label="Search"
          onClick={onOpenSearch}
        >
          <Search className="size-4" />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon-sm" className="size-8" aria-label="Home">
              <Link href="/">
                <Home className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Home</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon-sm" className="size-8" aria-label="Help">
              <Link href="/help">
                <CircleHelp className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon-sm" className="size-8" aria-label="Settings">
              <Link href="/settings">
                <Settings className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8"
              aria-label="Log out"
              onClick={() => {
                logout();
                router.replace('/');
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Log out</TooltipContent>
        </Tooltip>

        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
