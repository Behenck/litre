import Link from 'next/link';
import type { Theme } from '@/application/ports/preferences-store';
import type { User } from '@/domain/account/user';
import { AccountChip } from '@/ui/features/account/AccountChip';
import { ThemeToggle } from '@/ui/features/settings/ThemeToggle';
import { NavTabs } from './NavTabs';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  theme: Theme;
  user: User;
}

export function AppHeader({ theme, user }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            L
          </span>
          <span className={styles.names}>
            <span className={styles.name}>Litro</span>
            <span className={styles.tagline}>média de consumo</span>
          </span>
        </Link>
        <ThemeToggle theme={theme} />
        <AccountChip user={user} />
      </div>
      <NavTabs />
    </header>
  );
}
