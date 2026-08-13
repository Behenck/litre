import { UFS } from '@/domain/shared/region';
import styles from './AccountForm.module.css';

interface StateSelectProps {
  id: string;
  name: string;
  defaultValue?: string;
  invalid?: boolean;
}

/** Lista fechada de UFs: escolher da lista evita "PR", "Pr" e "Paraná" na mesma praça. */
export function StateSelect({ id, name, defaultValue = '', invalid }: StateSelectProps) {
  return (
    <select
      id={id}
      name={name}
      className={styles.select}
      defaultValue={defaultValue}
      required
      aria-invalid={invalid || undefined}
    >
      <option value="" disabled>
        UF
      </option>
      {UFS.map((uf) => (
        <option key={uf.code} value={uf.code} title={uf.name}>
          {uf.code}
        </option>
      ))}
    </select>
  );
}
