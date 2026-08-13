/**
 * E-mail como identidade da conta.
 *
 * `emailKey` é a forma normalizada: quem digita "Joao@Gmail.com " entra na
 * mesma conta de "joao@gmail.com".
 */

import { fail, ok, type Result } from '../shared/result';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const MAX_EMAIL = 120;

export function emailKey(email: string): string {
  return email.trim().toLowerCase();
}

export function createEmail(raw: string): Result<string> {
  const email = raw.trim();
  if (email === '') {
    return fail('campo-obrigatorio', 'Informe o seu e-mail.', 'email');
  }
  if (email.length > MAX_EMAIL) {
    return fail('fora-de-faixa', `O e-mail deve ter até ${MAX_EMAIL} caracteres.`, 'email');
  }
  if (!EMAIL_PATTERN.test(email)) {
    return fail('valor-invalido', 'Esse e-mail não parece válido.', 'email');
  }
  return ok(emailKey(email));
}
