'use client';

import { useTransition } from 'react';
import type { Theme } from '@/application/ports/preferences-store';
import { toggleThemeAction } from '@/app/actions/preference-actions';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: Theme;
  /** `compact` é a versão do cabeçalho; `full` a da tela de ajustes. */
  variant?: 'compact' | 'full';
}

/**
 * Alternador de tema com atualização otimista.
 *
 * O atributo `data-theme` do <html> muda na hora e a Server Action grava o
 * cookie em seguida — a troca parece instantânea sem recarregar a página.
 */
export function ThemeToggle({ theme, variant = 'compact' }: ThemeToggleProps) {
  const [pending, startTransition] = useTransition();
  const next: Theme = theme === 'escuro' ? 'claro' : 'escuro';

  function handleClick() {
    document.documentElement.dataset.theme = next;
    startTransition(() => {
      void toggleThemeAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={variant === 'full' ? `${styles.toggle} ${styles.full}` : styles.toggle}
      title={`Mudar para o tema ${next}`}
      aria-label={`Tema atual: ${theme}. Mudar para o tema ${next}.`}
    >
      <span aria-hidden="true">{theme === 'escuro' ? '◐' : '◑'}</span>
      <span className={styles.label}>{theme === 'escuro' ? 'Escuro' : 'Claro'}</span>
    </button>
  );
}
