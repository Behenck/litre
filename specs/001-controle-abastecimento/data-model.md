# Phase 1 — Data Model: Litre

**Date**: 2026-08-13 | **Plan**: [plan.md](./plan.md)

Todas as entidades vivem em `src/domain/` e são construídas por fábricas que rejeitam estados
inválidos. Nenhuma entidade conhece SQL, HTTP ou React.

---

## Value Objects (`src/domain/shared`, `src/domain/vehicle`, `src/domain/fill-up`)

| Value Object | Representação | Invariantes |
|--------------|---------------|-------------|
| `Id` | `string` (UUID v4) | não vazio; gerado no domínio |
| `Money` | `number` inteiro em centavos | ≥ 0; nunca fracionário |
| `Liters` | `number` | > 0; no máximo 3 casas decimais |
| `Odometer` | `number` | ≥ 0; no máximo 1 casa decimal |
| `IsoDate` | `string` `YYYY-MM-DD` | data válida; não pode ser futura em abastecimento |
| `Plate` | `string` | 0 ou 7 caracteres alfanuméricos; normalizada para maiúsculas |
| `FuelType` | união literal | `gasolina-comum`, `gasolina-aditivada`, `etanol`, `diesel`, `gnv`, `eletrico` |
| `VehicleType` | união literal | `carro`, `moto` |
| `ConsumptionUnit` | união literal | `km/l`, `l/100km` |
| `Theme` | união literal | `claro`, `escuro` |

O parser pt-BR (`parseDecimalPtBr`) aceita `"32,4"`, `"1.248,50"` e `"1248.50"`, e falha
explicitamente em entradas não numéricas. Ele é a única porta de entrada de números digitados.

---

## Entidade: Vehicle

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `id` | `Id` | sim | imutável |
| `type` | `VehicleType` | sim | padrão `carro` |
| `brand` | `string` | não | ≤ 40 caracteres |
| `model` | `string` | **sim** | não vazio após trim; ≤ 60 caracteres |
| `year` | `number \| null` | não | entre 1900 e ano corrente + 1 |
| `plate` | `Plate` | não | vazia permitida |
| `color` | `string` | sim | hex de 7 caracteres; padrão `#B8BDC4` |
| `colorName` | `string` | sim | nome exibível da cor |
| `mainFuel` | `FuelType` | sim | padrão `gasolina-comum` |
| `nickname` | `string` | não | ≤ 40 caracteres |
| `initialOdometer` | `Odometer` | sim | ≥ 0 |
| `createdAt` | `IsoDate` | sim | atribuído na criação |

**Derivados**: `displayName` = `nickname` ou `"{brand} {model}"` ou `"Veículo"`;
`currentOdometer` = maior valor entre `initialOdometer` e a quilometragem do último abastecimento.

**Relacionamentos**: 1 Vehicle → N FillUp. Excluir um Vehicle remove seus FillUps em cascata.

---

## Entidade: FillUp

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `id` | `Id` | sim | imutável |
| `vehicleId` | `Id` | sim | veículo existente |
| `date` | `IsoDate` | sim | não futura |
| `odometer` | `Odometer` | sim | > odômetro do abastecimento anterior do mesmo veículo |
| `liters` | `Liters` | sim | > 0 |
| `total` | `Money` | sim | > 0 |
| `fuel` | `FuelType` | sim | — |
| `stationName` | `string` | não | ≤ 60 caracteres; usado para sugestão |
| `fullTank` | `boolean` | sim | padrão `true` |
| `createdAt` | `IsoDate` | sim | — |

**Derivado**: `pricePerLiter` = `total / liters` (em centavos, arredondado na apresentação).

A invariante de odômetro crescente é validada no caso de uso, que conhece o abastecimento anterior;
a entidade valida os limites que dependem apenas de si mesma.

---

## Entidade: Station

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `id` | `Id` | sim | imutável |
| `name` | `string` | sim | não vazio; chave natural (case-insensitive) |
| `gasolinePrice` | `Money \| null` | não | > 0 quando presente |
| `ethanolPrice` | `Money \| null` | não | > 0 quando presente |
| `dieselPrice` | `Money \| null` | não | > 0 quando presente |
| `updatedAt` | `string` ISO datetime | sim | atualizado a cada gravação |

Salvar um posto cujo `name` normalizado já existe atualiza o registro existente (FR-028).

---

## Conceito derivado: ConsumptionLeg (trecho)

Nunca persistido — sempre calculado a partir de dois abastecimentos consecutivos.

```
legs(fills) =
  para cada par consecutivo (anterior, atual) de abastecimentos do veículo ordenados por odômetro:
    se atual.fullTank e (atual.odometer - anterior.odometer) > 0 e atual.liters > 0:
      { fillUpId: atual.id, distance: atual.odometer - anterior.odometer,
        liters: atual.liters, kmPerLiter: distance / liters }
```

| Cálculo | Fórmula | Requisito |
|---------|---------|-----------|
| Consumo do trecho | `distance ÷ liters` | FR-015 |
| Média do veículo | `Σ distance ÷ Σ liters` (ponderada, **não** média de médias) | FR-016 |
| Custo por km | `últimoPreçoPorLitro ÷ médiaKmPorLitro` | FR-018 |
| Total gasto | `Σ total` de todos os abastecimentos, inclusive parciais | FR-017, FR-019 |
| Total de litros | `Σ liters` de todos os abastecimentos | FR-019 |
| Tendência | `(último.kmPerLiter − penúltimo.kmPerLiter) ÷ penúltimo.kmPerLiter` | FR-020 |
| Conversão de unidade | `L/100km = 100 ÷ km/L` | FR-021 |
| Comparativo | etanol vence se `preçoEtanol ÷ preçoGasolina < fator` (padrão 0,70) | FR-029, FR-030 |
| Custo/km por combustível | `preço ÷ (média × fatorDoCombustível)` | FR-030 |
| Trecho suspeito | `kmPerLiter > 100` ou `< 1` → sinalizado, não bloqueado | Edge case |

Abastecimentos parciais entram no total gasto e no total de litros, mas nunca em `legs` (FR-017).

---

## Schema SQL (SQLite — `infrastructure/sqlite/migrations`)

```sql
CREATE TABLE vehicles (
  id                TEXT PRIMARY KEY,
  type              TEXT NOT NULL,
  brand             TEXT NOT NULL DEFAULT '',
  model             TEXT NOT NULL,
  year              INTEGER,
  plate             TEXT NOT NULL DEFAULT '',
  color             TEXT NOT NULL,
  color_name        TEXT NOT NULL,
  main_fuel         TEXT NOT NULL,
  nickname          TEXT NOT NULL DEFAULT '',
  initial_odometer  REAL NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL
);

CREATE TABLE fill_ups (
  id            TEXT PRIMARY KEY,
  vehicle_id    TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  date          TEXT NOT NULL,
  odometer      REAL NOT NULL,
  liters        REAL NOT NULL,
  total_cents   INTEGER NOT NULL,
  fuel          TEXT NOT NULL,
  station_name  TEXT NOT NULL DEFAULT '',
  full_tank     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL
);

CREATE INDEX idx_fill_ups_vehicle ON fill_ups(vehicle_id, odometer);

CREATE TABLE stations (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  name_key        TEXT NOT NULL UNIQUE,   -- name normalizado (minúsculas, sem acento)
  gasoline_cents  INTEGER,
  ethanol_cents   INTEGER,
  diesel_cents    INTEGER,
  updated_at      TEXT NOT NULL
);
```

Notas de portabilidade para Supabase: todos os tipos usados (`TEXT`, `INTEGER`, `REAL`) têm
equivalente direto em Postgres (`text`, `bigint`, `double precision`); `full_tank` vira `boolean`
no adaptador, sem mudança de domínio, porque a conversão vive no mapeador.

---

## Preferências

Não são tabela. Vivem em cookies e são lidas por `PreferencesStore`
(`src/application/ports/preferences-store.ts`):

| Cookie | Valores | Padrão |
|--------|---------|--------|
| `litro.tema` | `claro` \| `escuro` | `claro` |
| `litro.unidade` | `km/l` \| `l/100km` | `km/l` |
