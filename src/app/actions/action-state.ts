import type { DomainError } from '@/domain/shared/result';

/**
 * Estado devolvido por toda Server Action.
 *
 * `fieldErrors` alimenta a mensagem embaixo do campo, sem descartar o que o
 * usuário já digitou.
 */
export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

export const IDLE: ActionState = { status: 'idle' };

/** Traduz um erro de domínio para o formato que o formulário entende. */
export function toActionState(error: DomainError): ActionState {
  return {
    status: 'error',
    message: error.message,
    fieldErrors: error.field ? { [error.field]: error.message } : undefined,
  };
}

export function errorState(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { status: 'error', message, fieldErrors };
}
