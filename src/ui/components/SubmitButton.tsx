'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';
import { PrimaryButton } from './PrimaryButton';

interface SubmitButtonProps {
  children: ReactNode;
  /** Rótulo exibido enquanto a action está em voo. */
  pendingLabel?: string;
  variant?: 'primary' | 'ghost' | 'danger';
  full?: boolean;
}

/**
 * Botão de envio ciente do estado do formulário.
 *
 * É o menor componente possível marcado como cliente: `useFormStatus` só
 * funciona dentro de um filho do `<form>`, e assim o formulário em volta
 * continua podendo ser servidor.
 */
export function SubmitButton({ children, pendingLabel = 'Salvando…', variant = 'primary', full }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <PrimaryButton type="submit" variant={variant} full={full} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </PrimaryButton>
  );
}
