import { formatMoney } from '@/ui/format/currency';
import { formatKm } from '@/ui/format/number';
import styles from './FillUpCalcPanel.module.css';

interface FillUpCalcPanelProps {
  /** Centavos por litro, ou `null` quando ainda não dá para calcular. */
  pricePerLiterCents: number | null;
  /** Distância desde o último abastecimento, ou `null`. */
  distance: number | null;
}

/** Devolutiva imediata do formulário: preço por litro e distância percorrida. */
export function FillUpCalcPanel({ pricePerLiterCents, distance }: FillUpCalcPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.block}>
        <span className={styles.label}>Preço por litro (calculado)</span>
        <span className={styles.price}>{pricePerLiterCents === null ? '—' : `${formatMoney(pricePerLiterCents)}/L`}</span>
      </div>
      <div className={`${styles.block} ${styles.right}`}>
        <span className={styles.label}>Rodou desde o último</span>
        <span className={styles.distance}>{distance === null ? '—' : formatKm(distance)}</span>
      </div>
    </div>
  );
}
