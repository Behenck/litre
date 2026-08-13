import { cookies } from 'next/headers';
import { type Preferences, type PreferencesStore, isTheme } from '@/application/ports/preferences-store';
import { DEFAULT_UNIT, isConsumptionUnit } from '@/domain/shared/consumption-unit';

export const THEME_COOKIE = 'litro.tema';
export const UNIT_COOKIE = 'litro.unidade';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Preferências em cookie.
 *
 * Cookie (e não banco) porque tema é preferência de dispositivo e porque o
 * servidor precisa conhecê-lo antes da primeira pintura.
 */
export class CookiePreferencesStore implements PreferencesStore {
  async read(): Promise<Preferences> {
    const store = await cookies();
    const theme = store.get(THEME_COOKIE)?.value ?? '';
    const unit = store.get(UNIT_COOKIE)?.value ?? '';

    return {
      theme: isTheme(theme) ? theme : 'claro',
      unit: isConsumptionUnit(unit) ? unit : DEFAULT_UNIT,
    };
  }

  async write(preferences: Partial<Preferences>): Promise<void> {
    const store = await cookies();
    const options = { path: '/', maxAge: ONE_YEAR_SECONDS, sameSite: 'lax' as const };

    if (preferences.theme) store.set(THEME_COOKIE, preferences.theme, options);
    if (preferences.unit) store.set(UNIT_COOKIE, preferences.unit, options);
  }
}
