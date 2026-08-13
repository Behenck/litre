'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/app/auth/current-user';
import { deleteStation } from '@/application/use-cases/delete-station';
import { saveStation } from '@/application/use-cases/save-station';
import { updateRegion } from '@/application/use-cases/update-region';
import { parseOptionalMoneyPtBr } from '@/domain/shared/number-parser';
import { getContainer } from '@/infrastructure/container';
import { type ActionState, toActionState } from './action-state';
import { text } from './form-parsing';

/**
 * O preço anotado aqui é coletivo: entra na praça do motorista e aparece na
 * hora para todo mundo que dirige na mesma cidade.
 */
export async function saveStationAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const gasoline = parseOptionalMoneyPtBr(text(form, 'gasoline'), 'gasoline');
  if (!gasoline.ok) return toActionState(gasoline.error);

  const ethanol = parseOptionalMoneyPtBr(text(form, 'ethanol'), 'ethanol');
  if (!ethanol.ok) return toActionState(ethanol.error);

  const diesel = parseOptionalMoneyPtBr(text(form, 'diesel'), 'diesel');
  if (!diesel.ok) return toActionState(diesel.error);

  const user = await requireUser();
  const result = await saveStation(getContainer().stations, user, {
    name: text(form, 'name'),
    gasolinePrice: gasoline.value,
    ethanolPrice: ethanol.value,
    dieselPrice: diesel.value,
  });

  if (!result.ok) return toActionState(result.error);

  revalidatePath('/postos');
  redirect(`/postos?ok=${encodeURIComponent('Preços salvos')}`);
}

export async function deleteStationAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const result = await deleteStation(getContainer().stations, user, text(form, 'id'));

  if (!result.ok) return toActionState(result.error);

  revalidatePath('/postos');
  redirect(`/postos?ok=${encodeURIComponent('Posto removido')}`);
}

/** Troca a cidade do motorista — muda a praça de postos que ele enxerga. */
export async function updateRegionAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();

  const result = await updateRegion(getContainer().users, user, {
    city: text(form, 'city'),
    state: text(form, 'state'),
  });

  if (!result.ok) return toActionState(result.error);

  revalidatePath('/', 'layout');
  redirect(`/postos?ok=${encodeURIComponent('Cidade atualizada')}`);
}
