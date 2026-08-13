import { requireUser } from '@/app/auth/current-user';
import { listStations } from '@/application/use-cases/list-stations';
import { formatRegion } from '@/domain/shared/region';
import { getContainer } from '@/infrastructure/container';
import { EmptyState } from '@/ui/components/EmptyState';
import { PageHeader } from '@/ui/components/PageHeader';
import { Toast } from '@/ui/components/Toast';
import { StationCard } from '@/ui/features/stations/StationCard';
import { StationForm } from '@/ui/features/stations/StationForm';
import styles from './postos.module.css';

interface PageProps {
  searchParams: Promise<{ ok?: string }>;
}

/**
 * A única tela coletiva do app.
 *
 * O que aparece aqui é o que os motoristas de {cidade} anotaram — inclusive
 * gente que você não conhece. Anotar um preço novo atualiza a lista de todos
 * eles na próxima vez que abrirem a tela.
 */
export default async function StationsPage({ searchParams }: PageProps) {
  const { ok } = await searchParams;
  const { stations: repository, fillUps } = getContainer();
  const user = await requireUser();

  const [{ stations, cheapestId }, usedNames] = await Promise.all([
    listStations(repository, user.regionKey),
    fillUps.listStationNames(user.id),
  ]);

  // Sugere tanto os postos já anotados na cidade quanto os usados nos seus abastecimentos.
  const knownNames = [...new Set([...stations.map((station) => station.name), ...usedNames])];

  return (
    <>
      <PageHeader
        title={`Postos em ${formatRegion(user)}`}
        description="Preços anotados pelos motoristas da sua cidade. O que você anotar aparece para eles também."
      />

      <StationForm knownNames={knownNames} />

      {stations.length === 0 ? (
        <EmptyState
          title="Nenhum posto anotado por aqui"
          description="Seja o primeiro: anote o preço de um posto da sua cidade e ele passa a valer para todo mundo que dirige por perto."
        />
      ) : (
        <div className={styles.grid}>
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              cheapest={station.id === cheapestId}
              mine={station.updatedBy === null || station.updatedBy === user.id}
            />
          ))}
        </div>
      )}

      {ok ? <Toast message={ok} /> : null}
    </>
  );
}
