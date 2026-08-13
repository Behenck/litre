<!--
Sync Impact Report
==================
Version change: (none) → 1.0.0
Bump rationale: Initial ratification. Template placeholders replaced with concrete,
enforceable project principles; no prior version existed.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Arquitetura em Camadas (Layered Architecture)
  - [PRINCIPLE_2_NAME] → II. SOLID Aplicado (NÃO NEGOCIÁVEL)
  - [PRINCIPLE_3_NAME] → III. Arquivos Pequenos e Coesos
  - [PRINCIPLE_4_NAME] → IV. Persistência Plugável (SQLite → Supabase)
  - [PRINCIPLE_5_NAME] → V. Leveza e Fluidez
  - (added)            → VI. Interface Acessível e Responsiva em pt-BR

Added sections:
  - Restrições Técnicas (was [SECTION_2_NAME])
  - Fluxo de Desenvolvimento e Portões de Qualidade (was [SECTION_3_NAME])

Removed sections: none

Deferred TODOs: none
-->

# Litro Constitution

Litro é um aplicativo web de controle de abastecimentos, média de consumo e comparativo de
combustíveis. Esta constituição define as regras não negociáveis que qualquer especificação,
plano ou implementação do projeto MUST respeitar.

## Core Principles

### I. Arquitetura em Camadas

O código MUST estar organizado em quatro camadas com dependências apontando somente para dentro:

- `domain/` — entidades, value objects e regras de negócio puras. MUST NOT importar React,
  Next.js, drivers de banco ou qualquer I/O.
- `application/` — casos de uso que orquestram o domínio através de interfaces (ports).
  MUST depender apenas de `domain/` e de contratos de repositório.
- `infrastructure/` — adaptadores concretos (SQLite, Supabase, storage, mapeadores).
  Implementa as interfaces declaradas em `application/`.
- `ui/` (e `app/`) — componentes, rotas e apresentação. MUST NOT conter regra de negócio;
  cálculo de consumo, custo e comparativo MUST viver em `domain/`.

Rationale: isolar a regra de negócio do framework é o que permite trocar banco, trocar
renderização ou testar cálculos sem subir a aplicação.

### II. SOLID Aplicado (NÃO NEGOCIÁVEL)

- **SRP**: cada módulo, componente e caso de uso MUST ter uma única razão para mudar.
  Um componente que busca dados, formata e renderiza MUST ser dividido.
- **OCP**: novos tipos de combustível, novas unidades de consumo e novos provedores de dados
  MUST entrar por extensão (nova implementação/registro), nunca por edição de `switch` espalhado.
- **LSP**: toda implementação de um repositório MUST honrar o contrato integralmente; um
  adaptador que não suporta uma operação MUST falhar explicitamente, não silenciosamente.
- **ISP**: interfaces MUST ser segregadas por agregado (`VehicleRepository`, `FillUpRepository`,
  `StationRepository`); MUST NOT existir uma interface única "DataRepository" genérica.
- **DIP**: casos de uso e componentes MUST receber dependências por injeção/container e depender
  de abstrações; `import` direto de driver de banco fora de `infrastructure/` é proibido.

Rationale: o pedido explícito do projeto é SOLID; sem regras verificáveis o princípio vira slogan.

### III. Arquivos Pequenos e Coesos

- Um arquivo MUST conter uma única unidade exportada principal (um componente, um caso de uso,
  uma entidade, um mapeador).
- Arquivos SHOULD ficar abaixo de 150 linhas e MUST NOT ultrapassar 200 linhas; ao ultrapassar,
  o arquivo MUST ser dividido antes do merge.
- Componentes de UI MUST ser decompostos por responsabilidade visual (card, lista, formulário,
  campo) e reutilizados; MUST NOT existir tela monolítica com todos os blocos inline.
- Estilos e tokens de design MUST ser centralizados (CSS variables/tema), não duplicados por tela.

Rationale: requisito explícito do projeto — nenhum arquivo único e gigante.

### IV. Persistência Plugável (SQLite → Supabase)

- Todo acesso a dados MUST passar por interfaces de repositório definidas na camada de aplicação.
- A implementação inicial MUST ser SQLite; uma implementação Supabase MUST poder ser adicionada
  criando novos adaptadores e trocando a configuração do container, sem alterar `domain/`,
  `application/` ou `ui/`.
- Entidades de domínio MUST ser independentes do formato de linha do banco; mapeadores
  (`row → entidade`) MUST viver em `infrastructure/`.
- Migrações e schema MUST ser versionados em arquivos, não criados implicitamente em runtime
  sem registro.

Rationale: a troca de banco já é um requisito conhecido; o custo dela é decidido agora.

### V. Leveza e Fluidez

- Renderização MUST usar React Server Components por padrão; `"use client"` MUST ser aplicado
  apenas no menor componente que realmente precisa de interatividade.
- MUST NOT adicionar bibliotecas pesadas de UI, de gráficos ou de estado global; gráficos e
  componentes visuais MUST ser implementados com CSS/SVG nativos.
- Feedback de interação MUST ser imediato: navegação sem recarga total, estados de carregamento
  explícitos e atualização otimista onde a operação for reversível.
- Animações MUST ser curtas (≤ 400 ms) e MUST respeitar `prefers-reduced-motion`.

Rationale: o pedido é um sistema leve e fluido; peso de bundle é decisão de arquitetura, não
de estilo.

### VI. Interface Acessível e Responsiva em pt-BR

- Toda a interface MUST estar em português do Brasil, com formatação `pt-BR` para números,
  moeda e datas (vírgula decimal, `R$`, `dd/mm/aaaa`).
- O layout MUST seguir os tokens do `design-model/` (paleta, tipografia, raios, espaçamentos)
  e MUST suportar tema claro e escuro.
- A interface MUST ser utilizável de 320 px a telas largas, com alvos de toque ≥ 44 px.
- Todo controle interativo MUST ser acessível por teclado, ter nome acessível e contraste
  mínimo AA; campos numéricos MUST declarar `inputmode` adequado.

Rationale: o app é usado no posto, no celular, com uma mão — usabilidade é requisito funcional.

## Restrições Técnicas

- **Stack**: Next.js (App Router) + TypeScript em modo `strict`. `any` implícito ou explícito
  MUST NOT ser introduzido sem justificativa registrada no PR.
- **Banco inicial**: SQLite acessado somente no servidor. Credenciais e caminhos de banco
  MUST vir de variáveis de ambiente, nunca hardcoded.
- **Mutations**: escrita de dados MUST ocorrer em Server Actions ou route handlers; o cliente
  MUST NOT falar com o banco diretamente.
- **Validação**: toda entrada externa MUST ser validada na fronteira da aplicação antes de
  alcançar o domínio; entidades de domínio MUST rejeitar estados inválidos na construção.
- **Cálculos financeiros e de consumo**: MUST ser determinísticos, cobertos por testes e
  centralizados no domínio — nunca recalculados ad hoc na UI.
- **Estrutura de pastas**: MUST refletir as camadas do Princípio I de forma explícita e
  navegável.

## Fluxo de Desenvolvimento e Portões de Qualidade

- Todo trabalho MUST seguir o fluxo Spec Kit: `specify` → `plan` → `tasks` → `implement`.
- Antes de concluir uma tarefa, os portões abaixo MUST passar:
  1. `tsc` sem erros e lint sem erros;
  2. testes das regras de domínio (média de consumo, custo por km, comparativo) verdes;
  3. build de produção concluído;
  4. revisão dos limites de tamanho de arquivo (Princípio III).
- Regras de negócio novas MUST vir acompanhadas de teste antes de serem consideradas prontas.
- Qualquer violação consciente de um princípio MUST ser registrada na seção de rastreamento de
  complexidade do plano, com alternativa mais simples descartada e o motivo.

## Governance

Esta constituição prevalece sobre qualquer outra prática, preferência de estilo ou conveniência
de implementação neste repositório.

- **Emendas**: MUST ser propostas por escrito, descrevendo princípio afetado, motivação e
  impacto nos artefatos existentes (`spec.md`, `plan.md`, `tasks.md`, código).
- **Versionamento** (semântico):
  - MAJOR — remoção ou redefinição incompatível de princípio ou governança;
  - MINOR — novo princípio/seção ou expansão material de orientação;
  - PATCH — esclarecimentos, redação e correções sem mudança semântica.
- **Conformidade**: toda revisão de código e todo plano MUST verificar aderência aos princípios;
  planos MUST conter um Constitution Check antes e depois do desenho técnico.
- **Orientação de runtime**: convenções operacionais do dia a dia vivem em `CLAUDE.md`, que
  MUST NOT contradizer esta constituição.

**Version**: 1.0.0 | **Ratified**: 2026-08-13 | **Last Amended**: 2026-08-13
