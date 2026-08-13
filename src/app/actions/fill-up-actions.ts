'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/app/auth/current-user';
import { deleteFillUp } from '@/application/use-cases/delete-fill-up';
import { registerFillUp } from '@/application/use-cases/register-fill-up';
import { getContainer } from '@/infrastructure/container';
import { type ActionState, toActionState } from './action-state';
import { checkbox, decimal, money, text } from './form-parsing';

export async function createFillUpAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const odometer = decimal(form, 'odometer', 'odometer');
  if (!odometer.ok) return toActionState(odometer.error);

  const liters = decimal(form, 'liters', 'liters');
  if (!liters.ok) return toActionState(liters.error);

  const total = money(form, 'total', 'total');
  if (!total.ok) return toActionState(total.error);

  const vehicleId = text(form, 'vehicleId');
  const { fillUps, vehicles } = getContainer();
  const user = await requireUser();

  const result = await registerFillUp(fillUps, vehicles, user.id, {
    vehicleId,
    date: text(form, 'date'),
    odometer: odometer.value,
    liters: liters.value,
    total: total.value,
    fuel: text(form, 'fuel'),
    stationName: text(form, 'stationName'),
    fullTank: checkbox(form, 'fullTank'),
  });

  if (!result.ok) return toActionState(result.error);

  revalidatePath('/', 'layout');
  redirect(`/painel?veiculo=${encodeURIComponent(vehicleId)}&ok=${encodeURIComponent('Abastecimento salvo')}`);
}

export async function deleteFillUpAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const id = text(form, 'id');
  const vehicleId = text(form, 'vehicleId');

  const user = await requireUser();
  const result = await deleteFillUp(getContainer().fillUps, user.id, id);
  if (!result.ok) return toActionState(result.error);

  revalidatePath('/', 'layout');
  redirect(`/historico?veiculo=${encodeURIComponent(vehicleId)}&ok=${encodeURIComponent('Abastecimento excluído')}`);
}
