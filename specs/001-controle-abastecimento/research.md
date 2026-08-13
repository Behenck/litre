# Phase 0 — Research: Litre

**Date**: 2026-08-13 | **Plan**: [plan.md](./plan.md)

Nenhum item permaneceu como NEEDS CLARIFICATION. Cada decisão abaixo resolve uma incógnita do
Technical Context.

---

## D1 — Driver de persistência inicial

**Decision**: `better-sqlite3`, encapsulado em `src/infrastructure/sqlite`, declarado em
`serverExternalPackages` na configuração do Next.

**Rationale**: API síncrona elimina pool e promessas em leitura dentro de Server Components,
tornando as páginas triviais de compor. É o driver SQLite mais maduro do ecossistema Node, com
transações e `prepare` cacheado. Como o acesso já está atrás de uma porta, a natureza síncrona não
vaza para as camadas superiores — as portas são assíncronas por contrato (ver D7).

**Alternatives considered**:
- `node:sqlite` (nativo): zero dependências, mas ainda marcado como experimental e sujeito a
  mudança de API entre minors — risco desnecessário para a base de dados do usuário.
- Prisma/Drizzle: trariam geração de código, schema próprio e peso de build; o projeto tem quatro
  tabelas e consultas simples, e um ORM competiria com a camada de domínio pela modelagem.
- `sql.js`/localStorage: descartados porque a especificação assume dados no servidor, acessíveis de
  qualquer navegador.

---

## D2 — Fronteira de escrita: Server Actions em vez de API REST

**Decision**: mutações expostas como Server Actions em `src/app/actions/*`, que validam a entrada,
chamam o caso de uso correspondente e disparam `revalidatePath`.

**Rationale**: elimina uma camada inteira (rotas, fetch, serialização manual, estados de loading
duplicados), reduzindo JS enviado ao cliente e mantendo o Princípio V. Formulários funcionam com
`<form action={...}>` e permanecem utilizáveis mesmo antes da hidratação.

**Alternatives considered**:
- Route Handlers REST + `fetch` no cliente: mais código, mais bundle, sem ganho — não há consumidor
  externo da API nesta versão.
- tRPC: dependência adicional e camada de tipos redundante em um app sem cliente separado.

---

## D3 — Preferências (tema e unidade) em cookies

**Decision**: tema e unidade persistidos em cookies (`litro.tema`, `litro.unidade`), lidos no
servidor no `layout.tsx` e aplicados como `data-theme`/`data-unit` no `<html>`; alternância feita
por Server Action com atualização otimista no cliente.

**Rationale**: o servidor já conhece a preferência na primeira resposta, então não existe flash de
tema claro antes do escuro nem efeito de hidratação. A unidade também afeta a formatação feita no
servidor, o que exige que ela seja legível lá.

**Alternatives considered**:
- `localStorage` + script bloqueante no `<head>`: solução clássica, mas injeta script inline,
  atrasa a primeira pintura e não serve para formatação server-side.
- Tabela de preferências no banco: desnecessário sem contas de usuário; cookie é mais barato e
  já é por dispositivo, que é o comportamento desejado para tema.

---

## D4 — Estilos: CSS Modules + variáveis CSS

**Decision**: tokens do `design-model` (cores, raios, espaçamentos, fontes) declarados em
`src/ui/styles/tokens.css`; temas claro/escuro trocados por `[data-theme]`; cada componente com seu
`.module.css` ao lado.

**Rationale**: suporte nativo do Next, zero runtime, escopo automático, e o modelo de layout já é
escrito em variáveis CSS (`--bg`, `--panel`, `--accent`…), o que torna a transposição direta e
fiel. CSS Modules mantêm o Princípio III: o estilo mora junto do componente e some com ele.

**Alternatives considered**:
- Tailwind: adiciona build step, e as classes utilitárias inflariam o JSX exatamente onde a
  constituição pede arquivos pequenos e legíveis.
- styled-components/Emotion: runtime no cliente, incompatível com o objetivo de leveza e atrito
  conhecido com Server Components.

---

## D5 — Gráfico de consumo em CSS puro

**Decision**: barras verticais construídas com flexbox e `height` percentual, exatamente como o
modelo de layout, encapsuladas em `ConsumptionChart`, com `<title>`/`aria-label` descrevendo cada
barra e uma tabela visualmente oculta como alternativa acessível.

**Rationale**: o gráfico exibe no máximo seis valores; uma biblioteca custaria dezenas de KB para
desenhar seis retângulos. Renderiza no servidor e não depende de hidratação.

**Alternatives considered**:
- Recharts/Chart.js: peso de bundle incompatível com a meta de 120 KB e com o Princípio V.
- SVG manual: viável, mas as barras em CSS herdam os tokens de tema sem cálculo de coordenadas.

---

## D6 — Testes com o runner nativo

**Decision**: `node:test` + `node:assert/strict` sobre arquivos `*.test.ts` em `tests/domain`,
carregados com `node --import tsx --test`.

**Correção durante a implementação**: a intenção original era usar apenas o type stripping nativo do
Node 22, com zero dependência de desenvolvimento. Na prática o resolvedor ESM do Node não resolve
especificadores TypeScript sem extensão (`./connection` → `connection.ts`), o que quebra tanto os
testes quanto os scripts de banco. A alternativa seria escrever `.ts` em todos os imports do
projeto — poluir o código de produção por causa da ferramenta de teste. `tsx` resolve isso como
dependência exclusivamente de desenvolvimento, sem nenhum efeito sobre o que chega ao navegador.

**Rationale**: as regras que precisam de teste (consumo por trecho, média ponderada, custo por km,
comparativo, parsing pt-BR) são funções puras e não exigem DOM, mocks nem transformação. Zero
dependência de desenvolvimento e execução em milissegundos.

**Alternatives considered**:
- Vitest/Jest: infraestrutura de transformação e configuração desproporcional para testar funções
  puras.
- Playwright: valioso para os fluxos ponta a ponta, mas fora do escopo desta versão; os cenários de
  aceitação estão descritos no `quickstart.md` para validação manual.

---

## D7 — Preparação para Supabase

**Decision**: (a) as portas de repositório são assíncronas (`Promise<...>`) mesmo com driver
síncrono; (b) identificadores são gerados no domínio (`crypto.randomUUID()`), nunca por
autoincremento do banco; (c) datas trafegam como `YYYY-MM-DD` e valores monetários como inteiros de
centavos; (d) o container lê `LITRO_DB_DRIVER` (`sqlite` | `supabase`) para escolher a
implementação.

**Rationale**: cada um desses pontos é uma incompatibilidade clássica descoberta tarde na migração
para Postgres/Supabase. Resolvidos no desenho, o adaptador futuro é aditivo: novos arquivos em
`infrastructure/supabase` e uma variável de ambiente.

**Alternatives considered**:
- Portas síncronas espelhando o `better-sqlite3`: tornaria a migração para qualquer banco de rede
  uma refatoração de assinatura em todas as camadas — exatamente o que o Princípio IV proíbe.
- IDs autoincrementais: forçariam ida ao banco antes de compor a entidade e complicariam
  sincronização futura entre dispositivos.

---

## D8 — Seleção de veículo e navegação

**Decision**: o veículo em foco viaja como parâmetro de busca (`?veiculo=<id>`) nas rotas de painel,
histórico e abastecimento; a navegação usa `<Link>` do App Router.

**Rationale**: mantém as páginas como Server Components puros e parametrizados, preserva
voltar/avançar do navegador e permite compartilhar ou favoritar a visão de um veículo específico —
sem nenhum estado global no cliente.

**Alternatives considered**:
- Contexto React global: exigiria transformar as telas em componentes cliente, contrariando o
  Princípio V.
- Cookie de veículo selecionado: quebra o botão voltar e torna duas abas do navegador
  inconsistentes entre si.

---

## D9 — Precisão numérica

**Decision**: valores monetários armazenados e transportados como inteiros de centavos; litros e
quilometragem como decimais com arredondamento apenas na apresentação; entrada do usuário
convertida por um parser pt-BR dedicado no domínio (`"1.248,50" → 124850`).

**Rationale**: aritmética de ponto flutuante sobre reais produz divergência de centavos em totais
acumulados, e a especificação exige que a média confira com o cálculo manual do usuário (SC-003).

**Alternatives considered**:
- `Number` com `toFixed` na exibição: mascara o erro acumulado em vez de evitá-lo.
- Biblioteca de decimais (`decimal.js`): peso desnecessário para somas e uma divisão.
