import { BrandLockup } from '@/components/brand/Logo';

export function BrandMark({
  href = '/',
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return <BrandLockup href={href} className={className} />;
}
