# Contract — Server Actions (fronteira UI ↔ aplicação)

**Local**: `src/app/actions/` | **Consumidores**: formulários em `src/ui/features/`

Toda action recebe `FormData`, valida com `zod`, converte números com o parser pt-BR do domínio,
chama o caso de uso e revalida os caminhos afetados.

## Tipo de retorno comum

```ts
export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };
```

`fieldErrors` alimenta a mensagem inline do campo; nenhum dado já digitado é descartado (SC-007).

---

## Veículos — `vehicle-actions.ts`

| Action | Campos do formulário | Sucesso | Erros |
|--------|----------------------|---------|-------|
| `createVehicleAction` | `type`, `brand`, `model`, `year`, `plate`, `color`, `colorName`, `mainFuel`, `nickname`, `odometer` | redireciona para `/` com toast "Veículo salvo" | `model` vazio; `year` fora de faixa; `plate` com tamanho inválido |
| `updateVehicleAction` | os mesmos + `id` | permanece na página com toast | veículo inexistente |
| `deleteVehicleAction` | `id` | redireciona para `/` informando quantos abastecimentos foram removidos | veículo inexistente |

## Abastecimentos — `fill-up-actions.ts`

| Action | Campos | Sucesso | Erros |
|--------|--------|---------|-------|
| `createFillUpAction` | `vehicleId`, `date`, `odometer`, `liters`, `total`, `fuel`, `stationName`, `fullTank` | redireciona para `/painel?veiculo=<id>` com toast | odômetro ≤ último (FR-009); litros/total ≤ 0; data futura (FR-010); veículo não selecionado |
| `deleteFillUpAction` | `id`, `vehicleId` | revalida `/painel` e `/historico` com toast | abastecimento inexistente |

## Postos — `station-actions.ts`

| Action | Campos | Sucesso | Erros |
|--------|--------|---------|-------|
| `saveStationAction` | `name`, `gasoline`, `ethanol`, `diesel` | revalida `/postos`, upsert por nome | nome vazio; preço presente ≤ 0 |
| `deleteStationAction` | `id` | revalida `/postos` | — |

## Preferências — `preference-actions.ts`

| Action | Campos | Efeito |
|--------|--------|--------|
| `toggleThemeAction` | — | alterna cookie `litro.tema` e revalida o layout |
| `setUnitAction` | `unit` | grava cookie `litro.unidade` e revalida o layout |
| `resetSeedDataAction` | — | recarrega o conjunto de demonstração (FR-036) |

---

## Regras da fronteira

1. Nenhuma action contém regra de negócio — apenas validação de forma, chamada de caso de uso e
   revalidação. A decisão fica no domínio (Princípio I).
2. Toda action MUST revalidar explicitamente os caminhos afetados; nenhum estado derivado pode
   permanecer obsoleto na tela (SC-004).
3. Erros de domínio (`DomainError`) MUST ser traduzidos para mensagens em pt-BR compreensíveis para
   um motorista, sem jargão técnico.
4. Nenhuma action expõe identificadores internos do banco além do `id` da própria entidade.
