import type { StationRepository } from '../ports/station-repository';
import { cheapestGasolineStationId, type Station } from '@/domain/station/station';

export interface StationList {
  readonly stations: Station[];
  /** Id do posto com a gasolina mais barata, para o selo de destaque. */
  readonly cheapestId: string | null;
}

/** Postos da praça do motorista — os dele e os anotados por outros da cidade. */
export async function listStations(repository: StationRepository, regionKey: string): Promise<StationList> {
  const stations = await repository.list(regionKey);
  return { stations, cheapestId: cheapestGasolineStationId(stations) };
}
