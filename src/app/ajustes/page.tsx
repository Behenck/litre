import { getContainer } from '@/infrastructure/container';
import { PageHeader } from '@/ui/components/PageHeader';
import { ResetDataButton } from '@/ui/features/settings/ResetDataButton';
import { SettingRow } from '@/ui/features/settings/SettingRow';
import { ThemeToggle } from '@/ui/features/settings/ThemeToggle';
import { UnitToggle } from '@/ui/features/settings/UnitToggle';
import styles from './ajustes.module.css';

export default async function SettingsPage() {
  const { theme, unit } = await getContainer().preferences.read();

  return (
    <div className={styles.narrow}>
      <PageHeader title="Configurações" description="Preferências do app." />

      <div className={styles.list}>
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
          description="Substitui tudo pelos veículos e abastecimentos de demonstração."
          control={<ResetDataButton />}
        />
      </div>
    </div>
  );
}
