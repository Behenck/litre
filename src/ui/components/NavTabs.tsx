'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { hrefWithVehicle, NAV_ITEMS } from '@/ui/navigation/routes';
import styles from './NavTabs.module.css';

/**
 * Abas de navegação.
 *
 * Cliente apenas para saber qual rota está ativa; os itens continuam sendo
 * links reais, então funcionam com teclado, meio do botão e antes da hidratação.
 */
export function NavTabs() {
  const pathname = usePathname();
  const vehicleId = useSearchParams().get('veiculo');

  return (
    <nav className={styles.tabs} aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={hrefWithVehicle(item.href, vehicleId)}
            className={active ? `${styles.tab} ${styles.active}` : styles.tab}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
