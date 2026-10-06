import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  CircleHelp,
  FolderOpen,
  Home,
  Settings,
  Users,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'Courses', href: '/courses', icon: BookOpen },
  { title: 'Library', href: '/library', icon: FolderOpen },
  { title: 'Calendar', href: '/calendar', icon: CalendarDays },
  { title: 'Network', href: '/network', icon: Users },
  { title: 'Career', href: '/career', icon: Briefcase },
];

export const secondaryNav: NavItem[] = [
  { title: 'Help', href: '/help', icon: CircleHelp },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export const allNavItems: NavItem[] = [...mainNav, ...secondaryNav];

export function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Home';
  const exact = allNavItems.find((item) => item.href === pathname);
  if (exact) return exact.title;
  return 'MBA Hub';
}
