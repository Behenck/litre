import type { StationRepository } from '../ports/station-repository';
import type { User } from '@/domain/account/user';
import { ok, type Result } from '@/domain/shared/result';
import { createStation, type Station } from '@/domain/station/station';
import { createStationPriceEntry } from '@/domain/station/station-price-entry';

export interface SaveStationInput {
  readonly name: string;
  readonly gasolinePrice: number | null;
  readonly ethanolPrice: number | null;
  readonly dieselPrice: number | null;
  readonly priceDate: string;
}

/**
 * Anota o preço de um posto na praça do motorista.
 *
 * Posto já conhecido na mesma cidade atualiza o registro existente: o id é
 * preservado para a identidade não mudar a cada anotação. O preço anotado passa
 * a valer para todo mundo que dirige nessa cidade — por isso guardamos quem
 * anotou por último.
 */
export async function saveStation(
  repository: StationRepository,
  user: User,
  input: SaveStationInput,
): Promise<Result<Station>> {
  const candidate = createStation({
    ...input,
    city: user.city,
    state: user.state,
    updatedBy: user.id,
    updatedByName: user.name,
  });
  if (!candidate.ok) return candidate;

  const existing = await repository.findByNameKey(user.regionKey, candidate.value.nameKey);
  const station: Station = existing
    ? { ...candidate.value, id: existing.id, createdBy: existing.createdBy, createdByName: existing.createdByName }
    : { ...candidate.value, createdBy: user.id, createdByName: user.name };

  await repository.save(station);
  await repository.appendPriceHistory(createStationPriceEntry(station));
  return ok(station);
}
