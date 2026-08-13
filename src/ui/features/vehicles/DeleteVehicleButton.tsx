'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { deleteVehicleAction } from '@/app/actions/vehicle-actions';
import { SubmitButton } from '@/ui/components/SubmitButton';
import styles from './DeleteVehicleButton.module.css';

interface DeleteVehicleButtonProps {
  vehicleId: string;
  fillUpCount: number;
  vehicleName?: string;
}

/**
 * Exclusão de veículo.
 *
 * A confirmação diz quantos abastecimentos somem junto — a perda precisa ser
 * explícita antes do clique, não depois.
 */
export function DeleteVehicleButton({
  vehicleId,
  fillUpCount,
  vehicleName,
}: DeleteVehicleButtonProps) {
  const [state, formAction] = useActionState(deleteVehicleAction, IDLE);

  const subject = vehicleName ? ` o veículo “${vehicleName}”` : ' este veículo';
  const fillUps = fillUpCount === 1 ? '1 abastecimento registrado' : `${fillUpCount} abastecimentos registrados`;
  const detail = `Excluir${subject}?${fillUpCount > 0 ? ` Isso também removerá ${fillUps}.` : ''} Esta ação não pode ser desfeita.`;

  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(detail)) event.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={vehicleId} />
      <SubmitButton variant="danger" pendingLabel="Excluindo…">
        Excluir veículo
      </SubmitButton>
      {state.status === 'error' ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
