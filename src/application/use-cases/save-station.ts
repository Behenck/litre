import type { StationRepository } from '../ports/station-repository';
import { ok, type Result } from '@/domain/shared/result';
import { createStation, type Station, type StationInput } from '@/domain/station/station';

/**
 * Salva um posto.
 *
 * Nome já conhecido atualiza o registro existente: o id do posto é preservado
 * para que a identidade não mude a cada anotação de preço.
 */
export async function saveStation(repository: StationRepository, input: StationInput): Promise<Result<Station>> {
  const candidate = createStation(input);
  if (!candidate.ok) return candidate;

  const existing = await repository.findByNameKey(candidate.value.nameKey);
  const station: Station = existing ? { ...candidate.value, id: existing.id } : candidate.value;

  await repository.save(station);
  return ok(station);
}
