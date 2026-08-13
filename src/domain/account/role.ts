/**
 * Papel do usuário na conta.
 *
 * Só existem dois: admin e membro. Não há como um usuário virar admin pelo
 * app — a coluna é setada direto no banco, fora do alcance de qualquer tela
 * ou ação.
 */

export type Role = 'admin' | 'membro';

export function isAdmin(subject: { readonly role: Role }): boolean {
  return subject.role === 'admin';
}
