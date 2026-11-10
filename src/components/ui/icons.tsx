import * as React from 'react';
import { HugeiconsIcon, type HugeiconsIconProps, type IconSvgElement } from '@hugeicons/react';
import {
  Add01Icon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  CancelCircleIcon,
  CircleIcon,
  MinusSignIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUpRight01Icon,
  BookOpen01Icon,
  Briefcase01Icon,
  Calendar03Icon,
  Cancel01Icon,
  ChampionIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Clock04Icon,
  Copy01Icon,
  CreditCardIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Download01Icon,
  FavouriteIcon,
  FilterHorizontalIcon,
  Fire02Icon,
  FolderOpenIcon,
  GridViewIcon,
  HelpCircleIcon,
  Home01Icon,
  InformationCircleIcon,
  LinkSquare02Icon,
  Loading03Icon,
  SquareLock02Icon,
  Login03Icon,
  Logout03Icon,
  Mail01Icon,
  Menu01Icon,
  Message01Icon,
  Moon02Icon,
  MoreHorizontalIcon,
  Notification01Icon,
  NotificationOff01Icon,
  PlayIcon,
  RefreshIcon,
  RepeatIcon,
  Search01Icon,
  SentIcon,
  Settings01Icon,
  Share08Icon,
  Shield01Icon,
  SmartPhone01Icon,
  SparklesIcon,
  StarIcon,
  Sun03Icon,
  Tag01Icon,
  Tick02Icon,
  TickDouble02Icon,
  UserGroupIcon,
  Video01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';

export type IconProps = Omit<HugeiconsIconProps, 'icon' | 'strokeWidth'> & {
  strokeWidth?: number | string;
};

export type LucideIcon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

function icon(svg: IconSvgElement, name: string): LucideIcon {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
    { strokeWidth = 1.75, size = 24, ...props },
    ref,
  ) {
    return (
      <HugeiconsIcon
        ref={ref}
        icon={svg}
        size={size}
        strokeWidth={Number(strokeWidth)}
        aria-hidden={props['aria-label'] ? undefined : true}
        {...props}
      />
    );
  });
  Component.displayName = name;
  return Component;
}

export const ArrowRight = icon(ArrowRight02Icon, 'ArrowRight');
export const ArrowUpRight = icon(ArrowUpRight01Icon, 'ArrowUpRight');
export const Bell = icon(Notification01Icon, 'Bell');
export const BellOff = icon(NotificationOff01Icon, 'BellOff');
export const BookOpen = icon(BookOpen01Icon, 'BookOpen');
export const Briefcase = icon(Briefcase01Icon, 'Briefcase');
export const CalendarDays = icon(Calendar03Icon, 'CalendarDays');
export const Check = icon(Tick02Icon, 'Check');
export const CheckCheck = icon(TickDouble02Icon, 'CheckCheck');
export const CheckCircle2 = icon(CheckmarkCircle02Icon, 'CheckCircle2');
export const ChevronDown = icon(ArrowDown01Icon, 'ChevronDown');
export const ChevronLeft = icon(ArrowLeft01Icon, 'ChevronLeft');
export const ChevronRight = icon(ArrowRight01Icon, 'ChevronRight');
export const CircleHelp = icon(HelpCircleIcon, 'CircleHelp');
export const Clapperboard = icon(Video01Icon, 'Clapperboard');
export const Clock = icon(Clock01Icon, 'Clock');
export const Copy = icon(Copy01Icon, 'Copy');
export const CreditCard = icon(CreditCardIcon, 'CreditCard');
export const Download = icon(Download01Icon, 'Download');
export const ExternalLink = icon(LinkSquare02Icon, 'ExternalLink');
export const Eye = icon(ViewIcon, 'Eye');
export const EyeOff = icon(ViewOffSlashIcon, 'EyeOff');
export const Flame = icon(Fire02Icon, 'Flame');
export const FolderOpen = icon(FolderOpenIcon, 'FolderOpen');
export const Grid2x2 = icon(GridViewIcon, 'Grid2x2');
export const Heart = icon(FavouriteIcon, 'Heart');
export const History = icon(Clock04Icon, 'History');
export const Home = icon(Home01Icon, 'Home');
export const House = Home;
export const Info = icon(InformationCircleIcon, 'Info');
export const LayoutGrid = icon(DashboardSquare01Icon, 'LayoutGrid');
export const ListFilter = icon(FilterHorizontalIcon, 'ListFilter');
export const Loader2 = icon(Loading03Icon, 'Loader2');
export const Lock = icon(SquareLock02Icon, 'Lock');
export const LogIn = icon(Login03Icon, 'LogIn');
export const LogOut = icon(Logout03Icon, 'LogOut');
export const Mail = icon(Mail01Icon, 'Mail');
export const Menu = icon(Menu01Icon, 'Menu');
export const MessageCircle = icon(Message01Icon, 'MessageCircle');
export const Moon = icon(Moon02Icon, 'Moon');
export const MoreHorizontal = icon(MoreHorizontalIcon, 'MoreHorizontal');
export const Play = icon(PlayIcon, 'Play');
export const Plus = icon(Add01Icon, 'Plus');
export const RefreshCw = icon(RefreshIcon, 'RefreshCw');
export const Repeat2 = icon(RepeatIcon, 'Repeat2');
export const Search = icon(Search01Icon, 'Search');
export const Send = icon(SentIcon, 'Send');
export const Settings = icon(Settings01Icon, 'Settings');
export const Share = icon(Share08Icon, 'Share');
export const Shield = icon(Shield01Icon, 'Shield');
export const Smartphone = icon(SmartPhone01Icon, 'Smartphone');
export const Sparkles = icon(SparklesIcon, 'Sparkles');
export const Star = icon(StarIcon, 'Star');
export const Sun = icon(Sun03Icon, 'Sun');
export const Tag = icon(Tag01Icon, 'Tag');
export const Trash2 = icon(Delete02Icon, 'Trash2');
export const Trophy = icon(ChampionIcon, 'Trophy');
export const Users = icon(UserGroupIcon, 'Users');
export const X = icon(Cancel01Icon, 'X');

export const Calendar = icon(Calendar03Icon, 'Calendar');
export const ChevronUp = icon(ArrowUp01Icon, 'ChevronUp');
export const Circle = icon(CircleIcon, 'Circle');
export const Minus = icon(MinusSignIcon, 'Minus');
export const TriangleAlert = icon(Alert02Icon, 'TriangleAlert');
export const OctagonX = icon(CancelCircleIcon, 'OctagonX');

export {
  Check as CheckIcon,
  CheckCircle2 as CircleCheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  Circle as CircleIcon,
  Info as InfoIcon,
  Loader2 as Loader2Icon,
  Minus as MinusIcon,
  OctagonX as OctagonXIcon,
  Search as SearchIcon,
  TriangleAlert as TriangleAlertIcon,
  X as XIcon,
};
