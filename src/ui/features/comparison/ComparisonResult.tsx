import type { FuelComparison } from '@/domain/analytics/fuel-comparison';
import { formatMoney } from '@/ui/format/currency';
import { formatPercent } from '@/ui/format/number';
import styles from './ComparisonResult.module.css';

interface ComparisonResultProps {
  comparison: FuelComparison;
}

const WINNER_LABEL = {
  etanol: 'Etanol',
  gasolina: 'Gasolina',
  indefinido: '—',
} as const;

export function ComparisonResult({ comparison }: ComparisonResultProps) {
  const { winner } = comparison;

  return (
    <>
      <div className={`${styles.verdict} ${styles[winner]}`} aria-live="polite">
        <span className={styles.verdictLabel}>Vale mais a pena</span>
        <strong className={styles.winner}>{WINNER_LABEL[winner]}</strong>
        <span className={styles.explanation}>{comparison.explanation}</span>
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Proporção etanol/gasolina</span>
          <span className={styles.detailValue}>
            {comparison.priceRatio === null ? '—' : formatPercent(comparison.priceRatio)}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Custo por km com gasolina</span>
          <span className={styles.detailValue}>
            {comparison.costPerKmGasoline === null ? '—' : formatMoney(comparison.costPerKmGasoline)}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Custo por km com etanol</span>
          <span className={styles.detailValue}>
            {comparison.costPerKmEthanol === null ? '—' : formatMoney(comparison.costPerKmEthanol)}
          </span>
        </div>
      </div>
    </>
  );
}
