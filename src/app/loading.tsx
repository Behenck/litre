import styles from './loading.module.css';

/** Esqueleto exibido enquanto a página busca os dados no servidor. */
export default function Loading() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Carregando">
      <span className={styles.title} />
      <span className={styles.line} />
      <div className={styles.cards}>
        <span className={styles.card} />
        <span className={styles.card} />
        <span className={styles.card} />
      </div>
    </div>
  );
}
