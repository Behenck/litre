---

description: "Task list for Litro — Controle de Abastecimento e Média de Consumo"
---

# Tasks: Litro — Controle de Abastecimento e Média de Consumo

**Input**: Design documents from `/specs/001-controle-abastecimento/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Tarefas de teste estão incluídas porque a constituição do projeto (Princípio II e seção
"Fluxo de Desenvolvimento") exige teste para toda regra de cálculo do domínio. O escopo de teste é
limitado ao domínio puro — não há testes de UI nesta versão.

**Organization**: Tarefas agrupadas por user story, permitindo implementar e validar cada história
de forma independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: história a que a tarefa pertence (US1–US4)
- Todo caminho de arquivo é relativo à raiz do repositório

## Path Conventions

Single project Next.js com camadas em `src/` (`domain`, `application`, `infrastructure`, `ui`,
`app`) e testes em `tests/domain/`, conforme a Structure Decision do plano.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicialização do projeto e dos portões de qualidade

- [X] T001 Inicializar projeto Next.js 16 + TypeScript strict na raiz (`package.json`, `next.config.ts`, `tsconfig.json` com `strict: true` e alias `@/*` → `src/*`)
- [X] T002 Instalar dependências de runtime (`next`, `react`, `react-dom`, `better-sqlite3`, `zod`) e de desenvolvimento (`typescript`, `@types/node`, `@types/react`, `@types/better-sqlite3`, `eslint`, `eslint-config-next`)
- [X] T003 [P] Criar `.gitignore`, `.env.example` (`LITRO_DB_DRIVER`, `LITRO_DB_PATH`) e a pasta `data/` ignorada pelo versionamento
- [X] T004 [P] Configurar ESLint em `eslint.config.mjs` com `no-restricted-imports` proibindo React/Next em `src/domain/**` e `better-sqlite3` fora de `src/infrastructure/**`
- [X] T005 [P] Declarar scripts em `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `db:migrate`, `db:seed`
- [X] T006 [P] Configurar `serverExternalPackages: ['better-sqlite3']` em `next.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: núcleo compartilhado por todas as histórias — domínio base, persistência, tema e shell

**⚠️ CRITICAL**: nenhuma user story pode começar antes desta fase terminar

### Domínio compartilhado

- [X] T007 [P] Criar `src/domain/shared/result.ts` com `Result<T>`, `ok`, `fail` e o tipo `DomainError`
- [X] T008 [P] Criar `src/domain/shared/id.ts` com geração e validação de `Id` (UUID v4)
- [X] T009 [P] Criar `src/domain/shared/number-parser.ts` com `parseDecimalPtBr` e `parseMoneyPtBr` (aceita `"32,4"`, `"1.248,50"`, `"1248.50"`)
- [X] T010 [P] Criar `src/domain/shared/money.ts` com `Money` em centavos (`fromReais`, `toReais`, `sum`, `divide`)
- [X] T011 [P] Criar `src/domain/shared/iso-date.ts` com validação de `YYYY-MM-DD`, `today()` e `isFuture()`
- [X] T012 [P] Criar `src/domain/vehicle/fuel-type.ts` com o catálogo de combustíveis (valor, rótulo pt-BR, fator de rendimento) — aberto a extensão
- [X] T013 [P] Criar `src/domain/shared/consumption-unit.ts` com `ConsumptionUnit`, conversão `km/L ↔ L/100km` e rótulos

### Persistência e composição

- [X] T014 Criar `src/infrastructure/sqlite/connection.ts` abrindo o banco de `LITRO_DB_PATH` com `foreign_keys = ON` e conexão única por processo
- [X] T015 Criar `src/infrastructure/sqlite/migrations/001-initial.ts` com as tabelas `vehicles`, `fill_ups`, `stations` e índices do data-model — migração como módulo TS, e não `.sql` lido do disco, porque o bundler do Next não carrega arquivos de dados adjacentes em produção
- [X] T016 Criar `src/infrastructure/sqlite/migrate.ts` (runner idempotente com tabela de controle) e `scripts/db-migrate.ts`
- [X] T017 [P] Criar `src/application/ports/vehicle-repository.ts`, `fill-up-repository.ts`, `station-repository.ts` e `preferences-store.ts` conforme [contracts/repositories.md](./contracts/repositories.md)
- [X] T018 Criar `src/infrastructure/container.ts` resolvendo os repositórios por `LITRO_DB_DRIVER` (composition root)
- [X] T019 [P] Criar `src/infrastructure/preferences/cookie-preferences-store.ts` lendo e gravando `litro.tema` e `litro.unidade`

### Tema, formatação e shell

- [X] T020 [P] Criar `src/ui/styles/tokens.css` com as variáveis do `design-model` (cores, raios, espaçamentos, tipografia) e `src/ui/styles/themes.css` com `[data-theme="claro"|"escuro"]`
- [X] T021 [P] Criar `src/ui/styles/globals.css` (reset, fontes Space Grotesk/JetBrains Mono, `prefers-reduced-motion`, `::selection`)
- [X] T022 [P] Criar `src/ui/format/currency.ts`, `number.ts` e `date.ts` com formatadores `pt-BR` centralizados
- [X] T023 Criar `src/app/layout.tsx` aplicando tema e unidade lidos do cookie no `<html>` (sem flash) e montando o shell
- [X] T024 [P] Criar `src/ui/components/AppHeader.tsx` + `.module.css` com logo, alternador de tema e navegação das sete áreas
- [X] T025 [P] Criar `src/ui/components/NavTabs.tsx` + `.module.css` com estado ativo por rota (`usePathname`, client component mínimo)
- [X] T026 [P] Criar primitivos em `src/ui/components/`: `Card.tsx`, `PageHeader.tsx`, `Field.tsx`, `TextInput.tsx`, `OptionPill.tsx`, `PrimaryButton.tsx`, `EmptyState.tsx` (um arquivo + `.module.css` por componente)
- [X] T027 [P] Criar `src/ui/components/Toast.tsx` + `.module.css` e `src/ui/components/SubmitButton.tsx` (`useFormStatus`) para feedback de gravação (FR-035)
- [X] T028 [P] Criar `src/app/actions/preference-actions.ts` com `toggleThemeAction` e `setUnitAction`

**Checkpoint**: shell navegável com tema funcionando e banco migrado — as histórias podem começar

---

## Phase 3: User Story 1 — Registrar abastecimento e descobrir a média real (Priority: P1) 🎯 MVP

**Goal**: cadastrar veículo, registrar abastecimentos válidos e ver a média real de consumo

**Independent Test**: cadastrar um veículo, registrar dois abastecimentos de tanque cheio com
quilometragens crescentes e conferir que a média equivale a (km₂ − km₁) ÷ litros₂

### Tests for User Story 1

> Escrever antes da implementação e garantir que falham primeiro

- [X] T029 [P] [US1] Testes de `parseDecimalPtBr`/`parseMoneyPtBr` em `tests/domain/number-parser.test.ts` (vírgula, milhar, entrada inválida)
- [X] T030 [P] [US1] Testes de invariantes de `Vehicle` em `tests/domain/vehicle.test.ts` (modelo obrigatório, ano fora de faixa, placa inválida)
- [X] T031 [P] [US1] Testes de invariantes de `FillUp` em `tests/domain/fill-up.test.ts` (litros ≤ 0, total ≤ 0, data futura, preço por litro)
- [X] T032 [P] [US1] Testes de trechos e média ponderada em `tests/domain/consumption.test.ts` (dois abastecimentos, parcial ignorado, odômetro não crescente)

### Implementation for User Story 1

- [X] T033 [P] [US1] Criar `src/domain/vehicle/plate.ts` (normalização, validação e formatação `ABC-1D23`)
- [X] T034 [P] [US1] Criar `src/domain/vehicle/vehicle-color.ts` com o catálogo de cores do `design-model`
- [X] T035 [US1] Criar `src/domain/vehicle/vehicle.ts` com a entidade, `createVehicle` e `displayName` (depende de T033, T034)
- [X] T036 [P] [US1] Criar `src/domain/fill-up/fill-up.ts` com a entidade, `createFillUp` e `pricePerLiter`
- [X] T037 [US1] Criar `src/domain/analytics/consumption.ts` com `computeLegs` e `weightedAverageKmPerLiter` (FR-015, FR-016, FR-017)
- [X] T038 [P] [US1] Criar `src/infrastructure/sqlite/mappers/vehicle-mapper.ts` e `fill-up-mapper.ts` (row ↔ entidade)
- [X] T039 [US1] Criar `src/infrastructure/sqlite/sqlite-vehicle-repository.ts` implementando `VehicleRepository` (depende de T017, T038)
- [X] T040 [US1] Criar `src/infrastructure/sqlite/sqlite-fill-up-repository.ts` implementando `FillUpRepository` (depende de T017, T038)
- [X] T041 [P] [US1] Criar casos de uso `src/application/use-cases/create-vehicle.ts`, `list-vehicles.ts` e `delete-vehicle.ts` (um arquivo por caso)
- [X] T042 [US1] Criar `src/application/use-cases/register-fill-up.ts` validando odômetro crescente contra o último abastecimento (FR-009)
- [X] T043 [P] [US1] Criar `src/app/actions/vehicle-actions.ts` (`createVehicleAction`, `updateVehicleAction`, `deleteVehicleAction`) com validação `zod` e `revalidatePath`
- [X] T044 [P] [US1] Criar `src/app/actions/fill-up-actions.ts` (`createFillUpAction`) conforme [contracts/server-actions.md](./contracts/server-actions.md)
- [X] T045 [P] [US1] Criar `src/ui/features/vehicles/VehicleCard.tsx` + `.module.css` (cor, tipo, placa, média, odômetro)
- [X] T046 [P] [US1] Criar `src/ui/features/vehicles/VehicleGrid.tsx` e `AddVehicleCard.tsx`
- [X] T047 [US1] Criar `src/app/page.tsx` (lista de veículos, Server Component) usando `list-vehicles` e o estado vazio
- [X] T048 [P] [US1] Criar `src/ui/features/vehicles/VehicleTypePicker.tsx`, `ColorPicker.tsx` e `FuelPicker.tsx` (blocos do formulário)
- [X] T049 [US1] Criar `src/ui/features/vehicles/VehicleForm.tsx` (client component) compondo os blocos e exibindo `fieldErrors`
- [X] T050 [US1] Criar `src/app/veiculos/novo/page.tsx` e `src/app/veiculos/[id]/editar/page.tsx` montando o formulário
- [X] T051 [P] [US1] Criar `src/ui/features/fill-ups/FillUpCalcPanel.tsx` exibindo preço por litro calculado e distância desde o último abastecimento (FR-007, FR-008)
- [X] T052 [US1] Criar `src/ui/features/fill-ups/FillUpForm.tsx` (client component) com campos, seletor de veículo, combustível, posto e tanque cheio
- [X] T053 [US1] Criar `src/app/abastecer/page.tsx` lendo `?veiculo=` e montando o formulário
- [X] T054 [US1] Traduzir `DomainError` para mensagens pt-BR por campo em `src/app/actions/error-messages.ts` e ligar aos formulários (SC-007)

**Checkpoint**: MVP funcional — cadastro de veículo, registro de abastecimento e média correta

---

## Phase 4: User Story 2 — Acompanhar histórico e evolução do consumo (Priority: P2)

**Goal**: painel com indicadores e gráfico, histórico completo e exclusão com recálculo

**Independent Test**: com 3+ abastecimentos, conferir gráfico, histórico ordenado e recálculo após
excluir um lançamento

### Tests for User Story 2

- [X] T055 [P] [US2] Testes de `costPerKm`, totais e tendência em `tests/domain/vehicle-stats.test.ts` (FR-018, FR-019, FR-020)
- [X] T056 [P] [US2] Testes de conversão de unidade em `tests/domain/consumption-unit.test.ts` (FR-021)

### Implementation for User Story 2

- [X] T057 [US2] Criar `src/domain/analytics/vehicle-stats.ts` com custo por km, total gasto, total de litros, tendência e sinalização de trecho suspeito
- [X] T058 [P] [US2] Criar `src/application/use-cases/get-vehicle-dashboard.ts` agregando veículo, trechos e estatísticas
- [X] T059 [P] [US2] Criar `src/application/use-cases/list-fill-ups.ts` e `delete-fill-up.ts`
- [X] T060 [P] [US2] Adicionar `deleteFillUpAction` em `src/app/actions/fill-up-actions.ts` com revalidação de `/painel` e `/historico` (FR-013)
- [X] T061 [P] [US2] Criar `src/ui/features/dashboard/StatCard.tsx` e `HighlightStatCard.tsx` + `.module.css`
- [X] T062 [P] [US2] Criar `src/ui/features/dashboard/ConsumptionChart.tsx` + `.module.css` (barras CSS, últimos 6 trechos, alternativa acessível) e o estado vazio orientativo (FR-023, FR-024)
- [X] T063 [P] [US2] Criar `src/ui/features/dashboard/RecentFillUps.tsx` com os últimos lançamentos e atalho para o histórico
- [X] T064 [P] [US2] Criar `src/ui/features/shared/VehicleSwitcher.tsx` navegando por `?veiculo=` (FR-025)
- [X] T065 [US2] Criar `src/app/painel/page.tsx` compondo cabeçalho do veículo, cards, gráfico e recentes (depende de T058, T061–T064)
- [X] T066 [P] [US2] Criar `src/ui/features/history/HistoryRow.tsx` + `.module.css` com data, posto, litros, R$/L, consumo colorido e total
- [X] T067 [P] [US2] Criar `src/ui/features/history/DeleteFillUpButton.tsx` (client) com confirmação
- [X] T068 [US2] Criar `src/app/historico/page.tsx` com a lista ordenada, seletor de veículo e estado vazio (FR-012)

**Checkpoint**: US1 e US2 funcionam de forma independente

---

## Phase 5: User Story 3 — Decidir onde e com o que abastecer (Priority: P3)

**Goal**: cadastro de postos com destaque do mais barato e comparativo etanol × gasolina

**Independent Test**: cadastrar três postos e verificar o selo do mais barato; informar preços no
comparativo e conferir recomendação e custo por km

### Tests for User Story 3

- [X] T069 [P] [US3] Testes do comparativo em `tests/domain/fuel-comparison.test.ts` (etanol vence, gasolina vence, dados faltando, fator inválido → 0,70)
- [X] T070 [P] [US3] Testes de normalização de nome e destaque do mais barato em `tests/domain/station.test.ts` (FR-027, FR-028)

### Implementation for User Story 3

- [X] T071 [P] [US3] Criar `src/domain/station/station.ts` com a entidade, `nameKey` normalizado e validação de preços
- [X] T072 [P] [US3] Criar `src/domain/analytics/fuel-comparison.ts` com recomendação, proporção e custo por km por combustível (FR-029, FR-030, FR-031)
- [X] T073 [US3] Criar `src/infrastructure/sqlite/mappers/station-mapper.ts` e `src/infrastructure/sqlite/sqlite-station-repository.ts` com upsert por `nameKey`
- [X] T074 [P] [US3] Criar `src/application/use-cases/save-station.ts`, `list-stations.ts` e `delete-station.ts`
- [X] T075 [P] [US3] Criar `src/app/actions/station-actions.ts` (`saveStationAction`, `deleteStationAction`)
- [X] T076 [P] [US3] Criar `src/ui/features/stations/StationForm.tsx` e `StationCard.tsx` + `.module.css` com o selo "mais barato"
- [X] T077 [US3] Criar `src/app/postos/page.tsx` compondo formulário e grade de postos
- [X] T078 [P] [US3] Criar `src/ui/features/comparison/ComparisonResult.tsx` e `ComparisonInputs.tsx` (client) com cálculo ao digitar
- [X] T079 [US3] Criar `src/app/comparativo/page.tsx` usando a média real do veículo selecionado
- [X] T080 [P] [US3] Ligar sugestão de postos no formulário de abastecimento via `<datalist>` alimentado por `listStationNames` (FR-014)

**Checkpoint**: as três histórias principais funcionam de forma independente

---

## Phase 6: User Story 4 — Ajustar o app ao gosto e ao contexto (Priority: P4)

**Goal**: tema claro/escuro e unidade de consumo persistentes

**Independent Test**: alternar tema e unidade, recarregar e conferir persistência e conversão

### Implementation for User Story 4

- [X] T081 [P] [US4] Criar `src/ui/features/settings/SettingRow.tsx` + `.module.css`
- [X] T082 [P] [US4] Criar `src/ui/features/settings/ThemeToggle.tsx` e `UnitToggle.tsx` (client, com atualização otimista)
- [X] T083 [P] [US4] Criar `src/infrastructure/sqlite/seed.ts` e `scripts/db-seed.ts` com os dados de demonstração do `design-model` (FR-036)
- [X] T084 [US4] Adicionar `resetSeedDataAction` em `src/app/actions/preference-actions.ts`
- [X] T085 [US4] Criar `src/app/ajustes/page.tsx` com tema, unidade e restauração dos dados de exemplo
- [X] T086 [US4] Aplicar a unidade escolhida em todas as exibições de média (lista, painel, gráfico, histórico, comparativo) (FR-021, FR-033)

**Checkpoint**: todas as quatro histórias completas

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T087 [P] Revisar todos os arquivos contra o limite de 200 linhas do Princípio III e dividir os que excederem
- [X] T088 [P] Auditar acessibilidade: foco visível, `aria-label` nos ícones, `inputmode` nos campos numéricos, alvos ≥ 44 px (FR-038, FR-039, SC-009)
- [X] T089 [P] Verificar responsividade a 320 px em todas as sete telas, sem rolagem horizontal (SC-005)
- [X] T090 [P] Adicionar estados de carregamento (`loading.tsx`) e de erro (`error.tsx`) nas rotas de dados
- [X] T091 [P] Criar `README.md` com instalação, scripts, arquitetura em camadas e caminho de migração para Supabase
- [X] T092 [P] Criar `CLAUDE.md` com as convenções operacionais do repositório
- [X] T093 Medir o JS de primeira carga no build — ~152 KB gzip são o piso de React 19 + App Router; o código da aplicação soma ~8 KB gzip por rota. A meta de 120 KB do plano era inatingível com Next.js e foi corrigida em plan.md
- [X] T094 Executar `npm run typecheck && npm run lint && npm test && npm run build` — todos verdes (75 testes)
- [X] T095 Executar o roteiro de [quickstart.md](./quickstart.md) — V1–V4 e V6 verificados com o build de produção rodando; V5 (320 px e navegação por teclado) exige navegador e ficou como verificação manual

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende da Phase 1 — **bloqueia todas as histórias**
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)**: depende da Phase 2; consome dados produzidos por US1 para demonstração, mas é
  implementável e testável de forma independente com dados de seed
- **US3 (Phase 5)**: depende da Phase 2; usa a média de US1 quando existe, com fallback definido
- **US4 (Phase 6)**: depende da Phase 2
- **Polish (Phase 7)**: depende das histórias entregues

### Within Each User Story

Testes → value objects/entidades → cálculos de domínio → repositórios → casos de uso → actions →
componentes de UI → páginas.

### Parallel Opportunities

- T003–T006 (Setup) em paralelo
- T007–T013 (domínio compartilhado) totalmente em paralelo
- T020–T022 e T024–T028 (UI base) em paralelo após T014–T019
- Todos os testes de uma história em paralelo entre si
- Após a Phase 2, US1/US2/US3/US4 podem ser tocadas por pessoas diferentes

---

## Parallel Example: User Story 1

```bash
# Testes da US1 juntos:
Task: "Testes de parser pt-BR em tests/domain/number-parser.test.ts"
Task: "Testes de Vehicle em tests/domain/vehicle.test.ts"
Task: "Testes de FillUp em tests/domain/fill-up.test.ts"
Task: "Testes de consumo em tests/domain/consumption.test.ts"

# Blocos de domínio independentes juntos:
Task: "Criar src/domain/vehicle/plate.ts"
Task: "Criar src/domain/vehicle/vehicle-color.ts"
Task: "Criar src/domain/fill-up/fill-up.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) → 2. Phase 2 (Foundational) → 3. Phase 3 (US1)
4. **PARAR e VALIDAR**: rodar o roteiro V1 do quickstart
5. Já é um app útil: cadastra veículo, registra abastecimento e mostra a média real

### Incremental Delivery

MVP (US1) → US2 (painel e histórico) → US3 (postos e comparativo) → US4 (preferências) → Polish.
Cada incremento é validável isoladamente pelo roteiro correspondente do quickstart.

---

## Notes

- 95 tarefas: 6 setup, 22 foundational, 26 US1, 14 US2, 12 US3, 6 US4, 9 polish
- Todo componente de UI mora em seu próprio arquivo com `.module.css` ao lado (Princípio III)
- `"use client"` apenas onde há interação real; tudo mais é Server Component (Princípio V)
- Commit por tarefa ou grupo lógico; parar em qualquer checkpoint para validar
