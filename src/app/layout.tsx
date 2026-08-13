import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import { currentUser } from '@/app/auth/current-user';
import { getContainer } from '@/infrastructure/container';
import { AppHeader } from '@/ui/components/AppHeader';
import '@/ui/styles/globals.css';
import styles from './layout.module.css';

/**
 * Fontes autohospedadas pelo Next: sem requisição a domínio externo, sem
 * bloqueio de renderização e sem troca visível de fonte no carregamento.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Litro — média de consumo',
  description: 'Controle de abastecimento, média de consumo e custo por quilômetro dos seus veículos.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f3f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0e10' },
  ],
};

/**
 * O tema e a unidade são lidos do cookie no servidor e escritos no <html>.
 * Por isso a primeira pintura já sai correta — sem script bloqueante e sem flash.
 *
 * O cabeçalho com as abas só existe para quem entrou: nas telas de conta não há
 * para onde navegar, e mostrar a navegação ali só confundiria.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const [{ theme, unit }, user] = await Promise.all([getContainer().preferences.read(), currentUser()]);

  return (
    <html
      lang="pt-BR"
      data-theme={theme}
      data-unit={unit}
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <a href="#conteudo" className={styles.skipLink}>
          Ir para o conteúdo
        </a>
        {user ? <AppHeader theme={theme} user={user} /> : null}
        <main id="conteudo" className={user ? styles.main : undefined}>
          {children}
        </main>
      </body>
    </html>
  );
}
