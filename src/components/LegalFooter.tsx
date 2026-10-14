import {legalLinks, supplier} from '../legal'
import {openPrivacyPreferences} from './PrivacyConsent'

export function LegalFooter({compact = false}: {compact?: boolean}) {
  return <div className={`legal-footer ${compact ? 'compact' : ''}`}>
    <div><strong>{supplier.legalName}</strong><span>{supplier.tradeName} · CNPJ {supplier.cnpj}</span><span>{supplier.address}</span><a href={`mailto:${supplier.email}`}>{supplier.email}</a></div>
    <nav aria-label="Informações jurídicas"><a href={legalLinks.terms}>Termos de Uso</a><a href={legalLinks.privacy}>Privacidade</a><a href={legalLinks.cancellation}>Cancelamento e reembolso</a><button type="button" onClick={openPrivacyPreferences}>Preferências de privacidade</button></nav>
  </div>
}
