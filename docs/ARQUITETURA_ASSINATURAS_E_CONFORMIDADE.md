# Arquitetura de assinaturas e conformidade

## Escopo

Especificar as mudanças técnicas necessárias para transformar o checkout existente em um fluxo comercial auditável, cancelável e protegido.

## Fluxo alvo

1. Usuário cria ou acessa a conta Firebase.
2. Página de assinatura carrega os documentos jurídicos vigentes.
3. Usuário escolhe o plano e aceita explicitamente os documentos.
4. Backend valida identidade, plano e versões vigentes.
5. Backend registra o aceite e cria a sessão Stripe Checkout.
6. Stripe inicia período gratuito de 2 dias e agenda a primeira cobrança para o 3º dia.
7. Stripe confirma eventos por webhook assinado.
8. Backend persiste o estado normalizado da assinatura.
9. APIs de produto validam Firebase ID token e entitlement ativo.
10. Usuário gerencia ou cancela a assinatura em sessão autenticada do portal.
11. Webhook atualiza o entitlement e a interface mostra o período final de acesso.

## Documentos versionados

Documento mínimo:

```ts
type LegalDocument = {
  type: 'terms' | 'privacy' | 'refund'
  version: string
  effectiveAt: string
  url: string
  sha256: string
}
```

Aceite mínimo:

```ts
type LegalAcceptance = {
  uid: string
  acceptedAt: Timestamp
  termsVersion: string
  privacyVersion: string
  refundVersion: string
}
```

Não registrar texto integral do documento em cada aceite. Preservar a versão publicada de forma imutável e associá-la pelo identificador e hash.

## Alterações de API propostas

### `GET /legal-documents/current`

Retorna as versões vigentes e URLs públicas.

### `POST /checkout-sessions`

Entrada proposta:

```json
{
  "planId": "ptz-monthly",
  "legalAcceptance": {
    "termsVersion": "PENDENTE",
    "privacyVersion": "PENDENTE",
    "refundVersion": "PENDENTE"
  },
  "successUrl": "https://example.com/checkout/sucesso",
  "cancelUrl": "https://example.com/checkout/cancelado"
}
```

Validações obrigatórias:

- Firebase ID token válido;
- plano pertencente à lista mantida no backend;
- versões iguais às versões vigentes;
- origem permitida;
- usuário sem sessão duplicada incompatível;
- aceite persistido antes ou atomicamente com a criação da sessão.

O backend nunca aceita preço enviado pelo navegador.

### `POST /billing-portal-sessions`

Cria sessão curta e autenticada do Stripe Customer Portal para o cliente associado ao UID.

### `GET /subscriptions/current`

Retorna estado, plano, renovação, `currentPeriodEnd` e `cancelAtPeriodEnd`. Não retorna identificadores internos desnecessários.

### `POST /privacy-requests`

Opcional. Registra pedido autenticado do titular. O primeiro lançamento pode usar um canal de e-mail publicado se houver processo interno confiável.

## Modelo de dados proposto

### `subscriptions/{uid}`

- `stripeCustomerId`
- `stripeSubscriptionId`
- `planId`
- `status`
- `currentPeriodEnd`
- `cancelAtPeriodEnd`
- `trialEnd`
- `trialConsumedAt`
- `updatedAt`

### `legalAcceptances/{acceptanceId}`

- `uid`
- versões dos três documentos
- `acceptedAt`
- `checkoutSessionId`, quando disponível

O identificador não deve ser previsível. A leitura é restrita ao próprio usuário quando necessária; escrita direta pelo cliente é proibida.

## Eventos Stripe mínimos

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.paid`
- `invoice.payment_failed`

Requisitos:

- validar assinatura do webhook usando o corpo bruto;
- tornar o processamento idempotente por `event.id`;
- tolerar eventos fora de ordem consultando o objeto atual na Stripe quando necessário;
- não conceder acesso somente por retorno do navegador;
- não registrar payloads com dados pessoais ou financeiros desnecessários.

## Segurança

- Segredos somente no backend e no gerenciador de segredos.
- CORS restrito às origens oficiais.
- Rate limiting nos endpoints públicos e autenticados sensíveis.
- Firebase App Check a avaliar como defesa adicional, nunca como substituto de autenticação.
- Regras Firestore negam escrita de entitlement pelo cliente.
- APIs que comandam OBS/PTZ validam autenticação e entitlement no servidor responsável pelo comando.
- Token local do OBS não é enviado à Stripe, Firebase Analytics ou logs.
- Logs usam identificadores técnicos mínimos e nunca armazenam senhas, tokens ou cartão.
- Definir rotação de segredos e resposta a incidentes.

## Interface

### Checkout

- resumo do plano, preço e periodicidade;
- informação destacada sobre renovação;
- checkbox único ou separado conforme validação jurídica, nunca pré-marcado;
- links abrindo os documentos vigentes;
- botão desabilitado até aceite;
- mensagem recuperável para versão desatualizada.

### Área da conta

- estado da assinatura;
- plano atual;
- data da próxima renovação ou fim do acesso;
- ação “Gerenciar assinatura”;
- histórico ou comprovante de aceite acessível sob solicitação;
- canais de suporte e privacidade.

## Testes de aceite

- checkout rejeita plano desconhecido;
- checkout rejeita documento desatualizado;
- checkout informa a data exata da primeira cobrança após os 2 dias de teste;
- cancelamento durante o teste impede a primeira cobrança;
- cliente que já consumiu o teste não recebe novo período gratuito;
- aceite não é criado para usuário não autenticado;
- repetição da mesma requisição não cria assinaturas duplicadas;
- webhook inválido é rejeitado;
- eventos repetidos não alteram estado incorretamente;
- cancelamento agendado mantém acesso até a data correta;
- assinatura encerrada remove acesso;
- falha de pagamento segue a regra comercial definida;
- usuário não acessa assinatura ou aceite de outro usuário;
- ausência de configuração mantém checkout desabilitado com mensagem clara.

## Fora de escopo desta primeira especificação

- redação jurídica final;
- escolha de CNAE ou regime tributário;
- integração com um emissor fiscal específico;
- registro no INPI;
- comercialização fora do Brasil;
- contas corporativas com múltiplos usuários.

