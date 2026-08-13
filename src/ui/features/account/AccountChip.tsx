import { signOutAction } from '@/app/actions/auth-actions';
import type { User } from '@/domain/account/user';
import { formatRegion } from '@/domain/shared/region';
import styles from './AccountChip.module.css';

interface AccountChipProps {
  user: User;
}

/**
 * Quem está logado e a saída.
 *
 * É um `<form>` de verdade, não um botão com `onClick`: sair funciona sem
 * JavaScript e não precisa de componente cliente.
 */
export function AccountChip({ user }: AccountChipProps) {
  return (
    <div className={styles.chip}>
      <span className={styles.identity}>
        <span className={styles.name}>{user.name.split(' ')[0]}</span>
        <span className={styles.region}>{formatRegion(user)}</span>
      </span>

      <form action={signOutAction}>
        <button type="submit" className={styles.signOut}>
          Sair
        </button>
      </form>
    </div>
  );
}
