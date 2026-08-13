# Contract — Portas de Persistência

**Local**: `src/application/ports/` | **Implementações**: `src/infrastructure/sqlite/`

Interfaces segregadas por agregado (ISP). Toda assinatura é assíncrona por contrato, mesmo quando o
driver atual é síncrono, para que um adaptador de rede (Supabase) seja aditivo (research D7).

---

## `VehicleRepository`

```ts
export interface VehicleRepository {
  list(): Promise<Vehicle[]>;                        // ordenado por createdAt asc
  findById(id: Id): Promise<Vehicle | null>;
  save(vehicle: Vehicle): Promise<void>;             // insert ou update por id
  delete(id: Id): Promise<void>;                     // remove abastecimentos em cascata
}
```

## `FillUpRepository`

```ts
export interface FillUpRepository {
  listByVehicle(vehicleId: Id): Promise<FillUp[]>;   // ordenado por odometer asc
  findLastByVehicle(vehicleId: Id): Promise<FillUp | null>;
  findById(id: Id): Promise<FillUp | null>;
  save(fillUp: FillUp): Promise<void>;
  delete(id: Id): Promise<void>;
  listStationNames(): Promise<string[]>;             // distintos, para sugestão (FR-014)
}
```

## `StationRepository`

```ts
export interface StationRepository {
  list(): Promise<Station[]>;                        // ordenado por updatedAt desc
  findByNameKey(nameKey: string): Promise<Station | null>;
  save(station: Station): Promise<void>;             // upsert por nameKey (FR-028)
  delete(id: Id): Promise<void>;
}
```

## `PreferencesStore`

```ts
export interface PreferencesStore {
  read(): Promise<Preferences>;                      // { theme, unit } com padrões aplicados
  write(preferences: Partial<Preferences>): Promise<void>;
}
```

## `SeedDataSource`

```ts
export interface SeedDataSource {
  reset(): Promise<void>;   // limpa e recarrega o conjunto de demonstração (FR-036)
}
```

---

## Regras de conformidade (LSP)

1. `save` MUST ser idempotente para o mesmo estado de entidade.
2. `delete` de um id inexistente MUST ser no-op, nunca erro.
3. Ordenações declaradas acima fazem parte do contrato — um adaptador que não as garanta está
   violando o contrato.
4. Um adaptador que não suporte uma operação MUST lançar erro explícito; MUST NOT retornar vazio
   silenciosamente.
5. Nenhuma implementação pode lançar erro específico de driver para fora; erros MUST ser traduzidos
   para `RepositoryError` de `src/domain/shared`.

## Composition root

```ts
// src/infrastructure/container.ts
export function getContainer(): Container;
// Lê LITRO_DB_DRIVER ('sqlite' | 'supabase'); resolve as implementações uma única vez por processo.
```

Nenhum arquivo fora de `src/infrastructure/` pode importar `better-sqlite3` (ou, futuramente,
`@supabase/supabase-js`). Regra imposta por `no-restricted-imports` no ESLint.

## Caminho de migração para Supabase

1. Criar `src/infrastructure/supabase/` com um mapeador e três repositórios implementando as
   mesmas interfaces.
2. Traduzir as migrações SQL para Postgres (tipos equivalentes já indicados no data-model).
3. Registrar o driver em `container.ts` e definir `LITRO_DB_DRIVER=supabase`.

Nenhuma alteração em `src/domain/`, `src/application/`, `src/ui/` ou `src/app/`.
