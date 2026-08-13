import { requireUser } from '@/app/auth/current-user';
import { getContainer } from '@/infrastructure/container';
import { PageHeader } from '@/ui/components/PageHeader';
import { RegionForm } from '@/ui/features/account/RegionForm';
import { ResetDataButton } from '@/ui/features/settings/ResetDataButton';
import { SettingRow } from '@/ui/features/settings/SettingRow';
import { ThemeToggle } from '@/ui/features/settings/ThemeToggle';
import { UnitToggle } from '@/ui/features/settings/UnitToggle';
import styles from './ajustes.module.css';

export default async function SettingsPage() {
  const [{ theme, unit }, user] = await Promise.all([getContainer().preferences.read(), requireUser()]);

  return (
    <div className={styles.narrow}>
      <PageHeader title="Configurações" description={`Conta ${user.email}.`} />

      <div className={styles.list}>
        <SettingRow
          title="Sua cidade"
          description="Define quais postos você vê e com quem seus preços são compartilhados."
          control={<RegionForm city={user.city} state={user.state} />}
        />
        <SettingRow
          title="Tema"
          description="Claro ou escuro. A escolha vale para este dispositivo."
          control={<ThemeToggle theme={theme} variant="full" />}
        />
        <SettingRow
          title="Unidade de consumo"
          description="Como a média é exibida em todas as telas."
          control={<UnitToggle unit={unit} />}
        />
        <SettingRow
          title="Dados de exemplo"
          description="Substitui seus veículos e abastecimentos pelos de demonstração."
          control={<ResetDataButton />}
        />
      </div>
    </div>
  );
}
