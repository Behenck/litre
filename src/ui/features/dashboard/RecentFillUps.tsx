import Link from 'next/link';
import type { FillUp } from '@/domain/fill-up/fill-up';
import { pricePerLiter } from '@/domain/fill-up/fill-up';
import { formatMoney } from '@/ui/format/currency';
import { formatDate } from '@/ui/format/date';
import { formatInteger, formatLiters } from '@/ui/format/number';
import styles from './RecentFillUps.module.css';

interface RecentFillUpsProps {
  fillUps: readonly FillUp[];
  vehicleId: string;
}

export function RecentFillUps({ fillUps, vehicleId }: RecentFillUpsProps) {
  if (fillUps.length === 0) {
    return <p className={styles.empty}>Nenhum abastecimento registrado ainda.</p>;
  }

  return (
    <ul className={styles.list}>
      {fillUps.map((fillUp) => (
        <li key={fillUp.id} className={styles.item}>
          <span className={styles.icon} aria-hidden="true">
            ⛽
          </span>
          <span className={styles.info}>
            <span className={styles.station}>{fillUp.stationName || 'Posto não informado'}</span>
            <span className={styles.meta}>
              {formatDate(fillUp.date)} · {formatLiters(fillUp.liters)} L · {formatInteger(fillUp.odometer)} km
            </span>
          </span>
          <span className={styles.values}>
            <span className={styles.total}>{formatMoney(fillUp.total)}</span>
            <span className={styles.price}>{formatMoney(pricePerLiter(fillUp))}/L</span>
          </span>
        </li>
      ))}

      <li className={styles.more}>
        <Link href={`/historico?veiculo=${vehicleId}`}>Ver histórico completo</Link>
      </li>
    </ul>
  );
}
