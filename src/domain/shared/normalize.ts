/**
 * Normalização de texto usada como chave natural.
 *
 * "Shell  Av. Brasil" e "shell av. brasil" são o mesmo posto; "São José" e
 * "sao jose" são a mesma cidade. Quem compara é sempre a forma normalizada.
 */
export function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}
