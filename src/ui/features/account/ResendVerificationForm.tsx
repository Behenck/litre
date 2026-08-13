'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { resendVerificationAction } from '@/app/actions/auth-actions';
import { SubmitButton } from '@/ui/components/SubmitButton';
import styles from './AccountForm.module.css';

interface ResendVerificationFormProps {
  email: string;
}

/** Reenvia o link. A resposta é a mesma exista ou não a conta — não confirmamos e-mails a estranhos. */
export function ResendVerificationForm({ email }: ResendVerificationFormProps) {
  const [state, formAction] = useActionState(resendVerificationAction, IDLE);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="email" value={email} />

      {state.status === 'success' ? (
        <span className={styles.notice} role="status">
          {state.message}
        </span>
      ) : null}
      {state.status === 'error' ? (
        <strong className={styles.alert} role="alert">
          {state.message}
        </strong>
      ) : null}

      <SubmitButton full variant="ghost" pendingLabel="Enviando…">
        Reenviar e-mail
      </SubmitButton>
    </form>
  );
}
