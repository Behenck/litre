import type { ConsumptionLeg } from '@/domain/analytics/consumption';
import { type ConsumptionUnit, unitLabel } from '@/domain/shared/consumption-unit';
import { formatConsumption } from '@/ui/format/number';
import { formatDayNumber, formatMonthShort } from '@/ui/format/date';
import styles from './ConsumptionChart.module.css';

interface ConsumptionChartProps {
  legs: readonly ConsumptionLeg[];
  unit: ConsumptionUnit;
  /** Quantos trechos mostrar, do mais recente para trás. */
  limit?: number;
}

/**
 * Gráfico de barras em CSS puro.
 *
 * São no máximo seis valores: uma biblioteca de gráficos custaria dezenas de KB
 * para desenhar seis retângulos. Renderiza no servidor e não depende de hidratação.
 * A tabela oculta ao lado é a versão lida por leitores de tela.
 */
export function ConsumptionChart({ legs, unit, limit = 6 }: ConsumptionChartProps) {
  const data = legs.slice(-limit);

  if (data.length === 0) {
    return (
      <p className={styles.empty}>Registre pelo menos 2 abastecimentos de tanque cheio para ver a evolução.</p>
    );
  }

  const max = Math.max(...data.map((leg) => leg.kmPerLiter));

  return (
    <>
      <div className={styles.chart} aria-hidden="true">
        {data.map((leg) => (
          <div key={leg.fillUpId} className={styles.column}>
            <span className={styles.value}>{formatConsumption(leg.kmPerLiter, unit)}</span>
            <span
              className={leg.suspicious ? `${styles.bar} ${styles.suspicious}` : styles.bar}
              style={{ height: `${Math.max((leg.kmPerLiter / max) * 100, 4)}%` }}
              title={leg.suspicious ? 'Consumo fora do esperado — confira os números' : undefined}
            />
            <span className={styles.label}>
              {formatDayNumber(leg.date)}/{formatMonthShort(leg.date)}
            </span>
          </div>
        ))}
      </div>

      <table className="srOnly">
        <caption>Consumo por abastecimento em {unitLabel(unit)}</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Consumo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((leg) => (
            <tr key={leg.fillUpId}>
              <td>
                {formatDayNumber(leg.date)}/{formatMonthShort(leg.date)}
              </td>
              <td>
                {formatConsumption(leg.kmPerLiter, unit)} {unitLabel(unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
