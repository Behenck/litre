import type { ReactNode } from 'react';
import styles from './AuthShell.module.css';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Linha de saída da tela: o caminho para a outra porta (entrar ↔ criar conta). */
  footer?: ReactNode;
}

/**
 * Moldura das telas de conta.
 *
 * Fora do app: sem abas de navegação, porque quem não entrou não tem para onde
 * navegar. Um cartão centralizado, que no celular ocupa a tela toda.
 */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            L
          </span>
          <span className={styles.name}>Litro</span>
        </div>

        <section className={styles.card}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          {children}
        </section>

        {footer ? <p className={styles.footer}>{footer}</p> : null}
      </div>
    </div>
  );
}
