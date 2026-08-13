import type { EmailVerificationRepository } from '@/application/ports/email-verification-repository';
import type { FillUpRepository } from '@/application/ports/fill-up-repository';
import type { Mailer } from '@/application/ports/mailer';
import type { PasswordHasher } from '@/application/ports/password-hasher';
import type { PasswordResetRepository } from '@/application/ports/password-reset-repository';
import type { PreferencesStore } from '@/application/ports/preferences-store';
import type { SecretTokens } from '@/application/ports/secret-tokens';
import type { SeedDataSource } from '@/application/ports/seed-data-source';
import type { SessionCookie } from '@/application/ports/session-cookie';
import type { SessionRepository } from '@/application/ports/session-repository';
import type { SessionTokens } from '@/application/ports/session-tokens';
import type { StationRepository } from '@/application/ports/station-repository';
import type { UserRepository } from '@/application/ports/user-repository';
import type { VehicleRepository } from '@/application/ports/vehicle-repository';
import { CookieSession } from './auth/cookie-session';
import { JwtSessionTokens } from './auth/jwt-session-tokens';
import { RandomSecretTokens } from './auth/random-secret-tokens';
import { ScryptPasswordHasher } from './auth/scrypt-password-hasher';
import { ResendMailer } from './mail/resend-mailer';
import { CookiePreferencesStore } from './preferences/cookie-preferences-store';
import { SqliteFillUpRepository } from './sqlite/sqlite-fill-up-repository';
import { SqliteSeedDataSource } from './sqlite/sqlite-seed-data-source';
import { SqliteStationRepository } from './sqlite/sqlite-station-repository';
import { SqliteVehicleRepository } from './sqlite/sqlite-vehicle-repository';
import {
  UnsupportedEmailVerificationRepository,
  UnsupportedPasswordResetRepository,
  UnsupportedSessionRepository,
  UnsupportedUserRepository,
} from './sqlite/unsupported-auth';
import { SupabaseEmailVerificationRepository } from './supabase/supabase-email-verification-repository';
import { SupabaseFillUpRepository } from './supabase/supabase-fill-up-repository';
import { SupabasePasswordResetRepository } from './supabase/supabase-password-reset-repository';
import { SupabaseSeedDataSource } from './supabase/supabase-seed-data-source';
import { SupabaseSessionRepository } from './supabase/supabase-session-repository';
import { SupabaseStationRepository } from './supabase/supabase-station-repository';
import { SupabaseUserRepository } from './supabase/supabase-user-repository';
import { SupabaseVehicleRepository } from './supabase/supabase-vehicle-repository';

/**
 * Composition root — o único lugar do sistema que conhece implementações concretas.
 *
 * O driver é selecionado por LITRO_DB_DRIVER; domínio, casos de uso e UI dependem
 * somente das portas e não conhecem SQLite, Supabase, scrypt nem Resend.
 *
 * As peças de autenticação que não dependem de banco (assinatura do token, hash
 * de senha, cookie, e-mail) são as mesmas nos dois drivers; o que muda é onde
 * conta e sessão ficam guardadas.
 */

export interface Container {
  readonly vehicles: VehicleRepository;
  readonly fillUps: FillUpRepository;
  readonly stations: StationRepository;
  readonly users: UserRepository;
  readonly sessions: SessionRepository;
  readonly verifications: EmailVerificationRepository;
  readonly passwordResets: PasswordResetRepository;
  readonly passwords: PasswordHasher;
  readonly tokens: SessionTokens;
  readonly secrets: SecretTokens;
  readonly sessionCookie: SessionCookie;
  readonly mailer: Mailer;
  readonly preferences: PreferencesStore;
  readonly seed: SeedDataSource;
}

type Driver = 'sqlite' | 'supabase';

let container: Container | null = null;

function sharedServices() {
  return {
    passwords: new ScryptPasswordHasher(),
    tokens: new JwtSessionTokens(),
    secrets: new RandomSecretTokens(),
    sessionCookie: new CookieSession(),
    mailer: new ResendMailer(),
    preferences: new CookiePreferencesStore(),
  };
}

function buildContainer(): Container {
  const driver = (process.env.LITRO_DB_DRIVER ?? 'sqlite') as Driver;

  switch (driver) {
    case 'sqlite':
      return {
        ...sharedServices(),
        vehicles: new SqliteVehicleRepository(),
        fillUps: new SqliteFillUpRepository(),
        stations: new SqliteStationRepository(),
        users: new UnsupportedUserRepository(),
        sessions: new UnsupportedSessionRepository(),
        verifications: new UnsupportedEmailVerificationRepository(),
        passwordResets: new UnsupportedPasswordResetRepository(),
        seed: new SqliteSeedDataSource(),
      };
    case 'supabase':
      return {
        ...sharedServices(),
        vehicles: new SupabaseVehicleRepository(),
        fillUps: new SupabaseFillUpRepository(),
        stations: new SupabaseStationRepository(),
        users: new SupabaseUserRepository(),
        sessions: new SupabaseSessionRepository(),
        verifications: new SupabaseEmailVerificationRepository(),
        passwordResets: new SupabasePasswordResetRepository(),
        seed: new SupabaseSeedDataSource(),
      };
    default:
      throw new Error(`Driver de banco desconhecido: ${String(driver)}`);
  }
}

export function getContainer(): Container {
  container ??= buildContainer();
  return container;
}

/**
 * Endereço público do app, usado para montar o link do e-mail de confirmação.
 *
 * Em produção o link precisa apontar para o domínio real, e o servidor não tem
 * como adivinhá-lo a partir do request de uma Server Action.
 */
export function appUrl(): string {
  return (process.env.LITRO_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}
