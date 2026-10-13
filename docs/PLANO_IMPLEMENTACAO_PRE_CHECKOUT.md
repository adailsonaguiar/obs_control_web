# Plano de implementação antes da ativação do checkout

## Objetivo

Construir os requisitos comerciais, jurídicos e técnicos indispensáveis para ativar o checkout do OBS Stream Tools com transparência, prova de aceite, privacidade e cancelamento em autosserviço.

## Ordem recomendada

```text
Revisão dos textos
      ↓
Páginas jurídicas + identificação do fornecedor
      ↓
Consentimento de analytics
      ↓
Aceite versionado + checkout com teste gratuito
      ↓
Área da assinatura + cancelamento
      ↓
Segurança, testes e revisão final
      ↓
Ativação do checkout
```

## Etapa 1 — Fechar os documentos jurídicos

### Construção

- submeter ao advogado os rascunhos de Termos de Uso, Política de Privacidade e Política de Cancelamento e Reembolso;
- confirmar com o contador o prazo e os dados necessários para NFS-e em Palmas/TO;
- aplicar as correções aprovadas;
- definir data de atualização e vigência no formato `AAAA-MM-DD`;
- gerar uma versão imutável de cada documento e seu hash SHA-256.

### Entradas existentes

- `docs/TERMOS_DE_USO_RASCUNHO.md`;
- `docs/POLITICA_DE_PRIVACIDADE_RASCUNHO.md`;
- `docs/POLITICA_DE_CANCELAMENTO_E_REEMBOLSO_RASCUNHO.md`.

### Critério de aceite

Os três documentos estão aprovados, possuem versão, data de vigência, URL definitiva e conteúdo preservado para futura comprovação.

## Etapa 2 — Publicar páginas jurídicas e identificação da VEROLAB

### Construção

- criar rotas públicas para `/termos`, `/privacidade` e `/cancelamento-e-reembolso`;
- criar um componente reutilizável de layout jurídico;
- incluir razão social, nome fantasia, CNPJ, endereço e `verolabso@gmail.com` no rodapé da landing page;
- repetir a identificação essencial no checkout e na área da assinatura;
- adicionar links para os três documentos no rodapé, checkout, FAQ e área da conta;
- garantir leitura confortável em celular, tablet e desktop;
- incluir título, descrição, canonical e metadados adequados em cada página.

### Critério de aceite

Os documentos podem ser consultados antes da criação da conta ou compra, têm URLs estáveis e a identificação do fornecedor é facilmente localizada.

## Etapa 3 — Implementar consentimento do Google Analytics 4

### Construção

- criar banner com as ações equivalentes “Aceitar analytics” e “Recusar”;
- não carregar GA4 antes do aceite;
- guardar aceite ou recusa no dispositivo por 6 meses;
- oferecer link “Preferências de privacidade” no rodapé para alterar a decisão;
- restringir GA4 às páginas públicas;
- configurar retenção detalhada em 2 meses;
- manter desativados Google Signals, publicidade personalizada e remarketing;
- impedir envio de e-mail, UID, CPF/CNPJ, identificadores Stripe, tokens ou dados do OBS/PTZ;
- documentar o identificador de medição em variável de ambiente pública apropriada.

### Testes

- sem escolha: nenhuma requisição do GA4;
- recusa: nenhuma requisição do GA4;
- aceite: GA4 ativo somente nas páginas públicas;
- alteração da preferência: efeito imediato;
- expiração simulada: banner volta a ser apresentado.

### Critério de aceite

O visitante navega e compra normalmente após recusar, e nenhuma rota autenticada ou operacional é medida.

## Etapa 4 — Implementar documentos e aceite versionado no backend

### Construção

- disponibilizar `GET /legal-documents/current` com tipo, versão, vigência, URL e hash de cada documento;
- criar coleção imutável `legalAcceptances`;
- impedir escrita direta do cliente no Firestore;
- validar Firebase ID token, plano e versões vigentes em `POST /checkout-sessions`;
- registrar UID, versões, data/hora do servidor, plano e origem `checkout`;
- rejeitar checkout sem aceite ou com versão desatualizada;
- associar ao registro o ID da sessão de checkout quando disponível;
- não registrar IP, user-agent ou outros dados adicionais sem necessidade aprovada.

### Critério de aceite

É possível demonstrar qual conteúdo cada cliente aceitou, e o navegador não consegue criar ou alterar diretamente a evidência.

## Etapa 5 — Atualizar a experiência do checkout

### Construção

- carregar as versões jurídicas vigentes antes de habilitar a compra;
- exibir plano, preço, periodicidade, renovação automática e data exata da primeira cobrança;
- informar os 2 dias corridos de teste gratuito e a cobrança no 3º dia;
- adicionar o checkbox obrigatório, não pré-marcado:

> Li e aceito os Termos de Uso e a Política de Cancelamento e Reembolso e declaro estar ciente da Política de Privacidade.

- transformar o nome de cada documento em link para a versão vigente;
- desabilitar o botão até o aceite;
- tratar versão jurídica desatualizada solicitando nova leitura e confirmação;
- informar que a Stripe processa o pagamento e que o site não recebe os dados completos do cartão;
- enviar somente `planId`, versões e URLs permitidas; nunca preço vindo do navegador.

### Stripe

- configurar mensal e anual com os Price IDs mantidos apenas no backend;
- solicitar método de pagamento no início do teste;
- configurar período gratuito de 2 dias;
- conceder apenas um teste por cliente conforme conta, CPF/CNPJ e Stripe Customer ID;
- garantir que cancelamento durante o teste impeça a primeira cobrança;
- revisar textos do Stripe Checkout e e-mails transacionais.

### Critério de aceite

O cliente entende preço, renovação, teste e documentos antes de confirmar, e nenhuma assinatura nasce sem aceite válido.

## Etapa 6 — Construir área da assinatura e cancelamento

### Construção

- exibir plano, estado, fim do teste, próxima cobrança e fim do período atual;
- implementar `POST /billing-portal-sessions` autenticado;
- abrir sessão curta do Stripe Customer Portal vinculada exclusivamente ao UID autenticado;
- permitir cancelar sem contato por e-mail;
- manter o acesso até o fim do período pago;
- impedir a primeira cobrança se o cancelamento ocorrer durante o teste;
- permitir motivo opcional, sem bloquear ou atrasar o cancelamento;
- mostrar confirmação e data final de acesso;
- manter `verolabso@gmail.com` como canal para arrependimento, cobrança indevida e suporte.

### Critério de aceite

O cliente consegue cancelar sozinho, recebe confirmação clara e o entitlement acompanha o estado confirmado pelo webhook.

## Etapa 7 — Consolidar webhooks e entitlement

### Construção

- validar assinatura Stripe usando o corpo bruto;
- processar eventos de forma idempotente por `event.id`;
- tratar criação, atualização, exclusão, fim próximo do teste, pagamento confirmado e pagamento falho;
- reconciliar eventos fora de ordem consultando o estado atual na Stripe;
- nunca liberar acesso somente pelo retorno do navegador;
- refletir `trialing`, `active`, cancelamento agendado, inadimplência e encerramento nas regras de acesso;
- registrar somente informações técnicas mínimas e nunca cartão, senha ou token local.

### Critério de aceite

Atualizações repetidas ou fora de ordem não duplicam efeitos, e o acesso corresponde ao estado real da assinatura.

## Etapa 8 — Segurança e privacidade

### Construção

- revisar regras do Firestore para conta, assinatura e aceites;
- restringir CORS às origens oficiais;
- manter segredos Stripe e Firebase Admin apenas no backend e no gerenciador de segredos;
- aplicar rate limiting nos endpoints de checkout, portal e entitlement;
- revisar logs e remover dados pessoais ou financeiros desnecessários;
- confirmar que tokens e configurações locais do OBS/PTZ não são enviados para analytics ou backend de cobrança;
- testar autorização horizontal: um usuário nunca acessa assinatura, portal ou aceite de outro;
- definir rotação de segredos e procedimento básico de incidente.

### Critério de aceite

Os controles críticos foram revisados em ambiente de teste e não há segredo no frontend ou no repositório.

## Etapa 9 — Testes de ponta a ponta

### Cenários obrigatórios

- criação de conta e login;
- recusa e aceite de analytics;
- checkout bloqueado sem aceite jurídico;
- rejeição de documento desatualizado;
- início dos 2 dias gratuitos sem cobrança imediata;
- primeira cobrança programada para o 3º dia;
- cancelamento durante o teste;
- cancelamento mensal e anual após cobrança;
- uma segunda tentativa de teste pelo mesmo cliente;
- pagamento aprovado, falho, duplicado e reembolsado;
- webhook repetido e fora de ordem;
- acesso ativo, fim do acesso e tentativa sem entitlement;
- abertura do portal por usuário autenticado;
- tentativa de acessar dados de outro usuário;
- páginas jurídicas e rodapé em celular e desktop;
- navegação por teclado, foco, labels e mensagens de erro;
- envio de e-mail de suporte e execução simulada dos prazos internos.

### Verificações do projeto

Executar no repositório `obs_control_web`:

```bash
npm test
npm run build
npm audit
```

### Critério de aceite

Testes automatizados passam, os cenários manuais críticos são registrados e nenhuma pendência de severidade alta permanece aberta.

## Etapa 10 — Checklist de ativação

O checkout somente poderá ser ativado quando todos os itens abaixo estiverem concluídos:

- [ ] documentos revisados por advogado e publicados em URLs estáveis;
- [ ] retenção fiscal confirmada pelo contador;
- [ ] identificação da VEROLAB no rodapé e checkout;
- [ ] GA4 bloqueado até consentimento e ausente das rotas privadas;
- [ ] aceite versionado validado e persistido pelo backend;
- [ ] teste gratuito e primeira cobrança conferidos no Stripe Test Mode;
- [ ] portal de cancelamento funcionando;
- [ ] webhooks idempotentes e entitlement validados;
- [ ] regras Firebase, CORS, segredos, logs e autorização revisados;
- [ ] e-mails transacionais e canal de suporte testados;
- [ ] `npm test`, `npm run build` e `npm audit` executados;
- [ ] teste real controlado de baixo valor ou modo equivalente concluído antes da divulgação pública.

## Entregas sugeridas por incremento

1. **Jurídico público:** rotas, layout, rodapé e identificação.
2. **Privacidade:** banner, preferências e GA4 condicionado.
3. **Contrato:** endpoint de documentos, aceite imutável e checkout atualizado.
4. **Assinatura:** teste gratuito, webhooks, portal e cancelamento.
5. **Lançamento:** segurança, testes integrados, revisão jurídica/contábil e ativação.

Cada incremento deve ter testes próprios e permanecer desativado por configuração até que suas dependências estejam concluídas.
