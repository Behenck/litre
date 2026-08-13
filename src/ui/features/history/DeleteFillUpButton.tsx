'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { deleteFillUpAction } from '@/app/actions/fill-up-actions';
import styles from './DeleteFillUpButton.module.css';

interface DeleteFillUpButtonProps {
  fillUpId: string;
  vehicleId: string;
}

/** Exclusão de um lançamento, com confirmação — erro de digitação é comum aqui. */
export function DeleteFillUpButton({ fillUpId, vehicleId }: DeleteFillUpButtonProps) {
  const [, formAction] = useActionState(deleteFillUpAction, IDLE);

  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm('Excluir este abastecimento? A média será recalculada.')) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={fillUpId} />
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <button type="submit" className={styles.button} title="Excluir abastecimento" aria-label="Excluir abastecimento">
        ×
      </button>
    </form>
  );
}
