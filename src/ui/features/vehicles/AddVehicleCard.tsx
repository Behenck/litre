import Link from 'next/link';
import styles from './AddVehicleCard.module.css';

/** Cartão tracejado que fecha a grade e convida ao cadastro. */
export function AddVehicleCard() {
  return (
    <Link href="/veiculos/novo" className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        +
      </span>
      <span className={styles.label}>Cadastrar veículo</span>
    </Link>
  );
}
