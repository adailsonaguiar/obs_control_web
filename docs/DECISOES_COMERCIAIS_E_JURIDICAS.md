# Registro de decisões comerciais e jurídicas

Este arquivo é a fonte de verdade das decisões que alimentam documentos, checkout e implementação. Itens marcados como `PENDENTE` não devem ser transformados em promessa pública.

## Produto e cobrança

| Campo | Estado atual |
| --- | --- |
| Produto | OBS Stream Tools |
| Ferramentas incluídas | OBS Deck e Controle PTZ |
| Plano mensal | R$ 20 por mês |
| Plano anual | R$ 200 por ano |
| Renovação | Recorrente — sujeita a confirmação formal |
| Teste gratuito | 2 dias corridos sem cobrança; primeira cobrança no 3º dia se não houver cancelamento |
| Processador | Stripe |
| Autenticação | Firebase Authentication por e-mail e senha |
| Mercado inicial | Brasil |
| Moeda | BRL |
| Público | Pessoas físicas e jurídicas ligadas a produção audiovisual e tecnologia |

## Identificação do fornecedor

| Campo | Decisão |
| --- | --- |
| Razão social | VEROLAB SOLUCOES EM TECNOLOGIA LTDA - ME |
| Nome fantasia | VEROLAB |
| CNPJ | 64.491.841/0001-21 |
| Endereço comercial | QD ARSO 101 AL 12 QI 08 LT 07 A 7A, Plano Diretor Sul, CEP 77018-410 |
| Município/UF | Palmas/TO |
| E-mail de suporte | `verolabso@gmail.com` |
| E-mail de privacidade/LGPD | PENDENTE |
| Telefone ou canal alternativo | PENDENTE |
| Responsável pelo atendimento | PENDENTE |

## Operação fiscal

| Campo | Decisão |
| --- | --- |
| CNAE principal | 6201-5/01 — Desenvolvimento de programas de computador sob encomenda |
| CNAEs adicionais informados | 6202-3/00, 6204-0/00, 6209-1/00 e 6311-9/00 |
| Validação de CNAE | Código `6202-3/00` confirmado pelo responsável do produto para desenvolvimento e licenciamento de programas customizáveis |
| Regime tributário | Simples Nacional |
| Inscrição municipal | Ativa — número PENDENTE de registro |
| Emissor de NFS-e | Emissão manual pelo processo já utilizado pela empresa |
| Momento de emissão | Manualmente, no mesmo dia da confirmação do pagamento |
| Dados fiscais de pessoa física | Definido: nome completo, CPF, e-mail, telefone e endereço completo com CEP |
| Dados fiscais de pessoa jurídica | Definido: razão social, CNPJ, e-mail, telefone e endereço completo com CEP; inscrição municipal/estadual somente quando aplicável |
| Validação fiscal | Conjunto mínimo aprovado pelo responsável do produto; confirmar apenas eventuais exigências adicionais do WebISS/contador antes de implementar |

## Cancelamento e reembolso

| Campo | Decisão |
| --- | --- |
| Canal de cancelamento | Proposto: autosserviço autenticado pelo Stripe Customer Portal |
| Efeito do cancelamento | A solicitação interrompe imediatamente a renovação automática |
| Acesso após cancelamento | Mantido até o fim do período já pago |
| Direito de arrependimento | Até 7 dias corridos após a contratação inicial, com estorno integral e encerramento do acesso após confirmação do reembolso |
| Reembolso mensal | Sem reembolso proporcional após o prazo de arrependimento, salvo cobrança duplicada, indevida ou obrigação legal |
| Reembolso anual | Sem reembolso proporcional após o prazo de arrependimento, salvo cobrança duplicada, indevida ou obrigação legal |
| Cobrança duplicada/indevida | Estorno integral após comprovação, sem encerrar o acesso quando outra cobrança válida sustentar a assinatura |
| Prazo de resposta | Confirmação imediata ou em até 1 dia útil; análise e início de estorno válido em até 2 dias úteis |
| Prazo para crédito do estorno | Depende da Stripe, do banco e do emissor do cartão; não é controlado pela VEROLAB |
| Chargeback e fraude | Pagamento revertido, contestado ou identificado como fraudulento pode suspender o acesso; cliente é notificado e pode esclarecer ou regularizar; conta não é excluída automaticamente apenas pela contestação |
| Canal inicial para arrependimento | Suporte; futuramente também pela área autenticada da conta |

## Privacidade e dados

| Campo | Decisão |
| --- | --- |
| Controlador dos dados | PENDENTE — deve ser a entidade fornecedora |
| Operadores conhecidos | Google/Firebase, Google Cloud e Stripe |
| Analytics e marketing | PENDENTE |
| Canal para direitos do titular | PENDENTE |
| Retenção da conta | PENDENTE |
| Retenção de dados de assinatura/fiscais | PENDENTE |
| Exclusão de conta | PENDENTE |
| Público menor de idade | PENDENTE: definir restrição etária ou fluxo adequado |

## Propriedade intelectual e terceiros

| Campo | Decisão |
| --- | --- |
| Titular da marca | PENDENTE |
| Titular dos elementos próprios | VEROLAB: código, interface, documentação, identidade visual e demais componentes próprios do OBS Stream Tools |
| Licença concedida | Limitada ao uso durante o período ativo da assinatura, sem transferência de propriedade |
| Pedido de marca | PENDENTE |
| Registro do software | PENDENTE |
| Relação com terceiros | OBS Studio, Stripe, Firebase e demais marcas ou tecnologias pertencem aos respectivos titulares; uso não implica afiliação ou patrocínio |
| Licenças de dependências | PENDENTE de inventário |

## Licença de uso e contas

| Campo | Decisão |
| --- | --- |
| Concorrência de uso | Uma assinatura permite um operador utilizando o acesso por vez |
| Compartilhamento simultâneo | Não permitido |
| Quantidade de dispositivos cadastrados | Sem limite fixo, sujeita a controles razoáveis de segurança e abuso |
| Quantidade de computadores/servidores OBS | Sem limite fixo |
| Alternância entre dispositivos | Permitida livremente, mantendo somente uma sessão operacional ativa por vez |
| Contratação | Permitida para pessoa com 18 anos ou mais ou representante autorizado de pessoa jurídica |
| Uso por menores | Somente sob autorização e responsabilidade de responsável legal |

## Requisitos técnicos e compatibilidade

| Campo | Decisão |
| --- | --- |
| OBS | OBS Studio com WebSocket habilitado |
| Aplicativo local | OBS Control Server instalado no computador principal |
| Dispositivo de controle | Navegador moderno em celular, tablet ou computador |
| Rede | Mesma rede local confiável ou VPN privada |
| PTZ | Câmera compatível com VISCA over IP |
| Responsabilidade do cliente | Configurar e manter rede, firewall, equipamentos e credenciais |
| Componentes de terceiros | Alterações no OBS Studio, navegadores, sistemas operacionais, câmeras ou firmwares podem afetar compatibilidade |

## Condutas proibidas

- compartilhar a conta para uso simultâneo;
- revender, sublicenciar ou disponibilizar o acesso sem autorização da VEROLAB;
- burlar autenticação, assinatura, entitlement ou limites de uso;
- acessar contas, servidores, câmeras ou redes de terceiros sem autorização;
- utilizar o produto para atividade ilegal ou violação de direitos de terceiros;
- copiar, modificar, realizar engenharia reversa ou explorar o código fora das permissões legais;
- realizar ataques, automação abusiva ou ações prejudiciais à disponibilidade e segurança;
- expor deliberadamente portas ou credenciais do servidor de forma insegura.

As medidas aplicadas devem ser proporcionais: orientação ou aviso quando cabível, suspensão preventiva para proteção e encerramento em violações graves ou reiteradas, preservados os direitos legais do cliente.

## Disponibilidade e suporte

| Campo | Decisão |
| --- | --- |
| SLA | Não haverá garantia formal de uptime no lançamento inicial |
| Compromisso operacional | Empregar esforços razoáveis para disponibilidade e correção de falhas |
| Manutenções | Permitidas; manutenções planejadas relevantes serão comunicadas quando possível |
| Dependências externas | Internet, rede local, OBS, Firebase, Stripe e outros terceiros podem causar indisponibilidade |
| Canal de suporte | `verolabso@gmail.com` |
| Prazo de resposta inicial | Até 2 dias úteis |

## Responsabilidade operacional

- o operador deve conferir cenas, fontes, gravação, transmissão, enquadramento e estado real dos equipamentos antes e depois de comandos críticos;
- o produto auxilia a operação, mas não garante continuidade de transmissão, gravação, internet, energia, rede ou equipamentos e serviços de terceiros;
- a VEROLAB permanece responsável nos limites obrigatórios da legislação e não exclui responsabilidades que legalmente não possam ser afastadas.

## Preço e reajustes

- alterações de preço serão comunicadas com pelo menos 30 dias de antecedência;
- o novo preço será aplicado somente na renovação seguinte ao prazo de aviso;
- o cliente poderá cancelar antes da cobrança com o novo valor.

## Período de teste

- o acesso completo terá teste gratuito de 2 dias corridos;
- a primeira cobrança ocorrerá no 3º dia, se a assinatura não for cancelada antes do fim do teste;
- a data exata da primeira cobrança deverá ser mostrada antes da confirmação;
- cancelamento durante o teste impedirá a primeira cobrança;
- o método de pagamento será informado no início do teste;
- será concedido somente um teste por cliente, considerando conta, CPF/CNPJ e identificador do cliente na Stripe;
- após o teste ser utilizado ou cancelado, nova assinatura começará com cobrança imediata.

## Alterações dos documentos

- mudanças relevantes nos Termos serão comunicadas com pelo menos 15 dias de antecedência;
- alterações urgentes exigidas por lei ou necessárias à segurança poderão ter efeito imediato, com comunicação assim que possível;
- quando a mudança exigir novo consentimento, o produto solicitará novo aceite versionado antes da continuidade aplicável.

## Lei aplicável e foro

- os Termos serão regidos pelas leis brasileiras;
- para relações empresariais, será indicado o foro de Palmas/TO;
- consumidores preservarão o foro e os demais direitos garantidos pela legislação de proteção ao consumidor.

## Regras para atualizar este documento

- Toda decisão deve indicar responsável e, quando relevante, data de aprovação.
- Política pública só pode usar valores marcados como definidos.
- Mudanças em preço, renovação, cancelamento ou dados pessoais exigem revisão de impacto nos documentos e no checkout.
- A versão publicada dos documentos não é editada retroativamente; uma nova alteração gera nova versão.

