import { notFound } from 'next/navigation';
import { getContainer } from '@/infrastructure/container';
import { PageHeader } from '@/ui/components/PageHeader';
import { DeleteVehicleButton } from '@/ui/features/vehicles/DeleteVehicleButton';
import { VehicleForm } from '@/ui/features/vehicles/VehicleForm';
import { vehicleDisplayName } from '@/domain/vehicle/vehicle';
import styles from '../../form-page.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params;
  const { vehicles } = getContainer();

  const vehicle = await vehicles.findById(id);
  if (!vehicle) notFound();

  const fillUpCount = await vehicles.countFillUps(id);

  return (
    <div className={styles.narrow}>
      <PageHeader
        title={vehicleDisplayName(vehicle)}
        description="Altere os dados do veículo ou remova-o do app."
        action={
          <DeleteVehicleButton
            vehicleId={vehicle.id}
            vehicleName={vehicleDisplayName(vehicle)}
            fillUpCount={fillUpCount}
          />
        }
      />
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
