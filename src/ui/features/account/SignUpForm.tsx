'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { signUpAction } from '@/app/actions/auth-actions';
import { Field } from '@/ui/components/Field';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import styles from './AccountForm.module.css';
import { StateSelect } from './StateSelect';

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, IDLE);
  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.status === 'error' ? (
        <strong className={styles.alert} role="alert">
          {state.message}
        </strong>
      ) : null}

      <Field label="Como te chamamos?" htmlFor="name" error={errors.name}>
        <TextInput
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Seu nome"
          required
          invalid={Boolean(errors.name)}
        />
      </Field>

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

      <Field
        label="Senha"
        htmlFor="password"
        error={errors.password}
        hint="No mínimo 8 caracteres."
      >
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

      <div className={styles.pair}>
        <Field
          label="Sua cidade"
          htmlFor="city"
          error={errors.city}
          hint="É por ela que você vê os preços anotados por outros motoristas."
        >
          <TextInput
            id="city"
            name="city"
            autoComplete="address-level2"
            placeholder="Curitiba"
            required
            invalid={Boolean(errors.city)}
          />
        </Field>

        <Field label="Estado" htmlFor="state" error={errors.state}>
          <StateSelect id="state" name="state" invalid={Boolean(errors.state)} />
        </Field>
      </div>

      <div className={styles.submit}>
        <SubmitButton full pendingLabel="Criando conta…">
          Criar conta
        </SubmitButton>
      </div>
    </form>
  );
}
