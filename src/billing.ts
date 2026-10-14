export type BillingPlanId = 'ptz-monthly' | 'ptz-yearly'

export type BillingPlan = {
  id: BillingPlanId
  name: string
  description: string
  priceLabel: string
  intervalLabel: string
  features: string[]
  highlight?: boolean
}

export const billingPlans: BillingPlan[] = [
  {id: 'ptz-monthly', name: 'Mensal', description: 'Acesso completo às duas ferramentas com renovação mensal.', priceLabel: 'R$ 20', intervalLabel: '/mês', features: ['OBS Deck completo', 'Controle PTZ completo', 'Uso em celular, tablet e computador', 'Atualizações incluídas']},
  {id: 'ptz-yearly', name: 'Anual', description: 'Doze meses de acesso pagando o equivalente a dez.', priceLabel: 'R$ 200', intervalLabel: '/ano', features: ['OBS Deck completo', 'Controle PTZ completo', '2 meses de economia', 'Atualizações incluídas'], highlight: true},
]

const configuredApiUrl = import.meta.env.VITE_BILLING_API_URL?.trim().replace(/\/$/, '') || ''

export const isBillingConfigured = Boolean(configuredApiUrl)

export type Entitlement = {active: boolean; planId?: BillingPlanId; status?: string; trialEnd?: string; nextChargeAt?: string; currentPeriodEnd?: string; cancelAtPeriodEnd?: boolean}

export async function getCurrentLegalDocuments(options: {apiUrl?: string; fetcher?: typeof fetch} = {}) {
  const apiUrl = (options.apiUrl ?? configuredApiUrl).replace(/\/$/, '')
  if (!apiUrl) throw new Error('O serviço jurídico ainda não foi configurado.')
  const response = await (options.fetcher ?? fetch)(`${apiUrl}/legal-documents/current`)
  if (!response.ok) throw new Error('Não foi possível carregar os documentos vigentes.')
  return response.json() as Promise<{checkoutEnabled: boolean; documents: import('./legal').LegalDocument[]}>
}

export async function createCheckoutSession(
  planId: BillingPlanId,
  options: {apiUrl?: string; fetcher?: typeof fetch; origin?: string; token?: string; legalVersions?: Record<string, string>} = {},
): Promise<string> {
  const apiUrl = (options.apiUrl ?? configuredApiUrl).replace(/\/$/, '')
  if (!apiUrl) throw new Error('O checkout ainda não está disponível.')
  const origin = options.origin ?? window.location.origin

  const response = await (options.fetcher ?? fetch)(`${apiUrl}/checkout-sessions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', ...(options.token ? {Authorization: `Bearer ${options.token}`} : {})},
    body: JSON.stringify({
      planId,
      legalVersions: options.legalVersions,
      successUrl: `${origin}/checkout/sucesso`,
      cancelUrl: `${origin}/checkout/cancelado`,
    }),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as {error?: string}
    if (payload.error === 'legal_documents_outdated') throw new Error('Os documentos foram atualizados. Leia e confirme novamente.')
    if (payload.error === 'checkout_not_enabled') throw new Error('O checkout ainda não foi ativado.')
    throw new Error('Não foi possível iniciar o checkout. Tente novamente.')
  }

  const payload = await response.json() as {checkoutUrl?: string}
  if (!payload.checkoutUrl) throw new Error('O servidor de pagamentos retornou uma resposta inválida.')
  return payload.checkoutUrl
}

export async function getPTZEntitlement(token: string, options: {apiUrl?: string; fetcher?: typeof fetch} = {}) {
  const apiUrl = (options.apiUrl ?? configuredApiUrl).replace(/\/$/, '')
  if (!apiUrl) throw new Error('O serviço de assinaturas ainda não foi configurado.')
  const response = await (options.fetcher ?? fetch)(`${apiUrl}/entitlements/ptz`, {headers: {Authorization: `Bearer ${token}`}})
  if (!response.ok) throw new Error('Não foi possível validar a assinatura.')
  return response.json() as Promise<Entitlement>
}

export async function createBillingPortalSession(token: string, options: {apiUrl?: string; fetcher?: typeof fetch; origin?: string} = {}) {
  const apiUrl = (options.apiUrl ?? configuredApiUrl).replace(/\/$/, '')
  if (!apiUrl) throw new Error('O serviço de assinaturas ainda não foi configurado.')
  const response = await (options.fetcher ?? fetch)(`${apiUrl}/billing-portal-sessions`, {method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify({returnUrl: `${options.origin ?? window.location.origin}/produtos`})})
  if (!response.ok) throw new Error('Não foi possível abrir o portal da assinatura.')
  const payload = await response.json() as {portalUrl?: string}
  if (!payload.portalUrl) throw new Error('O servidor de pagamentos retornou uma resposta inválida.')
  return payload.portalUrl
}
