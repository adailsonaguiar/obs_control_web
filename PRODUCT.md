# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Criadores de conteúdo, igrejas, estúdios e equipes pequenas que operam transmissões ao vivo com OBS Studio em uma rede local e precisam controlar a produção pelo computador, tablet ou celular.

## Product Purpose

O OBS Stream Tools reúne ferramentas de operação para OBS Studio em uma interface web. O produto reduz a dependência de controladores físicos dedicados e permite controlar cenas, fontes, gravação, transmissão e câmeras PTZ sem interromper a produção.

## Positioning

Uma central web que combina controle do OBS e de câmeras VISCA over IP na mesma experiência, operando diretamente na rede local do usuário.

## Operating Context

- O OBS Studio e o OBS Control Server permanecem abertos no computador da transmissão.
- Celular, tablet ou outro computador acessa as ferramentas pela mesma rede local.
- A operação acontece durante transmissões ao vivo, quando clareza de estado e poucos toques são essenciais.

## Capabilities and Constraints

- O OBS Deck é gratuito e controla cenas, fontes, gravação e transmissão.
- O controle PTZ usa VISCA over IP e é um recurso pago.
- O plano PTZ custa R$ 20 por mês ou R$ 200 por ano.
- A autenticação de usuários usa Firebase Auth.
- A cobrança recorrente usa Stripe Checkout; webhooks e validação de assinatura pertencem ao backend.
- Os identificadores de preço e valores exibidos devem ficar centralizados e ser facilmente configuráveis.
- A rota `/ptz` deve exigir usuário autenticado com assinatura ativa validada pelo backend.
- Credenciais e chaves privadas nunca podem ser incluídas no cliente.

## Brand Commitments

- Nome do produto: OBS Stream Tools.
- Linguagem visual inspirada em interfaces de produção ao vivo: escura, precisa e operacional, sem copiar marcas ou elementos proprietários.
- Comunicação em português do Brasil, direta e acessível.

## Evidence on Hand

- Logo em `public/logo.png`.
- Capturas do servidor em `public/Screenshot1.png` e `public/Screenshot2.png`.
- Capturas das ferramentas em `public/Screenshot3.png` e `public/Screenshot4.png`.
- Não há depoimentos, marcas de clientes ou métricas de uso fornecidas; esses elementos não devem ser inventados.

## Product Principles

- Colocar comandos essenciais ao alcance imediato durante uma transmissão.
- Exibir com clareza conexão, ferramenta ativa e resultado de cada ação.
- Manter o OBS Deck útil gratuitamente e comunicar o valor do PTZ sem esconder preços.
- Proteger compra e acesso pago no servidor, nunca apenas na interface.
- Funcionar bem com mouse e toque em computador, tablet e celular.

## Accessibility & Inclusion

Controles devem ser utilizáveis por teclado, ter foco visível, alvos de toque confortáveis e contraste adequado para ambientes de operação com pouca luz.
