import { requireUser } from '@/app/auth/current-user';
import { PageHeader } from '@/ui/components/PageHeader';
import { VehicleForm } from '@/ui/features/vehicles/VehicleForm';
import styles from '../form-page.module.css';

export default async function NewVehiclePage() {
  await requireUser();

  return (
    <div className={styles.narrow}>
      <PageHeader title="Novo veículo" description="Só o essencial. Você pode completar depois." />
      <VehicleForm />
    </div>
  );
}
