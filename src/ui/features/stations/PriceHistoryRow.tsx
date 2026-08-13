import type { StationPriceEntry } from '@/domain/station/station-price-entry';
import { formatMoney } from '@/ui/format/currency';
import { formatDayNumber, formatMonthShort } from '@/ui/format/date';
import styles from './PriceHistoryRow.module.css';

interface PriceHistoryRowProps {
  entry: StationPriceEntry;
  /** Quem anotou é o usuário atual — vira "você" no crédito. */
  mine: boolean;
}

export function PriceHistoryRow({ entry, mine }: PriceHistoryRowProps) {
  const prices = [
    { label: 'Gasolina', value: entry.gasolinePrice },
    { label: 'Etanol', value: entry.ethanolPrice },
    { label: 'Diesel', value: entry.dieselPrice },
  ];
  const credit = mine ? 'você' : entry.recordedByName || 'outro motorista';

  return (
    <li className={styles.row}>
      <span className={styles.date}>
        <span className={styles.day}>{formatDayNumber(entry.priceDate)}</span>
        <span className={styles.month}>{formatMonthShort(entry.priceDate)}</span>
      </span>

      {prices.map((price) => (
        <span key={price.label} className={styles.cell}>
          <span className={styles.cellLabel}>{price.label}</span>
          <span className={styles.cellValue}>{price.value === null ? '—' : formatMoney(price.value)}</span>
        </span>
      ))}

      <span className={styles.author}>anotado por {credit}</span>
    </li>
  );
}
