/**
 * Entidade Usuário.
 *
 * Guarda apenas o hash da senha — a senha em texto puro não entra na entidade,
 * não é persistida e não aparece em log. A região faz parte do cadastro porque
 * é ela que liga o motorista aos postos da sua cidade.
 */

import { type Id, newId } from '../shared/id';
import { nowTimestamp } from '../shared/iso-date';
import { createRegion, type Region } from '../shared/region';
import { fail, ok, type Result } from '../shared/result';
import { createEmail } from './email';

export interface User {
  readonly id: Id;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly city: string;
  readonly state: string;
  /** `PR:curitiba` — chave da praça de postos que o usuário enxerga. */
  readonly regionKey: string;
  /** `null` enquanto o e-mail não foi confirmado; sem isso não há login. */
  readonly emailVerifiedAt: string | null;
  readonly createdAt: string;
}

export interface UserInput {
  readonly id?: Id;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly city: string;
  readonly state: string;
  readonly emailVerifiedAt?: string | null;
  readonly createdAt?: string;
}

const MIN_NAME = 2;
const MAX_NAME = 60;

export function createUser(input: UserInput): Result<User> {
  const name = input.name.trim().replace(/\s+/g, ' ');
  if (name === '') {
    return fail('campo-obrigatorio', 'Informe o seu nome.', 'name');
  }
  if (name.length < MIN_NAME || name.length > MAX_NAME) {
    return fail('fora-de-faixa', `O nome deve ter entre ${MIN_NAME} e ${MAX_NAME} caracteres.`, 'name');
  }

  const email = createEmail(input.email);
  if (!email.ok) return email;

  if (input.passwordHash.trim() === '') {
    return fail('campo-obrigatorio', 'Informe uma senha.', 'password');
  }

  const region = createRegion(input.city, input.state);
  if (!region.ok) return region;

  return ok({
    id: input.id ?? newId(),
    name,
    email: email.value,
    passwordHash: input.passwordHash,
    city: region.value.city,
    state: region.value.state,
    regionKey: region.value.key,
    emailVerifiedAt: input.emailVerifiedAt ?? null,
    createdAt: input.createdAt ?? nowTimestamp(),
  });
}

export function isVerified(user: User): boolean {
  return user.emailVerifiedAt !== null;
}

/** Marca o e-mail como confirmado. Confirmar de novo não reescreve a data. */
export function markVerified(user: User, at: string = nowTimestamp()): User {
  return isVerified(user) ? user : { ...user, emailVerifiedAt: at };
}

/** Troca a praça do motorista — ele mudou de cidade ou errou no cadastro. */
export function moveTo(user: User, region: Region): User {
  return { ...user, city: region.city, state: region.state, regionKey: region.key };
}
