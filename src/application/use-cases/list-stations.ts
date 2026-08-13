import type { StationRepository } from '../ports/station-repository';
import { cheapestGasolineStationId, type Station } from '@/domain/station/station';

export interface StationList {
  readonly stations: Station[];
  /** Id do posto com a gasolina mais barata, para o selo de destaque. */
  readonly cheapestId: string | null;
}

export async function listStations(repository: StationRepository): Promise<StationList> {
  const stations = await repository.list();
  return { stations, cheapestId: cheapestGasolineStationId(stations) };
}
