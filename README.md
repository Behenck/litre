# Litro

Controle de abastecimento, média de consumo e custo por quilômetro dos seus veículos.

Registre cada parada no posto anotando a quilometragem do painel, os litros e o valor pago — o app
calcula a média real do veículo, o custo por km, a evolução do consumo e ajuda a decidir entre
etanol e gasolina.

## Requisitos

- Node.js 22 LTS ou superior
- npm 10+

## Começando

```bash
npm install
cp .env.example .env.local
npm run db:migrate      # cria data/litro.db
npm run db:seed         # opcional: carrega dados de demonstração
npm run dev             # http://localhost:3000
```

## Scripts

| Script | O que faz |
|--------|-----------|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build de produção e execução |
| `npm run lint` | ESLint, incluindo as regras de fronteira entre camadas |
| `npm run typecheck` | `tsc --noEmit` em modo strict |
| `npm test` | testes das regras de domínio |
| `npm run db:migrate` | aplica migrações pendentes (idempotente) |
| `npm run db:seed` | **substitui** os dados atuais pelos de demonstração |

## Variáveis de ambiente

| Variável | Valores | Padrão |
|----------|---------|--------|
| `LITRO_DB_DRIVER` | `sqlite` \| `supabase` | `sqlite` |
| `LITRO_DB_PATH` | caminho do arquivo SQLite | `data/litro.db` |

## Funcionalidades

- **Veículos** — carros e motos, com marca, modelo, ano, placa, cor e combustível principal.
- **Abastecimentos** — quilometragem, litros, valor pago, posto e indicação de tanque cheio, com
  preço por litro e distância percorrida calculados enquanto você digita.
- **Painel** — média de consumo, custo por quilômetro, total gasto e gráfico dos últimos trechos.
- **Histórico** — todos os lançamentos, com consumo por trecho e exclusão que recalcula tudo.
- **Postos** — preços de gasolina, etanol e diesel, com destaque para o mais barato.
- **Etanol × gasolina** — comparativo pelo consumo real do veículo, não só pela regra dos 70%.
- **Ajustes** — tema claro/escuro e unidade km/L ou L/100km, persistidos por dispositivo.

## Arquitetura

Quatro camadas, com dependências apontando sempre para dentro:

```
src/
├── app/              # Rotas Next.js e Server Actions — só composição e fronteira HTTP
├── domain/           # Entidades e regras puras (sem React, sem I/O, sem SQL)
├── application/      # Casos de uso e portas (interfaces de repositório)
├── infrastructure/   # Adaptadores concretos: SQLite, cookies, container
└── ui/               # Componentes, estilos e formatadores pt-BR
```

Princípios que o código segue (detalhados em [`.specify/memory/constitution.md`](.specify/memory/constitution.md)):

- **Domínio isolado** — o cálculo de consumo não conhece React nem banco de dados, e por isso é
  testável em milissegundos.
- **Persistência plugável** — toda leitura e escrita passa por interfaces em
  `application/ports/`; o `container.ts` escolhe a implementação.
- **Arquivos pequenos** — um componente ou caso de uso por arquivo, nenhum acima de 200 linhas.
- **Leve por padrão** — Server Components em tudo que não precisa de interação, gráfico em CSS
  puro, zero biblioteca de UI ou de estado.

As fronteiras entre camadas são verificadas pelo ESLint (`no-restricted-imports`): importar
`better-sqlite3` fora de `infrastructure/`, ou React dentro de `domain/`, quebra o lint.

### Server Actions

Toda escrita acontece em Server Actions (`src/app/actions/`), que validam a entrada, chamam o caso
de uso e revalidam os caminhos afetados. O cliente nunca fala com o banco.

## Testes

```bash
npm test
```

Cobrem as regras que não podem errar: conversão de números em pt-BR, invariantes das entidades,
cálculo de trechos, média ponderada, custo por km, tendência, conversão de unidade e comparativo de
combustíveis.

## Migrando para o Supabase

O projeto já está preparado para a troca — ids gerados no domínio, portas assíncronas, valores
monetários em centavos inteiros e datas em `YYYY-MM-DD`:

1. Crie `src/infrastructure/supabase/` implementando as mesmas interfaces de
   `src/application/ports/`.
2. Traduza `src/infrastructure/sqlite/migrations/` para Postgres (os tipos usados têm equivalente
   direto; `full_tank` vira `boolean` no mapeador).
3. Registre o driver em `src/infrastructure/container.ts` e defina `LITRO_DB_DRIVER=supabase`.

Nenhum arquivo de `domain/`, `application/`, `ui/` ou `app/` precisa mudar.

## Documentação do projeto

Especificação, plano, modelo de dados e contratos estão em
[`specs/001-controle-abastecimento/`](specs/001-controle-abastecimento/).
