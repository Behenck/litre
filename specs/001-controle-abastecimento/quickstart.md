# Quickstart — Litre

**Plan**: [plan.md](./plan.md) | **Data model**: [data-model.md](./data-model.md)

## Pré-requisitos

- Node.js 22 LTS ou superior (`node -v`)
- npm 10+

## Instalação e execução

```bash
npm install
cp .env.example .env.local     # define LITRO_DB_DRIVER e LITRO_DB_PATH
npm run db:migrate             # cria data/litro.db e aplica as migrações
npm run db:seed                # opcional: carrega os dados de demonstração
npm run dev                    # http://localhost:3000
```

## Scripts

| Script | O que faz |
|--------|-----------|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build de produção e execução |
| `npm run lint` | ESLint, incluindo as regras de fronteira entre camadas |
| `npm run typecheck` | `tsc --noEmit` em modo strict |
| `npm test` | testes de domínio com `node --test` |
| `npm run db:migrate` | aplica migrações pendentes |
| `npm run db:seed` | restaura o conjunto de demonstração |

## Variáveis de ambiente

| Variável | Valores | Padrão |
|----------|---------|--------|
| `LITRO_DB_DRIVER` | `sqlite` \| `supabase` | `sqlite` |
| `LITRO_DB_PATH` | caminho do arquivo SQLite | `data/litro.db` |

---

## Roteiro de validação

Cada bloco valida uma user story da [spec](./spec.md). Execute com o banco vazio
(`rm data/litro.db && npm run db:migrate`).

### V1 — Cadastro e primeira média (User Story 1)

1. Abra `/` — deve mostrar o estado vazio com o convite para cadastrar um veículo.
2. Cadastre um veículo apenas com o modelo `Civic` → volta para `/` com o card criado, média `—`.
3. Registre o 1º abastecimento: km `47010`, litros `38,2`, total `241,35`, tanque cheio.
   - **Esperado**: o preço por litro aparece como `R$ 6,32` antes de salvar.
4. Registre o 2º abastecimento: km `47398`, litros `32,4`, total `203,47`, tanque cheio.
   - **Esperado**: média `11,98 km/L` (388 ÷ 32,4), custo por km `R$ 0,52`, total gasto `R$ 444,82`.
5. Tente registrar um terceiro com km `47000`.
   - **Esperado**: recusa com mensagem sobre a quilometragem precisar ser maior que a anterior.
6. Tente litros `0` e data de amanhã → ambos recusados com mensagem no campo, mantendo o restante
   preenchido.

### V2 — Painel, gráfico e histórico (User Story 2)

1. Com apenas um abastecimento registrado, o painel deve exibir a mensagem orientativa em vez do
   gráfico.
2. Com quatro abastecimentos, o gráfico deve mostrar três barras (um trecho a menos que o número de
   abastecimentos).
3. Registre um abastecimento parcial (tanque cheio desmarcado).
   - **Esperado**: total gasto aumenta, nenhuma barra nova aparece, média inalterada.
4. Exclua um abastecimento no histórico → média, total gasto e gráfico recalculam sem recarregar a
   página.
5. Com dois veículos cadastrados, troque o veículo em foco → painel, gráfico e histórico mudam
   juntos e a URL reflete `?veiculo=<id>`.

### V3 — Postos e comparativo (User Story 3)

1. Cadastre três postos com gasolina `6,29`, `6,09` e `6,19`.
   - **Esperado**: apenas o de `6,09` recebe o selo "mais barato".
2. Salve novamente um posto com o mesmo nome e preços diferentes.
   - **Esperado**: o registro é atualizado, não duplicado, e a data de atualização muda.
3. No comparativo, informe gasolina `6,29` e etanol `4,19` com fator `0,70`.
   - **Esperado**: recomendação "Etanol", proporção `67%`, e o custo por km de cada combustível.
4. Apague o preço do etanol → o resultado informa que faltam dados, sem recomendar.

### V4 — Preferências (User Story 4)

1. Alterne o tema → a interface inteira muda sem recarregar.
2. Recarregue a página → o tema escolhido é aplicado já na primeira pintura, sem flash.
3. Troque a unidade para `L/100km` → todas as médias convertem (`11,98 km/L` → `8,3 L/100km`) e os
   rótulos acompanham.

### V5 — Acessibilidade e responsividade

1. Reduza a janela para 320 px → nenhuma rolagem horizontal em nenhuma das sete telas.
2. Navegue só com `Tab`/`Enter` → toda a navegação principal e todos os formulários são alcançáveis,
   com foco sempre visível.
3. Verifique que os campos numéricos abrem o teclado numérico em dispositivos móveis.

### V6 — Portões de qualidade

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Todos devem passar sem erros. Os testes cobrem consumo por trecho, média ponderada, custo por km,
comparativo, conversão de unidade e parsing pt-BR.

---

## Trocando SQLite por Supabase (futuro)

1. Crie `src/infrastructure/supabase/` implementando as interfaces de
   [contracts/repositories.md](./contracts/repositories.md).
2. Traduza `src/infrastructure/sqlite/migrations/*.sql` para Postgres.
3. Registre o driver em `src/infrastructure/container.ts` e defina `LITRO_DB_DRIVER=supabase`.

Nenhum arquivo de `domain/`, `application/`, `ui/` ou `app/` precisa mudar — se algum precisar, o
Princípio IV da constituição foi violado em algum ponto anterior.
