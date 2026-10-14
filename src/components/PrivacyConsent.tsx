import {useEffect, useState} from 'react'
import {ANALYTICS_CONSENT_KEY, AnalyticsConsent, disableAnalytics, enableAnalytics, readAnalyticsConsent} from '../analytics'

export function openPrivacyPreferences() {
  window.dispatchEvent(new Event('open-privacy-preferences'))
}

export function PrivacyConsent() {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(() => readAnalyticsConsent())
  const [open, setOpen] = useState(() => !consent)

  useEffect(() => {
    if (consent?.choice === 'accepted') enableAnalytics()
    else disableAnalytics()
  }, [consent])

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener('open-privacy-preferences', show)
    return () => window.removeEventListener('open-privacy-preferences', show)
  }, [])

  function decide(choice: AnalyticsConsent['choice']) {
    const next = {choice, decidedAt: Date.now()} as const
    localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(next))
    setConsent(next)
    setOpen(false)
  }

  if (!open) return null
  return <aside className="privacy-consent" aria-label="Preferências de privacidade" role="dialog" aria-modal="false">
    <div><strong>Analytics sob sua escolha</strong><p>Usamos o Google Analytics somente nas páginas públicas e apenas com seu aceite. A recusa não limita conta, compra ou produto. <a href="/privacidade">Saiba como tratamos seus dados.</a></p></div>
    <div className="privacy-actions"><button onClick={() => decide('rejected')}>Recusar</button><button className="primary" onClick={() => decide('accepted')}>Aceitar analytics</button></div>
  </aside>
}
