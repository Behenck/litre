import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './OptionPill.module.css';

interface OptionPillProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  children: ReactNode;
  /** `card` é a variante alta usada na escolha de tipo de veículo. */
  variant?: 'pill' | 'card';
}

/**
 * Opção exclusiva desenhada como pílula.
 *
 * É um `input[type=radio]` de verdade: navega por teclado, entra no FormData e
 * funciona antes da hidratação. O estilo de selecionado vem de `:checked`.
 */
export function OptionPill({ children, variant = 'pill', className, ...props }: OptionPillProps) {
  const classes = [styles.option, variant === 'card' ? styles.card : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input {...props} type="radio" className={styles.input} />
      <span className={styles.content}>{children}</span>
    </label>
  );
}
