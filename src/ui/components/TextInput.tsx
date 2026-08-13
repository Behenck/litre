import type { InputHTMLAttributes } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Fonte monoespaçada para números e placas — alinha as colunas na leitura. */
  mono?: boolean;
  large?: boolean;
  invalid?: boolean;
}

export function TextInput({ mono, large, invalid, className, ...props }: TextInputProps) {
  const classes = [styles.input, mono ? styles.mono : '', large ? styles.large : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return <input {...props} className={classes} aria-invalid={invalid || undefined} />;
}
