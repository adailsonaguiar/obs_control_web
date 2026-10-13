# Especificação de prontidão comercial

## Objetivo

Preparar o OBS Stream Tools para vender assinaturas no Brasil com informações comerciais claras, documentação jurídica, proteção de dados, cancelamento e controles técnicos compatíveis com o modelo de cobrança recorrente.

Esta especificação organiza o trabalho. Ela não substitui a validação de advogado e contador.

## Estado atual

Já existe:

- autenticação por e-mail e senha com Firebase Authentication;
- planos mensal (`R$ 20/mês`) e anual (`R$ 200/ano`);
- criação de Stripe Checkout por backend;
- webhook Stripe com validação de assinatura;
- entitlement persistido no Firestore;
- proteção visual das rotas `/deck` e `/ptz`;
- comunicação do navegador com o servidor local do OBS.

Ainda falta para ativar o checkout:

- identificação jurídica e fiscal do fornecedor;
- regras aprovadas de cancelamento, renovação e reembolso;
- Termos de Uso e Política de Privacidade;
- aceite versionado dos documentos;
- canal formal de suporte e privacidade;
- autosserviço de cancelamento;
- auditoria final de segurança e proteção das APIs;
- revisão profissional jurídica e contábil.

## Plano em passos curtos

### Passo 1 — Empresa e operação fiscal

**Resultado:** ficha oficial do fornecedor e procedimento de emissão fiscal.

- [ ] Definir razão social, nome fantasia, CNPJ e endereço comercial.
- [ ] Validar CNAE, regime tributário, incidência de ISS e tipo de nota com contador.
- [ ] Definir emissor de NFS-e e momento da emissão.
- [ ] Definir dados que Stripe e sistema fiscal precisam compartilhar.
- [ ] Registrar responsável interno pela operação fiscal.

Dados já fornecidos:

- fornecedor: **VEROLAB SOLUCOES EM TECNOLOGIA LTDA - ME**;
- nome fantasia: **VEROLAB**;
- CNPJ: **64.491.841/0001-21**;
- sede: **QD ARSO 101 AL 12 QI 08 LT 07 A 7A, Plano Diretor Sul, CEP 77018-410, Palmas/TO**;
- CNAE principal informado: **6201-5/01 — Desenvolvimento de programas de computador sob encomenda**;
- e-mail: **verolabso@gmail.com**;
- mercado pretendido: **pessoas físicas e jurídicas**.
- regime tributário: **Simples Nacional**;
- inscrição municipal: **ativa**;
- emissão de NFS-e: **já operacional e realizada manualmente**.
- prazo de emissão da NFS-e: **no mesmo dia da confirmação do pagamento**.
- conjunto fiscal mínimo proposto: **nome ou razão social, CPF/CNPJ, e-mail, telefone e endereço completo com CEP**; para pessoa jurídica, inscrição municipal/estadual quando aplicável.

Pendências contábeis e operacionais: confirmar se o CNAE principal atual é suficiente para assinatura/licenciamento de software próprio, se serão necessários CNAEs secundários e validar com o contador e no WebISS os campos obrigatórios do tomador.

**Critério de aceite:** checkout, rodapé, documentos e notas usam a mesma identificação oficial.

### Passo 2 — Cancelamento e reembolso

**Resultado:** política comercial aprovada, escrita antes de programar o fluxo.

- [ ] Definir quando o cancelamento produz efeito.
- [ ] Definir acesso até o fim do período pago.
- [ ] Definir tratamento do direito de arrependimento.
- [ ] Definir reembolso total, parcial, duplicidade e cobrança indevida.
- [ ] Definir prazo e canal de resposta.
- [ ] Definir consequência de chargeback e fraude.

**Critério de aceite:** toda situação comum possui regra clara, operacionalizável e validada juridicamente.

### Passo 3 — Termos de Uso

**Resultado:** contrato público, versionado e compatível com o produto.

- [ ] Escopo da licença e da assinatura.
- [ ] Requisitos técnicos e compatibilidade.
- [ ] Condutas proibidas.
- [ ] Disponibilidade, manutenção e suporte.
- [ ] Propriedade intelectual.
- [ ] Responsabilidades sobre OBS, câmeras, rede e transmissão.
- [ ] Cobrança, renovação, cancelamento e suspensão.
- [ ] Lei aplicável, atendimento e alterações do documento.

**Critério de aceite:** texto aprovado por advogado e publicado em URL estável.

### Passo 4 — Política de Privacidade

**Resultado:** inventário de dados e política aderente ao processamento real.

- [ ] Mapear dados, finalidade, base legal e retenção.
- [ ] Mapear Firebase, Stripe, Google Cloud e demais operadores.
- [ ] Documentar transferências internacionais.
- [ ] Documentar direitos do titular e canal de atendimento.
- [ ] Definir exclusão de conta e retenções obrigatórias.
- [ ] Documentar cookies, local storage e analytics.

**Critério de aceite:** a política descreve o sistema real e nenhum dado é coletado sem finalidade registrada.

### Passo 5 — Política de Cancelamento e Reembolso

**Resultado:** versão pública e resumida das decisões do Passo 2.

- [ ] Publicar rota própria.
- [ ] Vincular no checkout, rodapé, FAQ e área da conta.
- [ ] Incluir instruções práticas e prazos.

**Critério de aceite:** o cliente entende como cancelar ou solicitar análise sem precisar comprar primeiro.

### Passo 6 — Identificação do fornecedor

**Resultado:** identificação consistente em todas as superfícies comerciais.

- [ ] Rodapé da landing page.
- [ ] Página de assinatura e resumo pré-contratual.
- [ ] E-mails transacionais e recibos sob controle da empresa.
- [ ] Páginas jurídicas e canal de suporte.

**Critério de aceite:** razão social, CNPJ, endereço e contato são fáceis de localizar.

### Passo 7 — Aceite versionado

**Resultado:** evidência do documento aceito antes da criação da assinatura.

- [ ] Checkbox não pré-marcado no checkout.
- [ ] Links para os documentos vigentes.
- [ ] Registrar UID, versões, instante e contexto mínimo necessário.
- [ ] Bloquear checkout sem aceite.
- [ ] Definir quando uma alteração exige novo aceite.

**Critério de aceite:** é possível demonstrar qual versão cada usuário aceitou sem registrar dados excessivos.

### Passo 8 — Suporte e LGPD

**Resultado:** canais públicos com processo interno de resposta.

- [ ] Definir e-mail de suporte.
- [ ] Definir canal de privacidade/LGPD.
- [ ] Criar categorias e prazos internos.
- [ ] Criar procedimento para acesso, correção, exclusão e oposição.
- [ ] Criar procedimento para incidentes de segurança.

**Critério de aceite:** solicitações recebem protocolo, responsável e conclusão registrada.

### Passo 9 — Cancelamento da assinatura

**Resultado:** autosserviço autenticado.

- [ ] Disponibilizar gerenciamento da assinatura na área do cliente.
- [ ] Preferir Stripe Customer Portal ou endpoint equivalente seguro.
- [ ] Mostrar data final de acesso e estado da renovação.
- [ ] Atualizar entitlement por webhook.
- [ ] Tratar falha de pagamento, reativação e cancelamento agendado.

**Critério de aceite:** o cliente cancela sem contato manual e o acesso acompanha o estado confirmado pela Stripe.

### Passo 10 — Revisão de segurança

**Resultado:** relatório de riscos, correções e evidências de teste.

- [ ] Firebase Auth e regras do Firestore.
- [ ] Stripe Checkout, portal e assinatura de webhook.
- [ ] CORS, rate limiting, logs e segredos.
- [ ] Idempotência e repetição de eventos.
- [ ] Autorização nas APIs que executam comandos.
- [ ] Proteção do token local do OBS.
- [ ] Retenção e minimização de dados.
- [ ] Dependências e resposta a incidentes.

**Critério de aceite:** nenhuma autorização depende apenas da interface React e nenhum segredo chega ao bundle público.

### Passo 11 — Revisão jurídica

**Resultado:** parecer ou aprovação registrada para os documentos e fluxos.

- [ ] Direito do consumidor e comércio eletrônico.
- [ ] LGPD e contratos com operadores.
- [ ] Limitação de responsabilidade.
- [ ] Assinatura recorrente, reembolso e comunicação comercial.

**Critério de aceite:** pendências do advogado foram resolvidas antes da produção.

### Passo 12 — Marca e software

**Resultado:** decisão documentada sobre proteção de propriedade intelectual.

- [ ] Busca de anterioridade da marca.
- [ ] Definir titular e classes de registro.
- [ ] Avaliar depósito de marca no INPI.
- [ ] Avaliar registro do programa de computador.
- [ ] Confirmar cessão de direitos de colaboradores e fornecedores.

**Critério de aceite:** titularidade e estratégia de registro estão formalmente definidas.

## Ordem de liberação

1. Concluir decisões dos Passos 1 e 2.
2. Redigir Passos 3, 4 e 5.
3. Implementar Passos 6, 7, 8 e 9.
4. Auditar o Passo 10.
5. Obter validações dos Passos 11 e 12.
6. Ativar o checkout somente depois da lista de bloqueadores estar vazia.

## Bloqueadores de lançamento

- dados oficiais do fornecedor ausentes;
- políticas de cancelamento e reembolso não aprovadas;
- documentos jurídicos não publicados;
- checkout sem aceite versionado;
- inexistência de cancelamento autenticado;
- APIs de comando sem autorização e entitlement no servidor;
- ausência de canal de suporte e privacidade;
- impossibilidade de emitir documento fiscal quando exigido.

## Referências oficiais iniciais

- [Código de Defesa do Consumidor](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm)
- [Decreto nº 7.962/2013 — comércio eletrônico](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm)
- [Lei Geral de Proteção de Dados](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [Regulamento da ANPD para agentes de pequeno porte](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)
- [REDESIM](https://www.gov.br/empresas-e-negocios/pt-br/redesim)
- [Registro de programa de computador no INPI](https://www.gov.br/inpi/pt-br/servicos/programas-de-computador/guia-completo-de-programa-de-computador)

