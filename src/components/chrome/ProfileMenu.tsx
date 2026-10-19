'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/components/app/SessionProvider';
import { UserAvatar } from '@/components/chrome/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProfileMenu() {
  const { user, logout } = useSession();
  const router = useRouter();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#101828]"
          aria-label="Open profile"
        >
          <UserAvatar name={user.name} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold text-[#101828]">{user.name}</p>
          <p className="truncate text-xs font-normal text-[#667085]">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/account')}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/subscription')}>Subscription</DropdownMenuItem>
        {user.role === 'admin' ? (
          <DropdownMenuItem onSelect={() => router.push('/admin')}>Desk</DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout();
            router.push('/');
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
