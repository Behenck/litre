import type { ConsumptionLeg } from '@/domain/analytics/consumption';
import type { FillUp } from '@/domain/fill-up/fill-up';
import { pricePerLiter } from '@/domain/fill-up/fill-up';
import type { ConsumptionUnit } from '@/domain/shared/consumption-unit';
import { fuelShortLabel } from '@/domain/vehicle/fuel-type';
import { formatMoney } from '@/ui/format/currency';
import { formatDayNumber, formatMonthShort } from '@/ui/format/date';
import { formatConsumption, formatInteger, formatLiters } from '@/ui/format/number';
import { DeleteFillUpButton } from './DeleteFillUpButton';
import styles from './HistoryRow.module.css';

interface HistoryRowProps {
  fillUp: FillUp;
  /** Trecho fechado por este abastecimento, quando existe. */
  leg: ConsumptionLeg | null;
  unit: ConsumptionUnit;
  vehicleId: string;
}

export function HistoryRow({ fillUp, leg, unit, vehicleId }: HistoryRowProps) {
  return (
    <li className={styles.row}>
      <span className={styles.date}>
        <span className={styles.day}>{formatDayNumber(fillUp.date)}</span>
        <span className={styles.month}>{formatMonthShort(fillUp.date)}</span>
      </span>

      <span className={styles.station}>
        <span className={styles.stationName}>{fillUp.stationName || 'Posto não informado'}</span>
        <span className={styles.stationMeta}>
          {fuelShortLabel(fillUp.fuel)} · {formatInteger(fillUp.odometer)} km
          {fillUp.fullTank ? '' : ' · parcial'}
        </span>
      </span>

      <span className={styles.cell}>
        <span className={styles.cellLabel}>Litros</span>
        <span className={styles.cellValue}>{formatLiters(fillUp.liters)}</span>
      </span>

      <span className={styles.cell}>
        <span className={styles.cellLabel}>R$/L</span>
        <span className={styles.cellValue}>{formatMoney(pricePerLiter(fillUp))}</span>
      </span>

      <span className={styles.cell}>
        <span className={styles.cellLabel}>Consumo</span>
        <span className={leg?.suspicious ? `${styles.cellValue} ${styles.suspicious}` : styles.cellValue}>
          {leg ? formatConsumption(leg.kmPerLiter, unit) : '—'}
        </span>
      </span>

      <span className={`${styles.cell} ${styles.right}`}>
        <span className={styles.cellLabel}>Total</span>
        <span className={styles.total}>{formatMoney(fillUp.total)}</span>
      </span>

      <DeleteFillUpButton fillUpId={fillUp.id} vehicleId={vehicleId} />
    </li>
  );
}
