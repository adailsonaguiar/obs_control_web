import {ContactFooter} from '../components/ContactFooter'

const guides = {
  deck: {
    kicker: 'GUIA OBS DECK', title: 'Controle o OBS de qualquer tela.', description: 'Configure a conexão local e comece a trocar cenas, operar fontes e controlar as saídas da sua produção.', image: '/Screenshot3.png', imageAlt: 'Interface completa do OBS Deck', productHref: '/deck', productLabel: 'Abrir OBS Deck',
    steps: [
      ['Prepare o OBS Studio', 'Abra Ferramentas → Configurações do servidor WebSocket e confirme que o servidor está habilitado. A porta padrão é 4455.'],
      ['Instale o servidor local', 'Baixe o OBS Control Server no computador onde o OBS está aberto. No painel, conecte ao OBS Studio.'],
      ['Libere o acesso na rede', 'Em Configurações, ative “Permitir acesso pela rede local”, salve e reinicie o servidor. Copie IP, porta e token.'],
      ['Conecte seu dispositivo', 'Abra o OBS Deck em outro aparelho da mesma rede, informe os dados copiados e toque em “Conectar ao servidor”.'],
      ['Comece a produção', 'Escolha cenas, altere a visibilidade das fontes e controle gravação ou transmissão acompanhando os indicadores na tela.'],
    ],
  },
  ptz: {
    kicker: 'GUIA CONTROLE PTZ', title: 'Movimente suas câmeras com precisão.', description: 'Cadastre câmeras VISCA over IP, escolha o modo de operação e salve enquadramentos para recuperá-los em segundos.', image: '/Screenshot4.png', imageAlt: 'Interface completa do Controle PTZ', productHref: '/ptz', productLabel: 'Abrir Controle PTZ',
    steps: [
      ['Confirme a rede', 'Mantenha o computador, o dispositivo de controle e as câmeras PTZ na mesma rede local confiável.'],
      ['Cadastre uma câmera', 'Clique em “Nova” e informe um nome, o endereço IP da câmera, a porta VISCA e os dados opcionais de preview.'],
      ['Escolha o controle', 'Use Setas para movimentos previsíveis ou Joystick para controlar direção e intensidade em um único gesto.'],
      ['Ajuste o movimento', 'Defina velocidade e sensibilidade. Se precisar de um travelling mais estável, trave o eixo horizontal ou vertical.'],
      ['Salve seus enquadramentos', 'Posicione a câmera, clique em “Gravar” na área de presets e dê um nome claro. Depois, recupere a posição com um toque.'],
    ],
  },
} as const

export function GuidePage({kind}: {kind: keyof typeof guides}) {
  const guide = guides[kind]
  return <div className="guide-page"><header><a className="account-brand" href="/"><img src="/logo.png" alt="" /><span><strong>OBS Stream</strong><small>TOOLS</small></span></a><a href="/">Voltar ao início</a></header><main><section className="guide-hero"><div><span>{guide.kicker}</span><h1>{guide.title}</h1><p>{guide.description}</p><a href={guide.productHref}>{guide.productLabel} <b>→</b></a></div><figure><img src={guide.image} alt={guide.imageAlt} /></figure></section><section className="guide-content"><aside><span>PASSO A PASSO</span><h2>Da instalação ao primeiro comando.</h2><p>Reserve alguns minutos para configurar tudo antes da produção. Assim, a operação ao vivo fica simples e previsível.</p></aside><ol>{guide.steps.map(([title, text], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section><section className="guide-safety"><div><span>IMPORTANTE</span><h2>Use somente em uma rede confiável.</h2></div><p>Não exponha as portas locais diretamente à internet. Mantenha um token longo e exclusivo e, para acesso remoto, prefira uma VPN privada.</p></section></main><footer><span>OBS Stream Tools</span><ContactFooter /></footer></div>
}
