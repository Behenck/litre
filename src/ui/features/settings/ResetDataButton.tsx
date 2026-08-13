'use client';

import { resetSeedDataAction } from '@/app/actions/preference-actions';
import { SubmitButton } from '@/ui/components/SubmitButton';

/**
 * Restauração dos dados de exemplo.
 *
 * A operação apaga os dados atuais, então a confirmação é explícita sobre isso.
 */
export function ResetDataButton() {
  function confirmReset(event: React.FormEvent<HTMLFormElement>) {
    const message = 'Isso apaga seus veículos, abastecimentos e postos e recarrega os dados de exemplo. Continuar?';
    if (!window.confirm(message)) event.preventDefault();
  }

  return (
    <form action={resetSeedDataAction} onSubmit={confirmReset}>
      <SubmitButton variant="danger" pendingLabel="Restaurando…">
        Restaurar
      </SubmitButton>
    </form>
  );
}
