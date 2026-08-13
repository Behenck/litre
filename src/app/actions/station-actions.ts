'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { saveStation } from '@/application/use-cases/save-station';
import { parseOptionalMoneyPtBr } from '@/domain/shared/number-parser';
import { getContainer } from '@/infrastructure/container';
import { type ActionState, toActionState } from './action-state';
import { text } from './form-parsing';

export async function saveStationAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const gasoline = parseOptionalMoneyPtBr(text(form, 'gasoline'), 'gasoline');
  if (!gasoline.ok) return toActionState(gasoline.error);

  const ethanol = parseOptionalMoneyPtBr(text(form, 'ethanol'), 'ethanol');
  if (!ethanol.ok) return toActionState(ethanol.error);

  const diesel = parseOptionalMoneyPtBr(text(form, 'diesel'), 'diesel');
  if (!diesel.ok) return toActionState(diesel.error);

  const result = await saveStation(getContainer().stations, {
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
  await getContainer().stations.delete(text(form, 'id'));

  revalidatePath('/postos');
  redirect(`/postos?ok=${encodeURIComponent('Posto removido')}`);
}
