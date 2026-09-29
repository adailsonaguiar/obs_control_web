import {defineConfig, loadEnv, Plugin} from 'vite'
import react from '@vitejs/plugin-react'

function discoveryFiles(siteUrl: string): Plugin {
  const baseUrl = siteUrl.trim().replace(/\/$/, '')
  return {
    name: 'discovery-files',
    generateBundle() {
      const sitemapReference = baseUrl ? `\nSitemap: ${baseUrl}/sitemap.xml` : ''
      this.emitFile({type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /${sitemapReference}\n`})
      this.emitFile({type: 'asset', fileName: 'llms.txt', source: `# OBS Stream Tools\n\n> Ferramentas web para controlar, automatizar e simplificar transmissões no OBS Studio.\n\n## Produtos\n\n- OBS Deck: controle remoto de cenas, fontes, gravação e transmissão pelo navegador na rede local.\n- OBS Remote Deck Server: aplicativo local que conecta o navegador ao OBS Studio por uma API autenticada.\n\n## Links\n\n- Landing page: ${baseUrl || '/'}\n- OBS Deck: ${baseUrl ? `${baseUrl}/deck` : '/deck'}\n- Download do servidor: https://github.com/adailsonaguiar/obs_control_server/releases\n- Empresa responsável: https://verolabso.com/\n- Contato: verolabso@gmail.com\n`})
      if (baseUrl) this.emitFile({type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>${baseUrl}/deck</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>\n`})
    },
  }
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', 'VITE_')
  return {
    plugins: [react(), discoveryFiles(env.VITE_PUBLIC_SITE_URL || '')],
    server: {host: '0.0.0.0', port: 5175},
    preview: {host: '0.0.0.0', port: 4173},
    build: {target: 'es2022'},
  }
})
