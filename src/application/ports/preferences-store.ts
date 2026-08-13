import type { ConsumptionUnit } from '@/domain/shared/consumption-unit';

export const THEMES = ['claro', 'escuro'] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

export interface Preferences {
  readonly theme: Theme;
  readonly unit: ConsumptionUnit;
}

/**
 * Porta de preferências do usuário.
 *
 * Implementada hoje sobre cookies: o servidor já conhece o tema na primeira
 * resposta, o que elimina o flash de tema claro antes do escuro.
 */
export interface PreferencesStore {
  read(): Promise<Preferences>;
  write(preferences: Partial<Preferences>): Promise<void>;
}
