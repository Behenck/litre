import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  /** Título curto em caixa alta que rotula o bloco no formulário. */
  legend?: string;
  className?: string;
}

export function Card({ children, legend, className }: CardProps) {
  return (
    <section className={className ? `${styles.card} ${className}` : styles.card}>
      {legend ? <h2 className={styles.legend}>{legend}</h2> : null}
      {children}
    </section>
  );
}
