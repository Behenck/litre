import { type ConsumptionUnit, unitLabel } from '@/domain/shared/consumption-unit';
import { formatConsumption, formatPercent } from '@/ui/format/number';
import styles from './AverageCard.module.css';

interface AverageCardProps {
  averageKmPerLiter: number;
  unit: ConsumptionUnit;
  /** Variação do último trecho contra o anterior, em fração (0,1 = +10%). */
  trend: number | null;
}

/**
 * A tendência é medida em km/L, então subir é sempre melhorar — independente da
 * unidade escolhida para exibição.
 */
function trendText(trend: number | null): string {
  if (trend === null || trend === 0) return 'Registre mais abastecimentos para ver a tendência.';

  const magnitude = formatPercent(Math.abs(trend));
  return trend > 0
    ? `Melhorou ${magnitude} em relação ao trecho anterior.`
    : `Piorou ${magnitude} em relação ao trecho anterior.`;
}

export function AverageCard({ averageKmPerLiter, unit, trend }: AverageCardProps) {
  const hasAverage = averageKmPerLiter > 0;

  return (
    <div className={styles.card}>
      <span className={styles.label}>Média de consumo</span>
      <span className={styles.valueRow}>
        <span className={styles.value}>{hasAverage ? formatConsumption(averageKmPerLiter, unit) : '—'}</span>
        <span className={styles.unit}>{unitLabel(unit)}</span>
      </span>
      <span className={styles.trend}>
        {hasAverage ? trendText(trend) : 'Registre dois abastecimentos de tanque cheio para ver a média.'}
      </span>
    </div>
  );
}
