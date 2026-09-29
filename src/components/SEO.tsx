import {useEffect} from 'react'

type Props = {
  title: string
  description: string
  path: string
  type?: 'website' | 'product'
}

const configuredSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value))
}

export function SEO({title, description, path, type = 'website'}: Props) {
  useEffect(() => {
    const siteUrl = configuredSiteUrl || window.location.origin
    const canonicalUrl = `${siteUrl}${path === '/' ? '/' : path}`
    const imageUrl = `${siteUrl}/Screenshot1.png`
    document.title = title

    setMeta('meta[name="description"]', {name: 'description', content: description})
    setMeta('meta[name="robots"]', {name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'})
    setMeta('meta[name="keywords"]', {name: 'keywords', content: 'OBS Studio, controle remoto OBS, streaming, cenas OBS, gravação, transmissão ao vivo, OBS WebSocket'})
    setMeta('meta[property="og:title"]', {property: 'og:title', content: title})
    setMeta('meta[property="og:description"]', {property: 'og:description', content: description})
    setMeta('meta[property="og:type"]', {property: 'og:type', content: type})
    setMeta('meta[property="og:locale"]', {property: 'og:locale', content: 'pt_BR'})
    setMeta('meta[property="og:url"]', {property: 'og:url', content: canonicalUrl})
    setMeta('meta[property="og:image"]', {property: 'og:image', content: imageUrl})
    setMeta('meta[property="og:image:alt"]', {property: 'og:image:alt', content: 'Painel do OBS Remote Deck Server conectado ao OBS Studio'})
    setMeta('meta[name="twitter:card"]', {name: 'twitter:card', content: 'summary_large_image'})
    setMeta('meta[name="twitter:title"]', {name: 'twitter:title', content: title})
    setMeta('meta[name="twitter:description"]', {name: 'twitter:description', content: description})
    setMeta('meta[name="twitter:image"]', {name: 'twitter:image', content: imageUrl})

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {'@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Vero Lab', url: 'https://verolabso.com/', email: 'verolabso@gmail.com'},
        {'@type': path === '/' ? 'WebSite' : 'SoftwareApplication', '@id': `${canonicalUrl}#product`, name: path === '/' ? 'OBS Stream Tools' : 'OBS Deck', url: canonicalUrl, description, inLanguage: 'pt-BR', publisher: {'@id': `${siteUrl}/#organization`}, ...(path === '/deck' ? {applicationCategory: 'MultimediaApplication', operatingSystem: 'Web', offers: {'@type': 'Offer', price: '0', priceCurrency: 'BRL'}} : {})},
      ],
    }
    let script = document.head.querySelector<HTMLScriptElement>('script[data-seo-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.seoSchema = 'true'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(structuredData)
  }, [description, path, title, type])

  return null
}
