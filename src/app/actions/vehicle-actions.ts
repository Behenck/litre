'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/app/auth/current-user';
import { deleteVehicle } from '@/application/use-cases/delete-vehicle';
import { saveVehicle } from '@/application/use-cases/save-vehicle';
import { getContainer } from '@/infrastructure/container';
import { type ActionState, toActionState } from './action-state';
import { decimalOrZero, integer, text } from './form-parsing';

/**
 * Fronteira dos veículos: confere quem está logado, extrai o formulário, delega
 * ao caso de uso e revalida. Nenhuma regra de negócio mora aqui.
 *
 * O dono vem sempre da sessão, nunca do formulário — campo escondido em HTML é
 * sugestão do navegador, não prova de identidade.
 */

function readForm(form: FormData) {
  return {
    id: text(form, 'id') || undefined,
    type: text(form, 'type'),
    brand: text(form, 'brand'),
    model: text(form, 'model'),
    year: integer(form, 'year'),
    plate: text(form, 'plate'),
    color: text(form, 'color'),
    mainFuel: text(form, 'mainFuel'),
    nickname: text(form, 'nickname'),
  };
}

export async function saveVehicleAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const odometer = decimalOrZero(form, 'odometer', 'odometer');
  if (!odometer.ok) return toActionState(odometer.error);

  const user = await requireUser();
  const result = await saveVehicle(getContainer().vehicles, user.id, {
    ...readForm(form),
    initialOdometer: odometer.value,
  });

  if (!result.ok) return toActionState(result.error);

  revalidatePath('/', 'layout');
  redirect(`/?ok=${encodeURIComponent('Veículo salvo')}`);
}

export async function deleteVehicleAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const result = await deleteVehicle(getContainer().vehicles, user.id, text(form, 'id'));

  if (!result.ok) return toActionState(result.error);

  const { removedFillUps } = result.value;
  const detail =
    removedFillUps === 1
      ? ' e 1 abastecimento'
      : removedFillUps > 1
        ? ` e ${removedFillUps} abastecimentos`
        : '';

  revalidatePath('/', 'layout');
  redirect(`/?ok=${encodeURIComponent(`Veículo${detail} removido${removedFillUps > 0 ? 's' : ''}`)}`);
}
