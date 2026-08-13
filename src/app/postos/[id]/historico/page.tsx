import { notFound } from 'next/navigation';
import { requireUser } from '@/app/auth/current-user';
import { getContainer } from '@/infrastructure/container';
import { EmptyState } from '@/ui/components/EmptyState';
import { PageHeader } from '@/ui/components/PageHeader';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { PriceHistoryRow } from '@/ui/features/stations/PriceHistoryRow';
import styles from './historico.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Posto é coletivo (praça, não dono) — o acesso é liberado a quem dirige na mesma cidade. */
export default async function StationPriceHistoryPage({ params }: PageProps) {
  const { id } = await params;
  const { stations } = getContainer();
  const user = await requireUser();

  const station = await stations.findById(id);
  if (!station || station.regionKey !== user.regionKey) notFound();

  const history = await stations.listPriceHistory(id);

  return (
    <>
      <PageHeader
        title={station.name}
        description="Histórico de preços anotados por quem dirige nessa cidade."
        action={
          <ButtonLink href="/postos" variant="ghost">
            Voltar aos postos
          </ButtonLink>
        }
      />

      {history.length === 0 ? (
        <EmptyState
          title="Nenhum preço anotado ainda"
          description="Assim que alguém anotar um preço deste posto, ele aparece aqui."
        />
      ) : (
        <ul className={styles.list}>
          {history.map((entry) => (
            <PriceHistoryRow key={entry.id} entry={entry} mine={entry.recordedBy === user.id} />
          ))}
        </ul>
      )}
    </>
  );
}
