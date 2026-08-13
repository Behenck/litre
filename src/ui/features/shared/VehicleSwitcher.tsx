import Link from 'next/link';
import type { Vehicle } from '@/domain/vehicle/vehicle';
import { vehicleDisplayName } from '@/domain/vehicle/vehicle';
import styles from './VehicleSwitcher.module.css';

interface VehicleSwitcherProps {
  vehicles: readonly Vehicle[];
  selectedId: string;
  /** Rota em que o troca-veículo permanece (`/painel`, `/historico`…). */
  basePath: string;
}

/**
 * Troca do veículo em foco.
 *
 * São links de verdade, não estado de cliente: o botão voltar funciona e a URL
 * pode ser compartilhada.
 */
export function VehicleSwitcher({ vehicles, selectedId, basePath }: VehicleSwitcherProps) {
  if (vehicles.length < 2) return null;

  return (
    <nav className={styles.switcher} aria-label="Trocar veículo">
      {vehicles.map((vehicle) => {
        const active = vehicle.id === selectedId;
        return (
          <Link
            key={vehicle.id}
            href={`${basePath}?veiculo=${vehicle.id}`}
            className={active ? `${styles.pill} ${styles.active}` : styles.pill}
            aria-current={active ? 'true' : undefined}
          >
            {vehicleDisplayName(vehicle)}
          </Link>
        );
      })}
    </nav>
  );
}
