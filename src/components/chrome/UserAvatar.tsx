import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initialsFromName } from '@/lib/session';
import { cn } from '@/lib/utils';

export function UserAvatar({
  name,
  size = 'default',
  className,
}: {
  name: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  return (
    <Avatar size={size} className={cn('bg-[#101828] text-white', className)}>
      <AvatarFallback className="bg-[#101828] text-[11px] font-semibold tracking-wide text-white group-data-[size=default]/avatar:text-xs group-data-[size=lg]/avatar:text-sm">
        {initialsFromName(name)}
      </AvatarFallback>
    </Avatar>
  );
}
