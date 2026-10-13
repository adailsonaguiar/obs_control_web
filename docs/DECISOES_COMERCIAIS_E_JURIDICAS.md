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
| E-mail de privacidade/LGPD | `verolabso@gmail.com` |
| Telefone ou canal alternativo | Não haverá no lançamento; o e-mail será o único canal oficial |
| Responsável pelo atendimento | Administrador da VEROLAB |
| Segurança do e-mail oficial | Autenticação em dois fatores ativada |

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
| Motivo do cancelamento | Campo opcional; não pode impedir, atrasar ou dificultar o cancelamento |
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

O motivo informado no cancelamento poderá ser utilizado para melhoria do produto e análise agregada. O cliente poderá concluir o cancelamento sem responder, e a ausência de resposta não afetará seus direitos nem o período de acesso restante.

## Privacidade e dados

| Campo | Decisão |
| --- | --- |
| Controlador dos dados | VEROLAB SOLUCOES EM TECNOLOGIA LTDA - ME, CNPJ 64.491.841/0001-21 |
| Operadores conhecidos | Google/Firebase, Google Cloud e Stripe |
| Transferência internacional | Permitida quando necessária aos serviços de Google/Firebase, Google Cloud, GA4 e Stripe, com transparência e mecanismos legais e de segurança compatíveis com a LGPD |
| Analytics | Google Analytics 4 (GA4), somente nas páginas públicas, para medir quantidade de acessos e localização geográfica aproximada |
| Retenção dos dados detalhados do GA4 | 2 meses |
| Validade da preferência de analytics | 6 meses para aceite ou recusa; solicitar novamente após o prazo ou mudança relevante |
| Pixels e publicidade comportamental | Não previstos |
| Canal para direitos do titular | `verolabso@gmail.com` |
| Retenção da conta | Até 24 meses após o término da assinatura, com aviso antes da exclusão automática |
| Retenção de dados de assinatura/fiscais | No mínimo 5 anos, ou por prazo superior enquanto houver processo, fiscalização ou obrigação pendente; validação final com o contador quanto à NFS-e de Palmas |
| Exclusão de conta | Permitida antecipadamente mediante solicitação do titular, ressalvados dados que devam ser preservados por obrigação legal, prevenção a fraude ou exercício de direitos |
| Prazo da solicitação de exclusão | Confirmação em até 2 dias úteis e conclusão operacional em até 15 dias corridos, salvo retenção legal comunicada ao titular |
| Público menor de idade | Contratação somente por pessoa com 18 anos ou mais ou representante autorizado; uso por menor somente sob autorização e responsabilidade do responsável legal |

### Bases legais aprovadas preliminarmente

| Finalidade | Base legal preliminar |
| --- | --- |
| Criar e administrar conta, assinatura, suporte e acesso ao produto | Execução de contrato e procedimentos preliminares relacionados ao contrato |
| Emitir notas fiscais e manter registros obrigatórios | Cumprimento de obrigação legal ou regulatória |
| Prevenir fraude, proteger contas, infraestrutura e produto | Legítimo interesse, mediante avaliação, necessidade, minimização e preservação dos direitos do titular |
| Medir acessos e localização aproximada no site público pelo GA4 | Consentimento |
| Preservar provas e atuar em processos, cobranças ou disputas | Exercício regular de direitos |

As bases são preliminares e deverão ser validadas por advogado antes da publicação. Consentimento não deverá ser usado quando o tratamento for necessário para executar o contrato ou cumprir obrigação legal.

### Inventário técnico inicial de dados

| Ambiente | Dados identificados | Tratamento atual |
| --- | --- | --- |
| Firebase Authentication | E-mail, senha e identificador da conta | A senha é tratada pelo Firebase e não deve ser acessada nem registrada pela VEROLAB |
| Backend/Firebase | UID e e-mail autenticado | Usados para identificar a conta e autorizar o acesso |
| Firestore | Identificadores Stripe de cliente e assinatura, plano, estado, fim do período, cancelamento e datas técnicas | Usados para cobrança recorrente e liberação do produto |
| Stripe | E-mail, UID como metadado, meio de pagamento e dados da assinatura | A VEROLAB não recebe os dados completos do cartão |
| Navegador — OBS Deck | Host, porta, preferência de memorização e token local | Armazenados no dispositivo; o token fica na sessão ou, mediante escolha do usuário, no armazenamento local |
| Navegador — Controle PTZ | Câmeras cadastradas, endereços de rede, modo de controle, ajustes do joystick, host, porta e token do servidor | Armazenados no dispositivo; o token permanece no armazenamento da sessão |
| Navegador — preferências | Favoritos de áudio e demais preferências funcionais | Armazenados localmente no dispositivo |

Os dados locais de conexão com OBS e câmeras PTZ não devem ser enviados à Stripe, ao Firebase Analytics ou a logs. A política pública deverá distinguir claramente armazenamento local no dispositivo de dados enviados à infraestrutura da VEROLAB e de seus operadores.

### Retenção e encerramento da conta

- a conta sem assinatura ativa poderá ser mantida por até 24 meses após o encerramento do último período contratado;
- antes da exclusão automática, a VEROLAB deverá avisar o titular pelo e-mail cadastrado e oferecer prazo razoável para reativação ou solicitação de informações;
- o titular poderá solicitar a exclusão antecipada pelo canal `verolabso@gmail.com`;
- o recebimento da solicitação será confirmado em até 2 dias úteis e a exclusão operacional será concluída em até 15 dias corridos;
- quando houver dados sujeitos a retenção obrigatória, a resposta informará ao titular quais categorias não puderam ser excluídas imediatamente e por qual motivo geral;
- a exclusão da conta não elimina registros que precisem ser mantidos para obrigação legal ou regulatória, emissão e guarda fiscal, prevenção a fraude, cobrança ou exercício regular de direitos;
- dados preservados após a exclusão deverão ficar com acesso restrito, ser usados somente para essas finalidades e eliminados ou anonimizados ao fim do prazo aplicável;
- notas fiscais, comprovantes de pagamento e dados mínimos necessários à comprovação da contratação serão conservados por no mínimo 5 anos, ou por prazo superior enquanto houver processo, fiscalização ou obrigação pendente;
- o prazo e o conjunto documental aplicáveis à NFS-e de Palmas deverão ser confirmados com o contador antes da publicação da política;
- preferências, tokens e cadastros mantidos apenas no navegador ou no computador do usuário deverão ser removidos pelo próprio produto quando houver uma função local de limpeza, sem pressupor que a exclusão da conta remova automaticamente dados de todos os dispositivos.

### Processo interno de atendimento a titulares

- o **Administrador da VEROLAB** será responsável por acompanhar o canal `verolabso@gmail.com`;
- toda solicitação receberá protocolo no formato `VRL-AAAAMMDD-NNN`, com numeração sequencial diária;
- o responsável deverá classificar solicitações de suporte, privacidade, acesso, correção, revogação de consentimento e exclusão;
- antes de revelar, alterar ou excluir dados, deverá confirmar a identidade do solicitante usando somente as informações necessárias;
- cada solicitação deverá ter registro mínimo de recebimento, categoria, verificações realizadas, resposta, prazo e resultado;
- os registros de atendimento não deverão reproduzir senhas, tokens, dados completos de cartão ou outras credenciais;
- quando houver dúvida jurídica, incidente relevante ou impossibilidade de atendimento, o responsável deverá encaminhar o caso para assessoria adequada.

No lançamento, a VEROLAB não divulgará telefone ou WhatsApp como canal oficial. Todo pedido deverá ser enviado por e-mail para permitir confirmação, rastreabilidade e registro do atendimento.

A conta de e-mail oficial possui autenticação em dois fatores ativada. Códigos de recuperação e métodos adicionais de acesso deverão ser mantidos em local seguro e não compartilhados em documentos do projeto.

### Limites aprovados para analytics

- operar somente nas páginas públicas institucionais e comerciais;
- medir visitas, visualizações e localização aproximada, como país, estado ou cidade estimada;
- não solicitar nem coletar GPS ou localização precisa;
- não operar nas páginas autenticadas, interfaces OBS Deck ou Controle PTZ;
- não receber e-mail, CPF/CNPJ, identificador Stripe, token, endereço de rede local, câmeras cadastradas ou comandos operacionais;
- não utilizar pixels de publicidade ou criar perfis para publicidade comportamental;
- respeitar a escolha do visitante e bloquear ferramentas não essenciais até o consentimento, quando aplicável;
- oferecer opção acessível para rever ou retirar o consentimento;
- documentar fornecedor, cookies, identificadores, retenção e eventual transferência internacional antes da ativação.

### Configuração aprovada do Google Analytics 4

- o GA4 somente poderá ser carregado após consentimento expresso do visitante;
- recusar analytics não poderá impedir a navegação, criação de conta, teste ou compra;
- o banner deverá oferecer opções claras de aceitar e recusar, sem seleção prévia;
- a decisão deverá ser armazenada para evitar solicitações repetitivas e poderá ser alterada posteriormente;
- tanto o aceite quanto a recusa permanecerão registrados no dispositivo por 6 meses;
- uma nova escolha será solicitada ao fim desse prazo ou antes, quando houver mudança relevante nas finalidades, fornecedores ou categorias de dados;
- a coleta ficará restrita ao site público, sem rastreamento entre as interfaces autenticadas e o produto;
- recursos de Google Signals, publicidade personalizada, remarketing e compartilhamento para anúncios permanecerão desativados;
- não será enviado `user_id`, e-mail, CPF/CNPJ ou qualquer outro dado que identifique diretamente o visitante;
- a localização será apenas a estimativa agregada fornecida pelo GA4, sem acesso à localização precisa do dispositivo;
- a retenção dos dados detalhados de usuários e eventos será configurada em 2 meses;
- relatórios agregados poderão permanecer disponíveis conforme o funcionamento do GA4, sem permitir a identificação direta do visitante.

### Transferências internacionais

- Google/Firebase, Google Cloud, Google Analytics e Stripe poderão tratar ou armazenar dados em outros países conforme sua infraestrutura;
- a política deverá identificar as categorias de fornecedores, as finalidades e a possibilidade de processamento internacional, sem afirmar uma localização exclusiva que não possa ser garantida;
- somente os dados necessários a cada serviço poderão ser compartilhados;
- a contratação e configuração dos fornecedores deverão utilizar mecanismos válidos para transferência internacional e proteção compatível com a LGPD;
- a VEROLAB deverá revisar termos, aditivos de proteção de dados, controles de acesso e configurações de privacidade antes do lançamento e quando houver mudança relevante;
- a transferência internacional não autoriza o envio de tokens locais do OBS/PTZ, credenciais, endereços de câmeras ou comandos operacionais para analytics ou cobrança.

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

- as versões públicas usarão a data de vigência no formato `AAAA-MM-DD`;
- mudanças relevantes nos Termos serão comunicadas com pelo menos 15 dias de antecedência;
- alterações urgentes exigidas por lei ou necessárias à segurança poderão ter efeito imediato, com comunicação assim que possível;
- quando a mudança exigir novo consentimento, o produto solicitará novo aceite versionado antes da continuidade aplicável.

## Evidência de aceite

- o checkout registrará as versões vigentes dos Termos de Uso, Política de Privacidade e Política de Cancelamento e Reembolso;
- haverá um único checkbox obrigatório, não pré-marcado, com o texto: **“Li e aceito os Termos de Uso e a Política de Cancelamento e Reembolso e declaro estar ciente da Política de Privacidade.”**;
- os nomes dos três documentos serão links individuais para suas versões vigentes;
- o registro conterá data e hora, UID da conta, plano escolhido e origem do aceite;
- o checkbox não será pré-marcado e o checkout ficará bloqueado até a confirmação;
- a versão publicada e seu hash serão preservados de forma imutável para comprovar exatamente o conteúdo apresentado;
- uma nova versão não alterará registros anteriores e exigirá novo aceite quando a natureza da mudança ou a legislação assim determinar.
- o consentimento para GA4 permanecerá separado no banner de analytics e sua recusa não impedirá o checkout.

## Lei aplicável e foro

- os Termos serão regidos pelas leis brasileiras;
- para relações empresariais, será indicado o foro de Palmas/TO;
- consumidores preservarão o foro e os demais direitos garantidos pela legislação de proteção ao consumidor.

## Regras para atualizar este documento

- Toda decisão deve indicar responsável e, quando relevante, data de aprovação.
- Política pública só pode usar valores marcados como definidos.
- Mudanças em preço, renovação, cancelamento ou dados pessoais exigem revisão de impacto nos documentos e no checkout.
- A versão publicada dos documentos não é editada retroativamente; uma nova alteração gera nova versão.

