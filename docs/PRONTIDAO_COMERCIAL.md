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
- CNAEs adicionais confirmados: **6202-3/00, 6204-0/00, 6209-1/00 e 6311-9/00**;
- e-mail: **verolabso@gmail.com**;
- mercado pretendido: **pessoas físicas e jurídicas**.
- regime tributário: **Simples Nacional**;
- inscrição municipal: **ativa**;
- emissão de NFS-e: **já operacional e realizada manualmente**.
- prazo de emissão da NFS-e: **no mesmo dia da confirmação do pagamento**.
- conjunto fiscal mínimo definido: **nome ou razão social, CPF/CNPJ, e-mail, telefone e endereço completo com CEP**; para pessoa jurídica, inscrição municipal/estadual somente quando aplicável.

Pendência operacional residual: conferir no WebISS eventuais campos adicionais obrigatórios do tomador no momento da implementação.

**Critério de aceite:** checkout, rodapé, documentos e notas usam a mesma identificação oficial.

### Passo 2 — Cancelamento e reembolso

**Resultado:** política comercial aprovada, escrita antes de programar o fluxo.

- [x] Definir quando o cancelamento produz efeito.
- [x] Definir acesso até o fim do período pago.
- [x] Definir tratamento do direito de arrependimento.
- [x] Definir reembolso total, parcial, duplicidade e cobrança indevida.
- [x] Definir prazo e canal de resposta.
- [x] Definir consequência de chargeback e fraude.

Decisões já aprovadas:

- o pedido de cancelamento interrompe imediatamente a renovação automática;
- o acesso permanece ativo até o fim do período já pago;
- não haverá reembolso proporcional após o prazo de arrependimento, exceto em cobrança duplicada, indevida ou outra hipótese obrigatória.
- o cliente poderá exercer o direito de arrependimento em até **7 dias corridos após a contratação inicial**;
- o arrependimento válido resultará em estorno integral e encerramento do acesso após a confirmação do reembolso;
- inicialmente, a solicitação será recebida pelo suporte e posteriormente também pela área autenticada da conta.
- o recebimento será confirmado imediatamente ou em até **1 dia útil**;
- a análise e o início do estorno válido ocorrerão em até **2 dias úteis**;
- a efetiva disponibilização do crédito seguirá o prazo da Stripe, do banco ou do emissor do cartão.
- pagamento revertido, contestado ou identificado como fraudulento poderá suspender o acesso;
- o cliente será notificado e poderá esclarecer ou regularizar o pagamento;
- a conta não será excluída automaticamente apenas pela existência de contestação.
- cobrança comprovadamente duplicada ou indevida será estornada integralmente;
- quando outra cobrança válida sustentar a assinatura, o estorno da duplicidade não encerrará o acesso.

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

Decisão já aprovada:

- cada assinatura permite **um operador utilizando o acesso por vez**;
- uso simultâneo ou compartilhamento concorrente do mesmo acesso não será permitido.
- não haverá limite fixo de dispositivos cadastrados ou computadores com OBS;
- o operador poderá alternar livremente entre dispositivos, mantendo somente uma sessão operacional ativa por vez.
- a contratação será permitida para pessoa com **18 anos ou mais** ou representante autorizado de pessoa jurídica;
- menores poderão utilizar o produto somente sob autorização e responsabilidade de responsável legal.
- o produto requer OBS Studio com WebSocket habilitado e OBS Control Server no computador principal;
- o controle exige navegador moderno e conexão pela mesma rede local confiável ou VPN privada;
- recursos PTZ exigem câmera compatível com VISCA over IP;
- o cliente é responsável pela configuração da rede, firewall, equipamentos e credenciais;
- alterações em componentes de terceiros poderão afetar a compatibilidade.
- serão proibidos compartilhamento simultâneo, revenda não autorizada, burla de autenticação ou assinatura, acesso indevido, uso ilegal, exploração não autorizada do código, ataques, automação abusiva e exposição insegura deliberada de credenciais ou portas;
- violações poderão gerar orientação, aviso, suspensão preventiva ou encerramento proporcional à gravidade e reincidência.
- não haverá SLA formal de uptime no lançamento inicial;
- a VEROLAB empregará esforços razoáveis para manter os serviços disponíveis e corrigir falhas;
- manutenções planejadas relevantes serão comunicadas quando possível;
- indisponibilidades poderão decorrer da internet, rede local, OBS, Firebase, Stripe e demais terceiros;
- o suporte será prestado por `verolabso@gmail.com`, com resposta inicial em até **2 dias úteis**.
- a VEROLAB será identificada como titular do código, interface, documentação, identidade visual e demais componentes próprios;
- a assinatura concederá licença limitada de uso durante sua vigência, sem transferência de propriedade;
- marcas e tecnologias de terceiros permanecerão pertencentes aos respectivos titulares, sem implicar afiliação ou patrocínio.
- o operador deverá conferir o estado real de cenas, fontes, gravação, transmissão, enquadramento e equipamentos antes e depois de comandos críticos;
- o produto não garantirá continuidade de transmissão, gravação, internet, energia, rede ou funcionamento de terceiros;
- a VEROLAB permanecerá responsável nos limites obrigatórios da legislação.
- reajustes serão comunicados com pelo menos **30 dias de antecedência**;
- o novo valor será aplicado somente na renovação seguinte, permitindo cancelamento antes da cobrança.
- mudanças relevantes nos Termos serão comunicadas com pelo menos **15 dias de antecedência**;
- alterações urgentes por exigência legal ou segurança poderão ter efeito imediato, com comunicação assim que possível;
- mudanças que exijam consentimento solicitarão novo aceite versionado.
- os Termos serão regidos pelas leis brasileiras;
- relações empresariais indicarão o foro de Palmas/TO;
- relações de consumo preservarão o foro e os direitos legalmente assegurados ao consumidor.
- haverá teste gratuito de **2 dias corridos**, com primeira cobrança no **3º dia**;
- o checkout mostrará a data exata da primeira cobrança;
- o cancelamento antes do fim do teste impedirá qualquer cobrança.
- o método de pagamento será informado no início do teste;
- haverá somente um teste por cliente, controlado por conta, CPF/CNPJ e identificador do cliente Stripe;
- depois de utilizado ou cancelado o teste, uma nova assinatura terá cobrança imediata.

**Critério de aceite:** texto aprovado por advogado e publicado em URL estável.

### Passo 4 — Política de Privacidade

**Resultado:** inventário de dados e política aderente ao processamento real.

- [ ] Mapear dados, finalidade, base legal e retenção.
- [x] Mapear inicialmente Firebase, Stripe, Google Cloud e demais operadores conhecidos.
- [ ] Documentar transferências internacionais.
- [x] Definir canal de atendimento aos titulares: `verolabso@gmail.com`.
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

