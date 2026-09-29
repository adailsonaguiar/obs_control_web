# Plano de novas funcionalidades — OBS Remote Deck

## 1. Objetivo do produto

O OBS Remote Deck deve permitir que uma pessoa acompanhe e opere uma transmissão ao vivo mesmo estando longe do computador que executa o OBS Studio. O produto deve reduzir a necessidade de acesso remoto à área de trabalho e oferecer somente os controles necessários, com respostas claras, proteção contra ações acidentais e meios de recuperação quando algo falhar.

O sucesso do produto não é apenas “enviar comandos ao OBS”. Durante uma live, o operador precisa saber se o comando chegou, se foi executado, qual é o estado real da transmissão e o que fazer quando a conexão cai.

## 2. Estado atual

A solução já possui duas partes:

- **OBS Control Server**: aplicativo instalado no computador do OBS, responsável pela conexão com `obs-websocket`, pela API HTTP e pelos eventos WebSocket.
- **OBS Remote Deck Web**: painel responsivo usado em celular, tablet ou computador.

Funcionalidades já disponíveis:

- conexão por IP, porta e token;
- consulta do estado do OBS, cena atual, gravação e transmissão;
- troca de cena;
- exibição e ocultação de fontes;
- início e parada de gravação e transmissão;
- pré-visualização periódica da saída do OBS;
- eventos em tempo real, reconexão e fallback para polling;
- acesso pela rede local quando habilitado no servidor.

### Limitação mais importante

O acesso atual foi desenhado para `localhost` ou para uma rede local confiável. Ele **não deve ser exposto diretamente à internet** por redirecionamento de porta. O tráfego é HTTP/WS, o token do canal de eventos aparece na URL e um único token concede todos os comandos disponíveis.

“Usar de longe” deve, portanto, ser tratado como uma nova capacidade de produto, e não apenas como a abertura da porta `3456` no roteador.

## 3. Princípios para novas funcionalidades

1. **Segurança por padrão**: nenhuma porta pública, credencial com escopo limitado e sessões revogáveis.
2. **Estado real, não presumido**: após um comando, consultar ou receber do OBS o estado confirmado.
3. **Ações críticas exigem intenção explícita**: parar a transmissão, trocar perfil ou encerrar o OBS não podem ocorrer por um toque acidental.
4. **Operação degradada deve ser compreensível**: diferenciar “OBS desconectado”, “computador offline”, “internet instável” e “painel sem eventos”.
5. **Celular primeiro**: controles grandes, legíveis, rápidos e seguros com uma mão.
6. **Baixo impacto na live**: prévias, telemetria e reconexões não devem competir com o encoder por CPU, GPU ou banda.
7. **Recuperação antes de conveniência**: diagnóstico, alertas e ações de contingência têm prioridade sobre personalização visual.

## 4. Cenários principais

- O apresentador troca de cena e controla microfones pelo celular enquanto está longe da mesa.
- Um operador acompanha remotamente o estado da live e intervém apenas quando recebe um alerta.
- Uma equipe divide responsabilidades: alguém controla cenas, outra pessoa monitora áudio e somente um administrador pode iniciar ou encerrar a transmissão.
- O operador perde a conexão do celular, mas a live continua sem alteração e o painel recupera o estado ao reconectar.
- O OBS ou o computador fica indisponível e o usuário recebe um diagnóstico objetivo, sem confundir isso com falha do navegador.

## 5. Roadmap recomendado

### Fase 1 — operação confiável na rede local

Esta fase fortalece o que já existe e deve anteceder o acesso pela internet.

#### 5.1 Confirmação e proteção de comandos críticos

- pedir confirmação para **parar transmissão** e **parar gravação**;
- permitir confirmação por pressionar e segurar no celular;
- exibir o estado “enviando”, “confirmado” ou “falhou” por comando;
- impedir cliques repetidos enquanto uma operação estiver em andamento;
- usar uma chave de idempotência nos comandos para evitar execução duplicada após timeout ou reconexão;
- registrar quem executou a ação, quando e qual foi o resultado.

#### 5.2 Monitor de saúde da transmissão

Exibir, quando fornecido pelo OBS:

- duração da live e da gravação;
- taxa de bits atual;
- quadros perdidos e percentual de perda;
- FPS real;
- uso de CPU e tempo médio de renderização;
- espaço livre em disco e estimativa para gravação;
- status do serviço de streaming e última alteração de estado.

Estados sugeridos: **saudável**, **atenção**, **crítico** e **sem dados**. Os limites devem ser configuráveis, pois bitrate e perda aceitáveis variam conforme a transmissão.

#### 5.3 Controle de áudio

- listar entradas de áudio e seus estados;
- silenciar e reativar uma entrada;
- controlar volume com indicação numérica;
- mostrar medidores de nível com atualização limitada;
- destacar clipping e áudio ausente;
- permitir marcar canais favoritos, como microfone e trilha.

Alterações de volume devem usar debounce e apresentar o valor confirmado pelo OBS.

#### 5.4 Modo Studio

- mostrar cena de prévia e cena de programa separadamente;
- selecionar a próxima cena sem colocá-la imediatamente no ar;
- executar transição e escolher duração;
- bloquear o modo de corte direto quando o usuário estiver operando em Modo Studio.

#### 5.5 Diagnóstico no painel

Apresentar separadamente:

```text
Painel ↔ Serviço remoto ↔ Agente no computador ↔ OBS ↔ Plataforma de streaming
```

Para cada elo, exibir estado, última comunicação e mensagem de recuperação. Incluir uma tela de diagnóstico exportável, mas remover tokens, senhas e dados pessoais do relatório.

### Fase 2 — acesso remoto seguro pela internet

#### 5.6 Agente com conexão de saída

O aplicativo instalado no computador deve abrir uma conexão TLS de saída para um serviço intermediário. Assim, o usuário não precisa configurar NAT, IP público, DNS ou encaminhamento de portas.

Fluxo recomendado:

```text
Celular ── HTTPS/WSS ── Serviço remoto ── TLS de saída ── Agente local ── OBS
```

Requisitos:

- pareamento do computador por QR code ou código curto de uso único;
- identidade própria para cada instalação;
- sessão autenticada para cada usuário e dispositivo;
- comandos autorizados no serviço e novamente validados pelo agente;
- rotação, revogação e expiração de credenciais;
- heartbeat para distinguir agente offline de OBS desconectado;
- fila curta apenas para comandos seguros; comandos críticos não devem ser executados depois de expirarem;
- comunicação com criptografia em trânsito e proteção contra replay;
- nenhuma senha do OBS enviada ao serviço remoto.

Uma VPN privada, como alternativa de implantação avançada, pode continuar suportada. Ainda assim, o painel deve usar HTTPS/WSS e autenticação individual.

#### 5.7 Contas, equipes e permissões

Papéis iniciais:

| Papel | Permissões principais |
| --- | --- |
| Administrador | parear computadores, gerenciar usuários, configurações e todas as ações |
| Operador | controlar cenas, fontes, áudio, gravação e transmissão conforme política |
| Assistente | controlar apenas cenas, fontes e macros permitidas |
| Observador | visualizar estado, alertas e prévia, sem enviar comandos |

As permissões devem ser avaliadas no backend, nunca somente ocultadas na interface. Deve ser possível revogar uma sessão, remover um dispositivo e consultar o histórico de acessos.

#### 5.8 Auditoria

Registrar:

- usuário e dispositivo;
- computador/OBS de destino;
- ação e parâmetros relevantes;
- estado anterior e estado confirmado;
- horário do servidor;
- sucesso, falha ou expiração;
- identificador de correlação do comando.

O histórico precisa de retenção definida, paginação e exportação. Tokens e senhas jamais devem aparecer nos eventos.

### Fase 3 — assistência durante a transmissão

#### 5.9 Alertas acionáveis

Alertas importantes:

- transmissão interrompida inesperadamente;
- bitrate abaixo do limite por um período contínuo;
- aumento de quadros perdidos;
- áudio principal mudo, ausente ou saturado;
- gravação parada ou pouco espaço em disco;
- OBS, agente ou computador offline;
- reconexões repetidas.

Evitar alertas por oscilação momentânea. Usar janela de tempo, severidade, deduplicação e período de silêncio. Notificações push, e-mail ou integrações externas devem ser opt-in.

#### 5.10 Macros e runbooks

Permitir sequências como “iniciar evento”:

1. validar OBS e espaço em disco;
2. selecionar a cena inicial;
3. iniciar gravação;
4. iniciar transmissão;
5. confirmar cada estado;
6. interromper e orientar o usuário se uma etapa falhar.

Cada macro deve indicar etapas, tempo limite e política de falha. Ações destrutivas continuam exigindo confirmação. Não executar automaticamente uma macro antiga depois que a conexão voltar.

#### 5.11 Perfis de painel

- favoritos e ordem personalizada de cenas/fontes;
- painel compacto para celular;
- botões com cores e ícones configuráveis;
- modo somente monitoramento;
- presets por evento, local ou cliente;
- bloqueio temporário do painel para evitar toques acidentais.

### Fase 4 — operação avançada

- múltiplos computadores e múltiplas instâncias de OBS;
- controle PTZ com presets;
- replay buffer e marcação de momentos;
- controle de mídias e navegadores usados como fontes;
- integração com calendário e preparação de evento;
- webhooks assinados e integrações com plataformas de streaming;
- atualização remota do agente com assinatura, rollback e canal estável/beta;
- modo de contingência com agente secundário, sem prometer failover automático antes de validar o estado das saídas.

## 6. Evolução técnica sugerida

### 6.1 Contrato de comandos

Os comandos remotos devem ter um envelope consistente:

```json
{
  "commandId": "uuid",
  "type": "stream.stop",
  "targetId": "studio-01",
  "issuedAt": "2026-09-29T20:00:00Z",
  "expiresAt": "2026-09-29T20:00:10Z",
  "expectedState": {"streaming": true}
}
```

Resposta sugerida:

```json
{
  "commandId": "uuid",
  "status": "confirmed",
  "confirmedAt": "2026-09-29T20:00:01Z",
  "resultingState": {"streaming": false}
}
```

`expectedState` evita que um comando atrasado seja aplicado sobre um estado diferente do que o operador viu. `expiresAt` impede a execução tardia de uma ação crítica.

### 6.2 Estado e eventos

- atribuir versão monotônica ou sequência ao estado;
- enviar um snapshot completo ao conectar e eventos incrementais depois dele;
- detectar lacunas de sequência e solicitar novo snapshot;
- manter timestamps do agente e do serviço;
- tratar WebSocket como canal de atualização, mas manter reconciliação periódica;
- limitar frequência e tamanho da prévia conforme rede e carga do computador.

### 6.3 API

Ao evoluir a API, considerar versionamento, por exemplo `/api/v1`. Novos grupos esperados:

```text
GET    /api/v1/health
GET    /api/v1/telemetry
GET    /api/v1/audio/inputs
PATCH  /api/v1/audio/inputs/{id}
GET    /api/v1/studio-mode
POST   /api/v1/transitions
POST   /api/v1/commands
GET    /api/v1/commands/{commandId}
GET    /api/v1/audit-events
```

Não usar nomes de fontes ou cenas como identificador permanente quando o OBS disponibilizar identificadores mais estáveis. Erros devem incluir código legível por máquina, mensagem segura e identificador de correlação.

### 6.4 Segurança mínima

- TLS em toda comunicação fora de `localhost`;
- senhas no sistema de credenciais do sistema operacional quando disponível;
- tokens armazenados com hash quando não precisarem ser recuperados;
- cookies de sessão `Secure`, `HttpOnly` e `SameSite` para o painel hospedado;
- proteção CSRF quando houver autenticação por cookie;
- rate limit por usuário, dispositivo e destino;
- validação estrita de payload e tamanho;
- política explícita de CORS e de origem do WebSocket;
- logs sem segredos;
- dependências atualizadas e artefatos de instalação assinados;
- proteção contra força bruta, replay e enumeração de dispositivos;
- segundo fator para administradores e para operações críticas, quando apropriado.

## 7. Experiência durante falhas

| Situação | Comportamento esperado |
| --- | --- |
| Celular fica offline | não alterar a live; mostrar estado possivelmente desatualizado e reconciliar ao voltar |
| Serviço remoto indisponível | agente e OBS continuam funcionando; nenhuma ação pendente crítica é executada tarde |
| Agente perde conexão | painel mostra computador offline e horário da última comunicação |
| OBS fecha | agente permanece online, tenta reconectar com backoff e informa “OBS desconectado” |
| Comando expira | marcar como expirado; não reenviar automaticamente |
| Resposta se perde | consultar o estado/ID do comando antes de oferecer nova tentativa |
| Prévia falha | manter controles essenciais e informar que somente a imagem está indisponível |

## 8. Critérios de aceite para a primeira versão remota

A primeira versão pode ser considerada pronta quando:

- funciona fora da rede local sem abrir portas no roteador;
- todo tráfego remoto usa TLS;
- pareamento, revogação e expiração de sessões são testados;
- permissões são validadas no servidor e no agente;
- parar uma live exige confirmação e possui prazo curto de execução;
- cada comando apresenta estado pendente, confirmado, falho ou expirado;
- reconexão não repete comandos;
- painel distingue serviço, agente e OBS offline;
- ações críticas entram no histórico de auditoria;
- perda de internet do painel não encerra nem altera a transmissão;
- testes cobrem duplicação, atraso, ordem invertida, timeout e reconexão;
- teste de carga comprova que prévia e telemetria não prejudicam a codificação no computador do OBS.

## 9. Priorização resumida

| Prioridade | Entrega | Motivo |
| --- | --- | --- |
| P0 | confirmação de ações, resultado de comandos e diagnóstico | reduz risco operacional imediato |
| P0 | túnel remoto seguro, identidade e revogação | viabiliza uso real fora da rede local |
| P0 | estado de saúde e alertas críticos | permite agir antes da perda da live |
| P1 | áudio e Modo Studio | cobre o trabalho diário de operação |
| P1 | usuários, papéis e auditoria | habilita equipes com responsabilidade clara |
| P1 | macros com validação | reduz passos repetitivos sem ocultar falhas |
| P2 | personalização, PTZ e integrações | amplia produtividade após a base confiável |
| P2 | múltiplos OBS e contingência | atende operações maiores e exige mais validação |

## 10. Itens que não devem ser prometidos inicialmente

- vídeo de prévia em tempo real e alta resolução em qualquer conexão;
- failover totalmente automático entre dois OBS;
- encerramento ou reinício remoto do computador sem uma política adicional de segurança;
- suporte genérico a qualquer plugin do OBS;
- armazenamento em nuvem da senha do `obs-websocket`;
- garantia de continuidade da plataforma de streaming quando o OBS informa apenas o estado local da saída.

Esses itens aumentam significativamente risco, custo ou complexidade e devem ser tratados como projetos próprios, com protótipos e critérios de segurança específicos.

