'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { signInAction } from '@/app/actions/auth-actions';
import { Field } from '@/ui/components/Field';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import styles from './AccountForm.module.css';

export function SignInForm() {
  const [state, formAction] = useActionState(signInAction, IDLE);
  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.status === 'error' ? (
        <strong className={styles.alert} role="alert">
          {state.message}
        </strong>
      ) : null}

      <Field label="E-mail" htmlFor="email" error={errors.email}>
        <TextInput
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          invalid={Boolean(errors.email)}
        />
      </Field>

      <Field label="Senha" htmlFor="password" error={errors.password}>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          invalid={Boolean(errors.password)}
        />
      </Field>

      <div className={styles.submit}>
        <SubmitButton full pendingLabel="Entrando…">
          Entrar
        </SubmitButton>
      </div>
    </form>
  );
}
