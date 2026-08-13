'use client';

import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  /** Mensagem vinda do parâmetro `?ok=` depois de uma gravação bem sucedida. */
  message: string;
}

const VISIBLE_MS = 2600;

/**
 * Confirmação de operação (FR-035).
 *
 * Após aparecer, limpa o parâmetro da URL para que um refresh não repita a
 * mensagem, sem adicionar entrada no histórico do navegador.
 */
export function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS);

    const url = new URL(window.location.href);
    if (url.searchParams.has('ok')) {
      url.searchParams.delete('ok');
      window.history.replaceState(null, '', url.toString());
    }

    return () => clearTimeout(timer);
    // Cada mensagem chega em uma navegação nova, que remonta o componente.
  }, []);

  if (!message || !visible) return null;

  return (
    <output className={styles.toast} aria-live="polite">
      {message}
    </output>
  );
}
