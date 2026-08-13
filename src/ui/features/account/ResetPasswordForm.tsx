'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { resetPasswordAction } from '@/app/actions/auth-actions';
import { Field } from '@/ui/components/Field';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import styles from './AccountForm.module.css';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(resetPasswordAction, IDLE);
  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="token" value={token} />

      {state.status === 'error' ? (
        <strong className={styles.alert} role="alert">
          {state.message}
        </strong>
      ) : null}

      <Field label="Nova senha" htmlFor="password" error={errors.password} hint="No mínimo 8 caracteres.">
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          invalid={Boolean(errors.password)}
        />
      </Field>

      <div className={styles.submit}>
        <SubmitButton full pendingLabel="Salvando…">
          Redefinir senha
        </SubmitButton>
      </div>
    </form>
  );
}
