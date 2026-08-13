/**
 * Política de senha.
 *
 * O domínio julga a senha em texto puro; quem transforma em hash é a
 * infraestrutura (`PasswordHasher`). Assim a regra "senha curta demais" pode
 * ser testada sem criptografia nenhuma.
 */

import { fail, ok, type Result } from '../shared/result';

export const MIN_PASSWORD = 8;
/** Limite do bcrypt/scrypt na prática e barreira contra payload gigante. */
export const MAX_PASSWORD = 72;

export function validatePassword(raw: string, field = 'password'): Result<string> {
  if (raw === '') {
    return fail('campo-obrigatorio', 'Informe uma senha.', field);
  }
  if (raw.length < MIN_PASSWORD) {
    return fail('fora-de-faixa', `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`, field);
  }
  if (raw.length > MAX_PASSWORD) {
    return fail('fora-de-faixa', `A senha deve ter até ${MAX_PASSWORD} caracteres.`, field);
  }
  if (raw.trim() === '') {
    return fail('valor-invalido', 'A senha não pode ser só espaços.', field);
  }
  return ok(raw);
}
