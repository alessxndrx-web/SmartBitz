import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type BaseProps = {
  variant?: ButtonVariant;
  className?: string;
};

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & BaseProps>;
type LinkButtonProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement> & BaseProps & { href: string }>;

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}

function getVariantClass(variant: ButtonVariant = 'primary') {
  if (variant === 'secondary') return 'btn btn-secondary';
  if (variant === 'ghost') return 'btn btn-ghost';
  return 'btn btn-primary';
}

export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button className={classNames(getVariantClass(variant), className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ children, href, variant = 'primary', className, ...props }: LinkButtonProps) {
  return (
    <Link className={classNames(getVariantClass(variant), className)} href={href} {...props}>
      {children}
    </Link>
  );
}
