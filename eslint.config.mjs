import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * As regras de fronteira abaixo são a forma executável dos Princípios I e IV da
 * constituição: o domínio não conhece framework, e o driver de banco não vaza
 * para fora da camada de infraestrutura.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'design-model/**', 'data/**', 'Litro.html'],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'next', 'next/*'],
              message: 'O domínio não pode depender de framework de UI (Princípio I).',
            },
            {
              group: ['better-sqlite3', '@supabase/*'],
              message: 'O domínio não pode depender de driver de banco (Princípio IV).',
            },
            {
              group: ['@/infrastructure/*', '@/app/*', '@/ui/*', '@/application/*'],
              message: 'O domínio não pode depender de camadas externas (Princípio I).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['better-sqlite3', '@supabase/*'],
              message: 'Casos de uso dependem de portas, não de drivers (Princípio IV).',
            },
            {
              group: ['@/infrastructure/*', '@/ui/*', '@/app/*'],
              message: 'A aplicação não pode depender de camadas externas (Princípio I).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['better-sqlite3', '@supabase/*'],
              message: 'A UI nunca fala com o banco diretamente (Princípio IV).',
            },
            {
              group: ['@/infrastructure/sqlite/*', '@/infrastructure/preferences/*'],
              message: 'Use o container ou os casos de uso, não o adaptador concreto (Princípio II - DIP).',
            },
          ],
        },
      ],
    },
  },
];

export default config;
