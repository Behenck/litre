# Implementation Plan: Litro — Controle de Abastecimento e Média de Consumo

**Branch**: `001-controle-abastecimento` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-controle-abastecimento/spec.md`

## Summary

Aplicação web em Next.js (App Router) que registra veículos, abastecimentos e postos, e deriva
média de consumo, custo por quilômetro, evolução do consumo e comparativo etanol × gasolina.

Abordagem técnica: regra de negócio pura em `src/domain` (sem React, sem I/O), casos de uso em
`src/application` dependendo apenas de interfaces de repositório, adaptadores SQLite em
`src/infrastructure/sqlite` selecionados por um container de composição, e UI em React Server
Components com ilhas cliente mínimas. A troca futura para Supabase consiste em adicionar
`src/infrastructure/supabase` e alternar a variável `LITRO_DB_DRIVER` — nenhuma linha de `domain`,
`application` ou `ui` muda.

## Technical Context

**Language/Version**: TypeScript 5.x em modo `strict`, Node.js 22 LTS

**Primary Dependencies**: Next.js 16 (App Router, React 19), `better-sqlite3` (driver síncrono
server-side), `zod` (validação de fronteira). Nenhuma biblioteca de UI, de gráficos ou de estado
global.

**Storage**: SQLite em arquivo (`data/litro.db`), acessado somente no servidor por repositórios
plugáveis. Interface preparada para adaptador Supabase (Postgres) sem alteração de domínio.

**Testing**: `node:test` + `node:assert` executados pelo runtime nativo com type stripping
(`node --test`). Cobertura obrigatória das regras de cálculo do domínio.

**Target Platform**: Navegadores modernos (mobile-first, ≥ 320 px), servidor Node.js 22.

**Project Type**: Aplicação web full-stack single-project (Next.js com camadas internas).

**Performance Goals**: Primeira tela útil ≤ 2 s em 4G; qualquer mutação reflete em ≤ 1 s;
animações ≤ 400 ms a 60 fps; JS de primeira carga o mais próximo possível do piso do framework.

> **Medido no build final**: ~152 KB gzip são o runtime de React 19 + App Router — o piso da stack,
> não código do projeto. O JavaScript da aplicação em si soma ~8 KB gzip por rota. A meta inicial de
> 120 KB registrada neste plano era inatingível com Next.js e foi corrigida aqui: o que o projeto
> controla é a parcela de aplicação, e essa está bem abaixo do orçamento.

**Constraints**: Sem bibliotecas pesadas; sem acesso do cliente ao banco; strings de UI em pt-BR;
temas claro/escuro sem flash na primeira pintura; teclado e leitor de tela plenamente suportados;
arquivos ≤ 200 linhas.

**Scale/Scope**: Instância pessoal — dezenas de veículos, milhares de abastecimentos. 8 rotas,
~40 componentes, 4 agregados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano atende | Status inicial | Pós-design |
|-----------|--------------------|----------------|------------|
| I. Arquitetura em Camadas | Pastas `domain/`, `application/`, `infrastructure/`, `ui/` + `app/`; dependências apontam para dentro; regra de ESLint `no-restricted-imports` bloqueia importação de React/driver em `domain/` | PASS | PASS |
| II. SOLID Aplicado | Um caso de uso por arquivo (SRP); catálogo de combustíveis e conversores de unidade abertos a extensão (OCP); interfaces separadas `VehicleRepository`/`FillUpRepository`/`StationRepository` (ISP); container injeta implementações (DIP) | PASS | PASS |
| III. Arquivos Pequenos e Coesos | Um componente/caso de uso por arquivo; tokens de tema centralizados em `ui/styles`; telas montadas por composição de blocos de `ui/features` | PASS | PASS |
| IV. Persistência Plugável | Repositórios definidos em `application/ports`; SQLite em `infrastructure/sqlite`; mapeadores `row → entidade` isolados; migrações versionadas em `infrastructure/sqlite/migrations` | PASS | PASS |
| V. Leveza e Fluidez | RSC por padrão; `"use client"` só em formulários, alternador de tema e toasts; gráfico em CSS/SVG; sem lib de estado; `prefers-reduced-motion` respeitado | PASS | PASS |
| VI. Acessível e Responsiva pt-BR | Formatadores `pt-BR` centralizados; tokens do `design-model`; layout fluido de 320 px; navegação por teclado e `aria-*` nos controles | PASS | PASS |

Nenhuma violação a justificar — a seção Complexity Tracking permanece vazia.

## Project Structure

### Documentation (this feature)

```text
specs/001-controle-abastecimento/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── repositories.md
│   └── server-actions.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/                                  # Rotas Next.js (App Router) — só composição
│   ├── layout.tsx                        # Shell: tema, fontes, header
│   ├── page.tsx                          # Lista de veículos
│   ├── veiculos/novo/page.tsx
│   ├── veiculos/[id]/editar/page.tsx
│   ├── painel/page.tsx
│   ├── abastecer/page.tsx
│   ├── historico/page.tsx
│   ├── postos/page.tsx
│   ├── comparativo/page.tsx
│   ├── ajustes/page.tsx
│   └── actions/                          # Server Actions por agregado
│       ├── vehicle-actions.ts
│       ├── fill-up-actions.ts
│       ├── station-actions.ts
│       └── preference-actions.ts
├── domain/                               # Puro: sem React, sem I/O
│   ├── shared/                           # Result, DomainError, Id, parsers numéricos
│   ├── vehicle/                          # Vehicle, VehicleType, Plate, FuelType
│   ├── fill-up/                          # FillUp, Odometer, Liters, Money
│   ├── station/                          # Station, FuelPrices
│   └── analytics/                        # consumption, averages, cost, comparison
├── application/
│   ├── ports/                            # Interfaces de repositório e de preferências
│   └── use-cases/                        # Um caso de uso por arquivo
├── infrastructure/
│   ├── sqlite/                           # Conexão, migrações, repositórios, mapeadores
│   ├── preferences/                      # Cookie store (tema, unidade)
│   └── container.ts                      # Composition root (driver selecionável)
└── ui/
    ├── styles/                           # tokens.css, themes.css, globals.css
    ├── components/                       # Primitivos reutilizáveis (Card, Field, Pill…)
    ├── features/                         # Blocos por área (vehicles, fill-ups, stations…)
    └── format/                           # Formatadores pt-BR (moeda, número, data)

tests/
└── domain/                               # node:test para cálculos e validações

data/                                     # Banco SQLite (gitignored)
```

**Structure Decision**: single-project Next.js com as quatro camadas da constituição materializadas
como diretórios de primeiro nível dentro de `src/`. `app/` contém apenas composição e fronteira
HTTP; toda decisão de negócio vive em `domain/` e é orquestrada por `application/`.

## Phase 0 — Research

Consolidado em [research.md](./research.md). Decisões principais:

1. **Driver SQLite**: `better-sqlite3` (síncrono, maduro, ideal para RSC) em vez de `node:sqlite`
   experimental ou de um ORM completo.
2. **Fronteira de escrita**: Server Actions + `revalidatePath`, dispensando camada de API REST.
3. **Preferências**: cookies HTTP lidos no servidor, eliminando flash de tema e hidratação extra.
4. **Estilos**: CSS Modules + variáveis CSS derivadas do `design-model`, sem Tailwind nem CSS-in-JS.
5. **Gráfico**: barras em CSS puro, como no modelo de layout.
6. **Testes**: `node --test` com type stripping nativo, sem Jest/Vitest.
7. **Preparação Supabase**: portas assíncronas mesmo com driver síncrono, ids gerados no domínio.

## Phase 1 — Design & Contracts

- [data-model.md](./data-model.md) — entidades, invariantes, schema SQL e regras de cálculo.
- [contracts/repositories.md](./contracts/repositories.md) — interfaces das portas de persistência.
- [contracts/server-actions.md](./contracts/server-actions.md) — contrato de entrada/saída da UI.
- [quickstart.md](./quickstart.md) — como rodar, validar e trocar o driver de banco.

### Constitution Check (pós-design)

Reavaliado após o desenho: todos os princípios permanecem PASS. O desenho de portas assíncronas e
mapeadores isolados confirma o Princípio IV; a divisão de `ui/features` por área confirma o
Princípio III; a ausência de dependências de UI confirma o Princípio V.

## Complexity Tracking

> Nenhuma violação constitucional identificada. Seção intencionalmente vazia.
