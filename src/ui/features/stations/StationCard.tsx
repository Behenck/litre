import type { Station } from '@/domain/station/station';
import { formatMoney } from '@/ui/format/currency';
import { formatRelative } from '@/ui/format/date';
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
            Atualizado {formatRelative(station.updatedAt)} por {credit}
          </p>
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

      {mine ? <DeleteStationButton stationId={station.id} stationName={station.name} /> : null}
    </article>
  );
}
