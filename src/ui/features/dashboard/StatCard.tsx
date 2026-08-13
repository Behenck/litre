import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

/** Indicador secundário do painel (custo por km, total gasto). */
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
