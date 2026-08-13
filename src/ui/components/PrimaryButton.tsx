import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './PrimaryButton.module.css';

type Variant = 'primary' | 'ghost' | 'danger';

function classesFor(variant: Variant, full: boolean, extra?: string): string {
  return [styles.button, styles[variant], full ? styles.full : '', extra ?? ''].filter(Boolean).join(' ');
}

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
  children: ReactNode;
}

export function PrimaryButton({ variant = 'primary', full = false, className, children, ...props }: PrimaryButtonProps) {
  return (
    <button {...props} className={classesFor(variant, full, className)}>
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  full?: boolean;
  className?: string;
  children: ReactNode;
}

/** Mesma aparência do botão, mas navegação de verdade (link, não `onClick`). */
export function ButtonLink({ href, variant = 'primary', full = false, className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={classesFor(variant, full, className)}>
      {children}
    </Link>
  );
}
