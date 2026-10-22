import {
  Bell,
  CircleHelp,
  CreditCard,
  Grid2x2,
  History,
  LayoutGrid,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  badge?: 'notifications';
  admin?: boolean;
};

export const mainNav: AppNavItem[] = [
  {
    href: '/feed',
    label: 'Feed',
    icon: LayoutGrid,
    match: (path) => path === '/feed' || path.startsWith('/forecasts'),
  },
  {
    href: '/history',
    label: 'History',
    icon: History,
    match: (path) => path.startsWith('/history'),
  },
];

export const accountNav: AppNavItem[] = [
  {
    href: '/account',
    label: 'Settings',
    icon: Settings,
    match: (path) => path.startsWith('/account') || path.startsWith('/messages'),
  },
  {
    href: '/subscription',
    label: 'Subscription',
    icon: CreditCard,
    match: (path) => path.startsWith('/subscription'),
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: Bell,
    match: (path) => path.startsWith('/notifications'),
    badge: 'notifications',
  },
  {
    href: '/contact',
    label: 'Help',
    icon: CircleHelp,
    match: (path) => path.startsWith('/contact'),
  },
];

export const deskNav: AppNavItem[] = [
  {
    href: '/admin',
    label: 'Desk',
    icon: Grid2x2,
    match: (path) => path.startsWith('/admin'),
    admin: true,
  },
];
