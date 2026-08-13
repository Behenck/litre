import type { ReactNode } from 'react';
import styles from './SettingRow.module.css';

interface SettingRowProps {
  title: string;
  description: string;
  control: ReactNode;
}

export function SettingRow({ title, description, control }: SettingRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.control}>{control}</div>
    </div>
  );
}
