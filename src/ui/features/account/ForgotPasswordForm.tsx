'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { requestPasswordResetAction } from '@/app/actions/auth-actions';
import { Field } from '@/ui/components/Field';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import styles from './AccountForm.module.css';

/** Pede o link de redefinição. A resposta é a mesma exista ou não a conta. */
export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, IDLE);

  if (state.status === 'success') {
    return (
      <span className={styles.notice} role="status">
        {state.message}
      </span>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.status === 'error' ? (
        <strong className={styles.alert} role="alert">
          {state.message}
        </strong>
      ) : null}

      <Field label="E-mail" htmlFor="email">
        <TextInput
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
        />
      </Field>

      <div className={styles.submit}>
        <SubmitButton full pendingLabel="Enviando…">
          Enviar link de redefinição
        </SubmitButton>
      </div>
    </form>
  );
}
