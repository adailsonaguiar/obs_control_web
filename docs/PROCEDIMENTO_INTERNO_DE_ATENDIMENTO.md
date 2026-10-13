# Procedimento interno de atendimento — VEROLAB

> **DOCUMENTO INTERNO — RASCUNHO 0.1**

Responsável: **Administrador da VEROLAB**  
Canal oficial: **verolabso@gmail.com**

## 1. Objetivo

Padronizar o recebimento, a identificação, o acompanhamento e a conclusão de solicitações relacionadas ao OBS Stream Tools, preservando segurança, rastreabilidade e os prazos publicados.

## 2. Abertura e protocolo

Ao receber uma solicitação:

1. gerar protocolo no formato `VRL-AAAAMMDD-NNN`;
2. usar numeração sequencial diária com três dígitos, começando em `001`;
3. registrar data e hora, e-mail do solicitante, categoria, resumo, prazo aplicável, situação e responsável;
4. responder ao cliente com o protocolo e o próximo passo;
5. nunca copiar para o registro senhas, tokens, dados completos de cartão ou credenciais.

Exemplo: `VRL-20261013-001`.

## 3. Categorias e prazos iniciais

| Categoria | Confirmação | Prazo ou ação inicial |
| --- | --- | --- |
| Suporte geral | Até 2 dias úteis | Analisar e informar solução, orientação ou previsão |
| Privacidade/LGPD | Até 2 dias úteis | Validar identidade e classificar o direito solicitado |
| Exclusão de conta | Até 2 dias úteis | Concluir em até 15 dias corridos, ressalvada retenção legal comunicada |
| Arrependimento ou reembolso | Imediata ou até 1 dia útil | Analisar e iniciar estorno válido em até 2 dias úteis |
| Cobrança duplicada ou indevida | Imediata ou até 1 dia útil | Localizar cobrança, analisar e iniciar estorno válido em até 2 dias úteis |
| Incidente de segurança | Imediata internamente | Conter, preservar evidências, avaliar risco e buscar orientação especializada |

O prazo de crédito de um estorno depende da Stripe, do banco e do emissor do cartão.

## 4. Verificação de identidade

- responder preferencialmente ao e-mail vinculado à conta;
- solicitar somente os dados necessários para localizar a conta ou contratação;
- usar nome, e-mail, CPF/CNPJ ou identificador parcial da cobrança conforme a natureza do pedido;
- nunca solicitar senha, token do OBS/PTZ ou número completo do cartão;
- se persistir dúvida razoável sobre a identidade, pausar a divulgação ou exclusão de dados e explicar qual validação adicional é necessária.

## 5. Fluxo por categoria

### Suporte

Registrar o problema, ambiente relevante e solução oferecida. Remover tokens, credenciais e dados excessivos de capturas ou logs antes de armazená-los.

### Direitos de privacidade

Identificar o direito solicitado, os sistemas envolvidos e eventuais impedimentos legais. Responder de forma clara e registrar o resultado. Encaminhar dúvida jurídica para profissional especializado.

### Exclusão

Verificar assinatura, cobranças, documentos fiscais e disputas. Excluir ou anonimizar o que não precisar ser conservado. Informar categorias retidas, justificativa geral e critério de prazo. Lembrar que dados salvos localmente devem ser apagados nos dispositivos do usuário.

### Cancelamento e reembolso

Confirmar o estado na Stripe, o período de teste, a data da contratação e a hipótese aplicável. O motivo do cancelamento é opcional. Registrar o identificador do estorno sem copiar dados completos do cartão.

### Incidente de segurança

Restringir acessos, preservar registros técnicos mínimos, avaliar dados e titulares afetados, impacto, medidas de contenção e necessidade de comunicação. Não improvisar comunicação pública antes da avaliação jurídica e técnica, salvo medida urgente necessária para proteção.

## 6. Encerramento

Antes de encerrar:

- registrar a resposta final e a data;
- confirmar as ações executadas;
- indicar pendência externa, quando houver;
- restringir o acesso ao histórico;
- aplicar a retenção adequada à natureza do atendimento;
- marcar o protocolo como concluído.

## 7. Controles mínimos antes do checkout

- [x] caixa de e-mail protegida por senha exclusiva e autenticação em dois fatores;
- planilha ou sistema de protocolos com acesso restrito;
- modelo de resposta para cada categoria;
- rotina de acompanhamento em dias úteis;
- caminho de escalonamento para contador, advogado e suporte técnico;
- teste completo de cancelamento e reembolso na Stripe.
