import Link from 'next/link';
import type { Station } from '@/domain/station/station';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { formatMoney } from '@/ui/format/currency';
import { formatDate, formatRelative } from '@/ui/format/date';
import { DeleteStationButton } from './DeleteStationButton';
import styles from './StationCard.module.css';

interface StationCardProps {
  station: Station;
  /** Recebe o selo de destaque (FR-027). */
  cheapest: boolean;
  /** Quem anotou o preço por último pode remover o posto; os demais só corrigem. */
  mine: boolean;
}

export function StationCard({ station, cheapest, mine }: StationCardProps) {
  const prices = [
    { label: 'Gasolina', value: station.gasolinePrice },
    { label: 'Etanol', value: station.ethanolPrice },
    { label: 'Diesel', value: station.dieselPrice },
  ];

  const credit = mine ? 'você' : station.updatedByName || 'outro motorista';

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <h3 className={styles.name}>{station.name}</h3>
          <p className={styles.updated}>
            Preço de {formatDate(station.priceDate)} · atualizado {formatRelative(station.updatedAt)} por {credit}
          </p>
          <Link href={`/postos/${station.id}/historico`} className={styles.historyLink}>
            Ver histórico
          </Link>
        </div>
        {cheapest ? <span className={styles.badge}>mais barato</span> : null}
      </header>

      <dl className={styles.prices}>
        {prices.map((price) => (
          <div key={price.label} className={styles.price}>
            <dt className={styles.priceLabel}>{price.label}</dt>
            <dd className={styles.priceValue}>{price.value === null ? '—' : formatMoney(price.value)}</dd>
          </div>
        ))}
      </dl>

      <ButtonLink href={`/postos?posto=${station.id}#anotar-preco`} variant="ghost" full className={styles.newPrice}>
        Novo preço
      </ButtonLink>

      {mine ? <DeleteStationButton stationId={station.id} stationName={station.name} /> : null}
    </article>
  );
}
