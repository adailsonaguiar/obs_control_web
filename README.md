# OBS Stream Tools

Portal de ferramentas para streaming. A landing page está disponível em `/` e o **OBS Deck**, interface web responsiva para controlar remotamente o OBS Studio, em `/deck`.

## Planejamento do produto

O documento [Plano de novas funcionalidades](docs/PLANO_NOVAS_FUNCIONALIDADES.md) descreve a evolução recomendada para operação segura fora da rede local, confiabilidade durante transmissões, monitoramento, áudio, permissões, macros e critérios de aceite.

## Recursos

- Configuração por IP, porta e token.
- Status do OBS, cena ativa, gravação e transmissão.
- Iniciar e parar gravação.
- Iniciar e parar transmissão.
- Listar e trocar cenas.
- Mostrar e ocultar fontes da cena atual.
- Atualização em tempo real usando `/events`.
- Polling automático quando o WebSocket estiver indisponível.
- Reconexão automática do canal de eventos.
- Layout responsivo para computador, tablet e celular.
- Token mantido apenas durante a sessão por padrão.

## Pré-requisitos

- Node.js 20 ou superior.
- OBS Control Server V2 em execução no computador do OBS.
- Os dispositivos devem estar conectados à mesma rede local.

## Preparar o servidor

Baixe o instalador mais recente na página de [releases do OBS Control Server](https://github.com/adailsonaguiar/obs_control_server/releases) e instale-o no mesmo computador em que o OBS Studio será executado.

No aplicativo desktop **OBS Control Server**:

1. Abra **Configurações**.
2. Ative **Permitir acesso pela rede local**.
3. Salve as configurações.
4. Reinicie o servidor local pelo painel.
5. Copie o **Token da API**.
6. Descubra o IP local do computador, por exemplo `192.168.1.20`.

O firewall do sistema operacional deve permitir conexões de entrada na porta configurada, que por padrão é `3456`.

## Executar em desenvolvimento

```bash
cd obs_control_web
npm install
npm run dev
```

O Vite escuta em todas as interfaces de rede. Os endereços serão exibidos no terminal:

```text
Local:   http://localhost:5173/
Network: http://192.168.1.20:5173/
```

Abra o endereço `Network` em outro dispositivo conectado à mesma rede. Na tela de conexão, informe:

- IP: o endereço do computador onde o servidor está rodando.
- Porta: `3456`, salvo alteração no servidor.
- Token: o token mostrado nas configurações do servidor.

## Build de produção

```bash
npm run build
```

Os arquivos estáticos serão gerados em `dist`. Para validá-los na rede local:

```bash
npm run preview
```

O preview utiliza a porta `4173`. Para produção real, publique o conteúdo de `dist` em qualquer servidor de arquivos estáticos acessível na rede.

O servidor de hospedagem deve redirecionar rotas desconhecidas para `index.html`, permitindo acesso direto a `/deck`.

### Netlify

O arquivo `public/_redirects` configura automaticamente o fallback de SPA no Netlify. Assim, rotas como `/deck` podem ser abertas diretamente ou recarregadas sem retornar erro 404. Publique o diretório `dist` gerado pelo build.

## SEO e descoberta por buscadores

Antes do build de produção, defina `VITE_PUBLIC_SITE_URL` com a origem pública completa da aplicação, sem caminho ou barra final. Exemplo: `https://tools.suaempresa.com`.

Essa configuração é usada para URLs canônicas, dados estruturados, previews sociais, `robots.txt` e `sitemap.xml`. O build também gera `llms.txt`, com um resumo legível por crawlers e agentes de inteligência artificial. Sem `VITE_PUBLIC_SITE_URL`, o sitemap não é gerado para evitar divulgar uma URL incorreta.

Depois da publicação, cadastre `${VITE_PUBLIC_SITE_URL}/sitemap.xml` no Google Search Console e nas ferramentas equivalentes dos demais buscadores.

## Integração de pagamentos

O frontend está preparado para solicitar sessões de checkout a um backend. Copie `.env.example` para `.env.local` e configure `VITE_BILLING_API_URL` com a URL pública desse serviço.

O endpoint `POST /checkout-sessions` deve receber `planId`, `successUrl` e `cancelUrl`, criar a sessão no provedor escolhido e responder:

```json
{"checkoutUrl": "https://checkout.do-provedor.example/sessao"}
```

Chaves privadas, preços confiáveis e webhooks devem permanecer exclusivamente no backend. Sem a variável configurada, a landing exibe um link de interesse por e-mail no lugar do checkout.

## Testes

```bash
npm test
npm run build
npm audit
```

## Segurança

- Não exponha as portas `3456`, `5173` ou `4173` diretamente à internet.
- Use apenas uma rede local confiável ou uma VPN privada.
- Mantenha um token longo e exclusivo no OBS Control Server.
- A opção **Lembrar o token** salva a credencial no armazenamento local do navegador. Deixe-a desmarcada em dispositivos compartilhados.
- O token do WebSocket é enviado na URL por limitação da API WebSocket dos navegadores. Use somente a rede local confiável.
- Se a interface web for publicada via HTTPS, o navegador poderá bloquear chamadas HTTP/WS ao servidor por conteúdo misto. Nesse cenário, coloque a API atrás de um proxy HTTPS/WSS.

## Arquitetura

```text
Celular / Tablet / Navegador
          │ HTTP + WebSocket
          ▼
OBS Control Server :3456
          │ obs-websocket
          ▼
      OBS Studio :4455
```
