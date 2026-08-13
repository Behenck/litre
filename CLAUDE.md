# CLAUDE.md

Convenções operacionais do repositório Litre. As regras de governança estão em
`.specify/memory/constitution.md` e prevalecem sobre este arquivo.

## Comandos

```bash
npm run dev          # desenvolvimento
npm test             # testes de domínio (node --test)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint, inclui as regras de fronteira entre camadas
npm run build        # build de produção
npm run db:migrate   # aplica migrações (idempotente)
npm run db:seed      # SUBSTITUI os dados pelos de demonstração
```

Antes de considerar uma tarefa pronta: `npm run typecheck && npm run lint && npm test && npm run build`.

## Onde cada coisa mora

| Preciso mexer em… | Vai em |
|-------------------|--------|
| regra de cálculo (consumo, custo, comparativo) | `src/domain/analytics/` |
| validação de um dado ao criar/editar | a fábrica da entidade em `src/domain/<agregado>/` |
| orquestração (buscar, validar entre agregados, salvar) | `src/application/use-cases/` (um caso por arquivo) |
| acesso a banco | `src/infrastructure/sqlite/` e `src/infrastructure/supabase/` — e só aí |
| regra de conta (e-mail, senha, sessão) | `src/domain/account/` |
| cidade/estado do motorista | `src/domain/shared/region.ts` |
| JWT, hash de senha, cookie de sessão, e-mail | `src/infrastructure/auth/` e `src/infrastructure/mail/` |
| leitura de formulário e revalidação | `src/app/actions/` |
| tela | `src/app/<rota>/page.tsx`, compondo blocos de `src/ui/features/` |
| componente reutilizável | `src/ui/components/` |
| cor, espaçamento, raio | `src/ui/styles/tokens.css` |
| formatação pt-BR | `src/ui/format/` |

## Regras que o lint cobra

- `src/domain/**` não importa React, Next, driver de banco nem outras camadas.
- `src/application/**` importa apenas `domain/` e as próprias portas.
- `src/ui/**` e `src/app/**` não importam `better-sqlite3`, `@supabase/*` nem adaptadores
  concretos (`infrastructure/sqlite`, `supabase`, `auth`, `mail`, `preferences`) — usam
  `getContainer()`.

Se precisar burlar alguma dessas regras, o desenho está errado.

## Convenções de código

- **Um arquivo, uma unidade exportada principal.** Máximo de 200 linhas; ao passar disso, divida.
- **Componente sempre com seu `.module.css` ao lado**, mesmo nome.
- **`"use client"` só no menor componente que precisa de interação.** Página é Server Component.
- **Nada de cor literal no CSS** — use as variáveis de `tokens.css`.
- **Dinheiro em centavos inteiros** (`Money`), nunca em reais com ponto flutuante.
- **Números do usuário passam por `parseDecimalPtBr`/`parseMoneyPtBr`** — nunca por `Number()`.
- **Erro de regra de negócio devolve `Result`**, não lança exceção. Exceção é só para falha de
  infraestrutura (`RepositoryError`).
- **Texto de interface em português do Brasil**, escrito para um motorista, sem jargão técnico.

## Ao adicionar…

- **um combustível**: acrescente uma entrada em `src/domain/vehicle/fuel-type.ts`. Nada mais.
- **uma página nova**: chame `requireUser()` no topo — página sem isso é página aberta.
- **uma unidade de consumo**: `src/domain/shared/consumption-unit.ts`.
- **uma coluna ou tabela**: nova migração em `src/infrastructure/sqlite/migrations/`, registrada no
  `index.ts` — nunca edite uma migração já aplicada.
- **uma regra de cálculo**: escreva o teste em `tests/domain/` antes da implementação.

## Cuidados

- `npm run db:seed` e o botão "Restaurar" em Ajustes **apagam** os veículos e abastecimentos da
  conta (os postos da cidade, não).
- **O dono vem sempre da sessão** (`requireUser()`), nunca do formulário. O filtro por `user_id`
  mora dentro do repositório, não na camada de cima.
- Login, cadastro e confirmação de e-mail só funcionam com `LITRO_DB_DRIVER=supabase`.
- O posto é o único dado coletivo: quem dirige na mesma cidade (`regionKey` = `UF:cidade`) lê e
  corrige os mesmos preços. Só quem anotou por último pode remover.
- Trocar `LITRO_JWT_SECRET` derruba todas as sessões abertas.
- O odômetro crescente é validado no caso de uso (`register-fill-up`), não na entidade — ele
  depende do abastecimento anterior.
- A média é ponderada (Σ km ÷ Σ litros), nunca a média aritmética dos consumos.
- Abastecimento parcial entra no total gasto, mas nunca no cálculo da média.
