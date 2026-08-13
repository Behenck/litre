import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label: string;
  htmlFor: string;
  /** Mensagem de erro do campo; quando presente, é anunciada por leitores de tela. */
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * Rótulo, controle e mensagem de um campo.
 *
 * O controle recebe `aria-describedby` apontando para a mensagem, para que quem
 * usa leitor de tela ouça o erro ao chegar no campo — e não só quando ele surge.
 */
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  const messageId = error ? `${htmlFor}-erro` : hint ? `${htmlFor}-dica` : undefined;

  const control =
    messageId && isValidElement(children)
      ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': messageId })
      : children;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {control}
      {hint && !error ? (
        <span className={styles.hint} id={`${htmlFor}-dica`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className={styles.error} id={`${htmlFor}-erro`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
