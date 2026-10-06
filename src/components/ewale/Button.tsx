import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ShadcnVariant = NonNullable<ComponentProps<typeof ShadcnButton>['variant']>;
type ShadcnSize = NonNullable<ComponentProps<typeof ShadcnButton>['size']>;

type MarketingVariant = ShadcnVariant | 'outlineLight' | 'dark';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: MarketingVariant;
  size?: ShadcnSize;
  icon?: string;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  onClick?: ComponentProps<'button'>['onClick'];
};

function resolveVariant(variant: MarketingVariant): {
  variant: ShadcnVariant;
  className?: string;
} {
  if (variant === 'outlineLight') {
    return {
      variant: 'outline',
      className: 'border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white',
    };
  }
  if (variant === 'dark') {
    return {
      variant: 'secondary',
      className: 'bg-ink text-white hover:bg-ink/90',
    };
  }
  return { variant };
}

/** Marketing button — shadcn Button with optional Next.js Link. */
export function Button({
  children,
  className,
  variant = 'default',
  size = 'default',
  icon,
  disabled,
  title,
  type = 'button',
  href,
  onClick,
}: Props) {
  const resolved = resolveVariant(variant);
  const mergedClass = cn(resolved.className, className);
  const content = (
    <>
      {icon ? <i className={`bi text-[0.95em] ${icon}`} aria-hidden /> : null}
      {children}
    </>
  );

  if (href) {
    return (
      <ShadcnButton
        asChild
        variant={resolved.variant}
        size={size}
        className={mergedClass}
        disabled={disabled}
        title={title}
      >
        <Link href={href} title={title}>
          {content}
        </Link>
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton
      type={type}
      variant={resolved.variant}
      size={size}
      className={mergedClass}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {content}
    </ShadcnButton>
  );
}
