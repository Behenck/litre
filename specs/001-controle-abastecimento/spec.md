# Feature Specification: Litro — Controle de Abastecimento e Média de Consumo

**Feature Branch**: `001-controle-abastecimento`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Litro — sistema web de controle de abastecimento e média de consumo de veículos. Telas: lista de veículos, cadastro de veículo (tipo carro/moto, marca, modelo, ano, placa, cor, combustível principal, km atual, apelido), painel com média de consumo/custo por km/total gasto e gráfico de consumo por abastecimento, registro de abastecimento (km do painel, litros, valor total, data, combustível, posto, tanque cheio), histórico com exclusão, postos e preços (gasolina/etanol/diesel, marcar mais barato), comparativo etanol × gasolina, e ajustes (tema claro/escuro, unidade km/L ou L/100km). Base de layout: design-model/Litro.dc.html e Litro.html."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar abastecimento e descobrir a média real (Priority: P1)

O motorista cadastra seu veículo informando o essencial (tipo, modelo, placa, cor, combustível
principal e quilometragem atual). A cada parada no posto ele registra o abastecimento anotando a
quilometragem do painel, os litros, o valor total pago, a data, o combustível e o posto, indicando
se completou o tanque. Depois do segundo abastecimento de tanque cheio, o app mostra a média de
consumo real do veículo.

**Why this priority**: é a razão de existir do produto. Sem cadastro de veículo e registro de
abastecimento, nenhuma outra tela tem dado para exibir. Entrega valor sozinha.

**Independent Test**: cadastrar um veículo, registrar dois abastecimentos de tanque cheio com
quilometragens crescentes e verificar que a média exibida corresponde a
(km do 2º − km do 1º) ÷ litros do 2º.

**Acceptance Scenarios**:

1. **Given** nenhum veículo cadastrado, **When** o motorista preenche o cadastro com ao menos
   modelo e salva, **Then** o veículo aparece na lista com média "—" e a quilometragem informada.
2. **Given** um veículo cadastrado, **When** o motorista registra um abastecimento informando
   litros e valor total, **Then** o preço por litro é calculado e exibido automaticamente antes
   de salvar.
3. **Given** um veículo com um abastecimento registrado, **When** o motorista registra um segundo
   abastecimento de tanque cheio com quilometragem maior, **Then** o painel passa a exibir a média
   de consumo, o custo por quilômetro e o total gasto.
4. **Given** o campo de quilometragem do abastecimento, **When** o motorista informa um valor menor
   ou igual à quilometragem do último abastecimento do veículo, **Then** o sistema recusa o
   registro e explica o motivo.
5. **Given** um abastecimento marcado como parcial (tanque não cheio), **When** ele é salvo,
   **Then** seu valor entra no total gasto mas não é usado no cálculo da média.

---

### User Story 2 - Acompanhar histórico e evolução do consumo (Priority: P2)

O motorista abre o painel do veículo e vê a média atual, o custo por quilômetro, o total gasto e um
gráfico com o consumo dos últimos abastecimentos. Ele acessa o histórico completo, confere cada
abastecimento com litros, preço por litro, consumo do trecho e total pago, e remove lançamentos
digitados errado.

**Why this priority**: transforma o registro em informação útil e permite corrigir erros de
digitação, que são frequentes no contexto de uso (dentro do carro, com pressa).

**Independent Test**: com três ou mais abastecimentos registrados, verificar que o gráfico mostra um
ponto por trecho calculado, que o histórico lista todos os lançamentos em ordem e que excluir um
lançamento recalcula média, total gasto e gráfico.

**Acceptance Scenarios**:

1. **Given** um veículo com quatro abastecimentos, **When** o motorista abre o painel, **Then** vê
   a média, o custo por km, o total gasto, os litros acumulados e o gráfico de consumo por trecho.
2. **Given** menos de dois abastecimentos de tanque cheio, **When** o painel é aberto, **Then** o
   sistema exibe uma mensagem orientando registrar mais abastecimentos em vez de um gráfico vazio.
3. **Given** o histórico aberto, **When** o motorista exclui um abastecimento e confirma, **Then**
   o lançamento some e todos os indicadores derivados são recalculados imediatamente.
4. **Given** mais de um veículo cadastrado, **When** o motorista troca o veículo selecionado,
   **Then** painel, gráfico e histórico passam a refletir apenas o veículo escolhido.

---

### User Story 3 - Decidir onde e com o que abastecer (Priority: P3)

O motorista anota os preços de gasolina, etanol e diesel dos postos que frequenta e vê rapidamente
qual está mais barato. Na tela de comparativo, informa os preços de gasolina e etanol e descobre
qual compensa, considerando o rendimento real do próprio veículo em vez da regra fixa dos 70%.

**Why this priority**: valor complementar de economia; depende de dados que só existem depois das
histórias P1 e P2, mas funciona de forma autônoma com preços digitados manualmente.

**Independent Test**: cadastrar três postos com preços diferentes e verificar que o de gasolina mais
barata recebe o destaque; informar preços no comparativo e verificar a recomendação e o custo por
quilômetro de cada combustível.

**Acceptance Scenarios**:

1. **Given** a tela de postos, **When** o motorista salva um posto com preços de gasolina, etanol e
   diesel, **Then** o posto aparece na lista com os preços e a indicação de quando foi atualizado.
2. **Given** três postos cadastrados com preços de gasolina diferentes, **When** a lista é exibida,
   **Then** apenas o posto com a gasolina mais barata recebe o selo de destaque.
3. **Given** um posto já cadastrado, **When** o motorista atualiza seus preços, **Then** os novos
   valores substituem os anteriores e a data de atualização muda.
4. **Given** preço de etanol correspondente a menos que o fator de rendimento configurado em relação
   à gasolina, **When** o comparativo é calculado, **Then** o etanol é indicado como mais vantajoso,
   com a proporção percentual e o custo por quilômetro de cada opção.
5. **Given** um dos preços do comparativo em branco, **When** o resultado é exibido, **Then** o
   sistema informa que faltam dados em vez de apresentar uma recomendação.

---

### User Story 4 - Ajustar o app ao gosto e ao contexto (Priority: P4)

O motorista alterna entre tema claro e escuro conforme a luz do ambiente e escolhe a unidade em que
a média é exibida (km/L ou L/100km). As preferências permanecem válidas nas próximas visitas.

**Why this priority**: melhora conforto e adequação regional, mas nenhum dado essencial depende
disso.

**Independent Test**: alternar tema e unidade, recarregar o app e verificar que as escolhas foram
mantidas e que todos os números de consumo foram convertidos coerentemente.

**Acceptance Scenarios**:

1. **Given** o app em tema claro, **When** o motorista aciona a alternância de tema, **Then** toda a
   interface muda para o tema escuro sem recarregar a página e a escolha persiste.
2. **Given** a unidade km/L selecionada, **When** o motorista troca para L/100km, **Then** todas as
   médias e o gráfico passam a ser exibidos na nova unidade com o rótulo correspondente.

---

### Edge Cases

- Veículo recém-cadastrado sem nenhum abastecimento: média, custo por km e gráfico exibem estado
  vazio explicativo, nunca zero ou erro.
- Apenas um abastecimento registrado: não há trecho percorrido, portanto não há média; o total gasto
  já é exibido.
- Quilometragem informada menor ou igual à do último abastecimento do veículo: registro recusado com
  mensagem clara.
- Litros ou valor total iguais a zero, negativos ou não numéricos: registro recusado com mensagem no
  campo correspondente.
- Data de abastecimento no futuro: registro recusado.
- Veículo excluído com abastecimentos vinculados: os abastecimentos vinculados são removidos junto,
  após confirmação explícita que informa a quantidade afetada.
- Valores digitados no padrão brasileiro ("32,4", "1.248,50"): interpretados corretamente.
- Consumo absurdo em um trecho (por exemplo, acima de 100 km/L ou abaixo de 1 km/L): o lançamento é
  aceito, mas sinalizado visualmente como possível erro de digitação.
- Nome de posto repetido: reconhecido como o mesmo posto e atualizado, sem criar duplicata.
- Placa ausente ou incompleta: permitida; o veículo é exibido com indicação de placa não informada.
- Comparativo com fator de rendimento zerado ou inválido: usa o padrão de 70% e informa isso.

## Requirements *(mandatory)*

### Functional Requirements

**Veículos**

- **FR-001**: O sistema MUST permitir cadastrar um veículo com tipo (carro ou moto), marca, modelo,
  ano, placa, cor, combustível principal, quilometragem atual e apelido opcional.
- **FR-002**: O sistema MUST exigir ao menos o modelo para salvar um veículo; os demais campos são
  opcionais.
- **FR-003**: O sistema MUST listar todos os veículos cadastrados exibindo identificação, cor,
  placa, média de consumo atual e odômetro.
- **FR-004**: Usuários MUST poder editar e excluir um veículo, com confirmação explícita na
  exclusão informando quantos abastecimentos serão removidos junto.
- **FR-005**: O sistema MUST identificar o veículo pelo apelido quando informado e, na ausência
  dele, por marca e modelo.

**Abastecimentos**

- **FR-006**: O sistema MUST permitir registrar um abastecimento com veículo, data, quilometragem do
  painel, litros, valor total pago, combustível, posto e indicação de tanque cheio.
- **FR-007**: O sistema MUST calcular e exibir o preço por litro a partir de valor total ÷ litros
  enquanto o formulário é preenchido, antes de salvar.
- **FR-008**: O sistema MUST exibir, durante o preenchimento, a distância percorrida desde o último
  abastecimento do veículo selecionado.
- **FR-009**: O sistema MUST rejeitar abastecimento cuja quilometragem não seja maior que a do
  último abastecimento registrado para o mesmo veículo.
- **FR-010**: O sistema MUST rejeitar litros ou valor total menores ou iguais a zero e datas
  futuras.
- **FR-011**: O sistema MUST aceitar números no formato brasileiro, com vírgula decimal e ponto como
  separador de milhar.
- **FR-012**: O sistema MUST listar o histórico de abastecimentos do veículo selecionado em ordem
  cronológica decrescente, com data, posto, combustível, quilometragem, litros, preço por litro,
  consumo do trecho e total pago.
- **FR-013**: Usuários MUST poder excluir um abastecimento do histórico, com recálculo imediato de
  todos os indicadores derivados.
- **FR-014**: O sistema MUST sugerir os postos já utilizados ao preencher o campo de posto.

**Cálculos**

- **FR-015**: O sistema MUST calcular o consumo de um trecho como (quilometragem do abastecimento −
  quilometragem do abastecimento anterior) ÷ litros do abastecimento atual, considerando apenas
  abastecimentos de tanque cheio.
- **FR-016**: O sistema MUST calcular a média do veículo como a soma das distâncias dos trechos
  válidos dividida pela soma dos litros desses trechos, e não como média aritmética dos consumos.
- **FR-017**: O sistema MUST excluir abastecimentos parciais do cálculo de média, mantendo-os no
  total gasto e no total de litros.
- **FR-018**: O sistema MUST calcular o custo por quilômetro como o último preço por litro dividido
  pela média de consumo do veículo.
- **FR-019**: O sistema MUST apresentar total gasto e total de litros acumulados por veículo.
- **FR-020**: O sistema MUST indicar a tendência do consumo comparando o trecho mais recente com o
  anterior.
- **FR-021**: O sistema MUST converter a média entre km/L e L/100km conforme a unidade escolhida,
  em todas as telas.

**Painel e gráfico**

- **FR-022**: O sistema MUST exibir um painel por veículo com média de consumo, custo por
  quilômetro, total gasto e os abastecimentos mais recentes.
- **FR-023**: O sistema MUST exibir um gráfico com o consumo dos últimos trechos calculados
  (mínimo os seis mais recentes).
- **FR-024**: O sistema MUST exibir mensagem orientativa quando não houver trechos suficientes para
  o gráfico.
- **FR-025**: Usuários MUST poder alternar o veículo em foco a partir do painel, do histórico e do
  formulário de abastecimento.

**Postos e comparativo**

- **FR-026**: O sistema MUST permitir registrar e atualizar preços de gasolina, etanol e diesel por
  posto, guardando quando foi atualizado.
- **FR-027**: O sistema MUST destacar o posto com o menor preço de gasolina entre os cadastrados.
- **FR-028**: O sistema MUST tratar posto de mesmo nome como atualização do registro existente.
- **FR-029**: O sistema MUST comparar etanol e gasolina a partir dos preços informados e de um fator
  de rendimento configurável, com padrão de 0,70.
- **FR-030**: O sistema MUST apresentar no comparativo o combustível recomendado, a proporção
  percentual entre os preços e o custo por quilômetro estimado de cada combustível, usando a média
  real do veículo selecionado quando existir.
- **FR-031**: O sistema MUST informar explicitamente quando faltarem dados para o comparativo, em
  vez de apresentar recomendação.

**Preferências e persistência**

- **FR-032**: Usuários MUST poder alternar entre tema claro e escuro a qualquer momento, sem
  recarregar a página.
- **FR-033**: Usuários MUST poder escolher a unidade de consumo entre km/L e L/100km.
- **FR-034**: O sistema MUST persistir veículos, abastecimentos, postos e preferências entre
  sessões e entre reinícios da aplicação.
- **FR-035**: O sistema MUST confirmar visualmente cada operação de gravação e exclusão bem
  sucedida.
- **FR-036**: O sistema MUST permitir carregar um conjunto de dados de demonstração e restaurá-lo,
  para avaliação do app sem digitação inicial.

**Interface**

- **FR-037**: Toda a interface MUST estar em português do Brasil, com números, moeda e datas
  formatados no padrão brasileiro.
- **FR-038**: A interface MUST ser utilizável em telas a partir de 320 px de largura, com alvos de
  toque adequados ao uso com uma mão.
- **FR-039**: Todo controle interativo MUST ser operável por teclado e ter nome acessível.
- **FR-040**: O sistema MUST manter a navegação entre as sete áreas (veículos, painel, abastecer,
  histórico, postos, comparativo, ajustes) sempre acessível a partir do topo.

### Key Entities

- **Veículo**: unidade que consome combustível. Tipo (carro/moto), marca, modelo, ano, placa, cor,
  combustível principal, apelido, quilometragem inicial. Possui muitos abastecimentos.
- **Abastecimento**: evento de compra de combustível para um veículo. Data, quilometragem do painel,
  litros, valor total, combustível, posto, indicador de tanque cheio. Pertence a um veículo.
- **Trecho de consumo**: resultado derivado de dois abastecimentos consecutivos de tanque cheio;
  distância percorrida e consumo. Não é digitado, é sempre calculado.
- **Posto**: local de abastecimento com nome e preços correntes de gasolina, etanol e diesel, com
  data de atualização.
- **Preferências**: tema (claro/escuro) e unidade de consumo (km/L ou L/100km) do usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um motorista consegue cadastrar seu primeiro veículo em até 60 segundos, informando
  apenas os campos obrigatórios.
- **SC-002**: Um abastecimento completo é registrado em até 30 segundos a partir da abertura do app.
- **SC-003**: Após dois abastecimentos de tanque cheio, a média exibida corresponde exatamente ao
  cálculo manual do usuário, com diferença de no máximo 0,1 na unidade escolhida.
- **SC-004**: Qualquer alteração de dado (registro ou exclusão) reflete nos indicadores em menos de
  1 segundo, sem exigir recarga manual da página.
- **SC-005**: Todas as telas ficam utilizáveis em telas de 320 px sem rolagem horizontal.
- **SC-006**: A primeira tela útil é apresentada em até 2 segundos em conexão móvel típica.
- **SC-007**: 100% das entradas inválidas descritas nos casos de borda produzem mensagem explicativa
  no campo correspondente, sem perda dos demais dados já digitados.
- **SC-008**: Nenhum dado registrado é perdido após fechar e reabrir o navegador ou reiniciar a
  aplicação.
- **SC-009**: Toda a navegação principal é alcançável apenas com teclado.

## Assumptions

- Uso pessoal em instância única, sem cadastro de contas ou login nesta versão; a introdução de
  múltiplos usuários acompanhará a futura migração de armazenamento.
- Os dados ficam armazenados no servidor da aplicação, o que permite acessá-los de qualquer
  navegador que alcance essa instância.
- O conjunto de combustíveis oferecido é: gasolina comum, gasolina aditivada, etanol, diesel, GNV e
  elétrico, conforme o modelo de layout de referência.
- Moeda única (real brasileiro) e fuso horário local; não há conversão cambial.
- A precisão do consumo depende do usuário registrar tanque cheio; abastecimentos parciais são
  aceitos, mas declaradamente não entram na média.
- O layout, a paleta e a tipografia seguem `design-model/Litro.dc.html`, incluindo os temas claro e
  escuro ali definidos.
- Não há integração com APIs externas de preço de combustível, geolocalização ou OCR de nota fiscal
  nesta versão.
- Não há exportação de relatórios (CSV/PDF) nesta versão.
- O app é usado majoritariamente em celular, mas deve funcionar igualmente bem em desktop.
