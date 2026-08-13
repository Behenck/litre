import { listStations } from '@/application/use-cases/list-stations';
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

export default async function StationsPage({ searchParams }: PageProps) {
  const { ok } = await searchParams;
  const { stations: repository, fillUps } = getContainer();

  const [{ stations, cheapestId }, usedNames] = await Promise.all([
    listStations(repository),
    fillUps.listStationNames(),
  ]);

  // Sugere tanto os postos já cadastrados quanto os usados em abastecimentos.
  const knownNames = [...new Set([...stations.map((station) => station.name), ...usedNames])];

  return (
    <>
      <PageHeader
        title="Postos e preços"
        description="Passou por um posto e viu o preço? Anote aqui pra não esquecer."
      />

      <StationForm knownNames={knownNames} />

      {stations.length === 0 ? (
        <EmptyState
          title="Nenhum posto anotado"
          description="Anote os preços dos postos que você frequenta para saber rapidamente onde abastecer mais barato."
        />
      ) : (
        <div className={styles.grid}>
          {stations.map((station) => (
            <StationCard key={station.id} station={station} cheapest={station.id === cheapestId} />
          ))}
        </div>
      )}

      {ok ? <Toast message={ok} /> : null}
    </>
  );
}
