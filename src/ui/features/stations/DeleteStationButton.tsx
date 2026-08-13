'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { deleteStationAction } from '@/app/actions/station-actions';
import { SubmitButton } from '@/ui/components/SubmitButton';
import styles from './DeleteStationButton.module.css';

interface DeleteStationButtonProps {
  stationId: string;
  stationName: string;
}

export function DeleteStationButton({ stationId, stationName }: DeleteStationButtonProps) {
  const [, formAction] = useActionState(deleteStationAction, IDLE);

  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Remover ${stationName} da lista de postos?`)) event.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={confirmDelete} className={styles.form}>
      <input type="hidden" name="id" value={stationId} />
      <SubmitButton variant="danger" pendingLabel="Removendo…" full>
        Remover posto
      </SubmitButton>
    </form>
  );
}
