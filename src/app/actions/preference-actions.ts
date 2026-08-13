'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/app/auth/current-user';
import { isConsumptionUnit } from '@/domain/shared/consumption-unit';
import { isTheme } from '@/application/ports/preferences-store';
import { getContainer } from '@/infrastructure/container';

/**
 * Ações de preferência.
 *
 * Sem regra de negócio: validam a forma, gravam pela porta e revalidam o layout.
 */

export async function toggleThemeAction(): Promise<void> {
  const { preferences } = getContainer();
  const current = await preferences.read();
  await preferences.write({ theme: current.theme === 'escuro' ? 'claro' : 'escuro' });
  revalidatePath('/', 'layout');
}

export async function setThemeAction(formData: FormData): Promise<void> {
  const value = String(formData.get('theme') ?? '');
  if (!isTheme(value)) return;

  await getContainer().preferences.write({ theme: value });
  revalidatePath('/', 'layout');
}

export async function setUnitAction(formData: FormData): Promise<void> {
  const value = String(formData.get('unit') ?? '');
  if (!isConsumptionUnit(value)) return;

  await getContainer().preferences.write({ unit: value });
  revalidatePath('/', 'layout');
}

export async function toggleUnitAction(): Promise<void> {
  const { preferences } = getContainer();
  const current = await preferences.read();
  await preferences.write({ unit: current.unit === 'km/l' ? 'l/100km' : 'km/l' });
  revalidatePath('/', 'layout');
}

/** Restaura o conjunto de demonstração na conta de quem pediu (FR-036). */
export async function resetSeedDataAction(): Promise<void> {
  const user = await requireUser();
  await getContainer().seed.reset(user);
  revalidatePath('/', 'layout');
  redirect(`/?ok=${encodeURIComponent('Dados de exemplo restaurados')}`);
}
