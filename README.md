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
| `npm run db:migrate` | aplica as migrações do SQLite (idempotente) |
| `npm run db:seed` | **substitui** os dados do driver ativo pelos de demonstração |
| `npm run supabase:start` / `supabase:stop` | inicia ou encerra o Supabase local |
| `npm run supabase:push` | aplica as migrações ao projeto Supabase vinculado |

## Variáveis de ambiente

| Variável | Valores | Padrão |
|----------|---------|--------|
| `LITRO_DB_DRIVER` | `sqlite` \| `supabase` | `sqlite` |
| `LITRO_DB_PATH` | caminho do arquivo SQLite | `data/litro.db` |
| `SUPABASE_URL` | URL da API do projeto | — |
| `SUPABASE_SECRET_KEY` | secret key exclusiva do servidor | — |
| `LITRO_JWT_SECRET` | segredo que assina os tokens de sessão (mín. 32 caracteres) | — |
| `LITRO_APP_URL` | base do link enviado no e-mail de confirmação | `http://localhost:3000` |
| `RESEND_API_KEY` | chave da API do Resend | — |
| `LITRO_MAIL_FROM` | remetente do e-mail de confirmação | `Litro <onboarding@resend.dev>` |

## Funcionalidades

- **Conta** — cadastro com confirmação por e-mail, login com sessão em JWT e cidade/estado do
  motorista. Veículos e abastecimentos são privados de cada conta.
- **Veículos** — carros e motos, com marca, modelo, ano, placa, cor e combustível principal.
- **Abastecimentos** — quilometragem, litros, valor pago, posto e indicação de tanque cheio, com
  preço por litro e distância percorrida calculados enquanto você digita.
- **Painel** — média de consumo, custo por quilômetro, total gasto e gráfico dos últimos trechos.
- **Histórico** — todos os lançamentos, com consumo por trecho e exclusão que recalcula tudo.
- **Postos** — preços de gasolina, etanol e diesel **compartilhados entre os motoristas da mesma
  cidade**: o que você anota aparece para eles, e o que eles anotam aparece para você. O mais
  barato ganha destaque.
- **Etanol × gasolina** — comparativo pelo consumo real do veículo, não só pela regra dos 70%.
- **Ajustes** — cidade da conta, tema claro/escuro e unidade km/L ou L/100km.

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

### Autenticação

- **Senha** — hash scrypt com sal por senha (`node:crypto`), comparação em tempo constante.
- **Sessão** — JWT HS256 assinado com `LITRO_JWT_SECRET`, guardado em cookie `httpOnly` e
  registrado na tabela `sessions`. O token só vale enquanto a linha existir: sair da conta apaga a
  linha e o JWT morre na hora, mesmo dentro da validade. O banco guarda o SHA-256 do token, não o
  token.
- **Confirmação de e-mail** — token aleatório de 32 bytes enviado pelo Resend; o banco guarda só o
  hash. Vale 24 horas e só uma vez. Sem confirmar, não há login.
- **Escopo dos dados** — `user_id` entra em toda consulta de veículo e abastecimento, dentro do
  repositório. Postos são o único dado coletivo, escopado por `region_key` (`UF:cidade`).

Contas, sessões e confirmação de e-mail existem **apenas no driver `supabase`**; no driver
`sqlite` os adaptadores de conta falham com uma mensagem explícita.

## Testes

```bash
npm test
```

Cobrem as regras que não podem errar: conversão de números em pt-BR, invariantes das entidades,
cálculo de trechos, média ponderada, custo por km, tendência, conversão de unidade e comparativo de
combustíveis.

## Usando Supabase

O adaptador Supabase implementa as mesmas portas do SQLite. O acesso acontece somente nos Server
Components e Server Actions, com uma secret key que nunca deve receber o prefixo `NEXT_PUBLIC_`.
As tabelas têm RLS habilitado e não concedem acesso aos papéis `anon` ou `authenticated`.

Para conectar um projeto remoto:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npm run supabase:push
```

Depois, copie `.env.example` para `.env.local`, use `LITRO_DB_DRIVER=supabase` e preencha
`SUPABASE_URL` e `SUPABASE_SECRET_KEY` com os valores exibidos em **Connect** no Dashboard. Para
carregar o conjunto de demonstração no projeto conectado:

```bash
npm run db:seed
```

O login é próprio (tabelas `users`, `sessions` e `email_verifications`), não o Supabase Auth: o
app fala com o banco só pelo servidor, com a secret key, e o navegador nunca alcança o Postgres.
Por isso as tabelas de conta também têm RLS habilitado e negam `anon` e `authenticated`.

## Documentação do projeto

Especificação, plano, modelo de dados e contratos estão em
[`specs/001-controle-abastecimento/`](specs/001-controle-abastecimento/).
