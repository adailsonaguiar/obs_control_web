export type BillingPlanId = 'obs-tools-pro'

export type BillingPlan = {
  id: BillingPlanId
  name: string
  description: string
  priceLabel: string
  features: string[]
}

export const billingPlans: BillingPlan[] = [{
  id: 'obs-tools-pro',
  name: 'Pro',
  description: 'Para criadores que querem ampliar e automatizar sua operação.',
  priceLabel: 'Em breve',
  features: ['Todos os recursos gratuitos', 'Automações de produção', 'Novas ferramentas premium', 'Suporte prioritário'],
}]

const configuredApiUrl = import.meta.env.VITE_BILLING_API_URL?.trim().replace(/\/$/, '') || ''

export const isBillingConfigured = Boolean(configuredApiUrl)

export async function createCheckoutSession(
  planId: BillingPlanId,
  options: {apiUrl?: string; fetcher?: typeof fetch; origin?: string} = {},
): Promise<string> {
  const apiUrl = (options.apiUrl ?? configuredApiUrl).replace(/\/$/, '')
  if (!apiUrl) throw new Error('O checkout ainda não está disponível.')
  const origin = options.origin ?? window.location.origin

  const response = await (options.fetcher ?? fetch)(`${apiUrl}/checkout-sessions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      planId,
      successUrl: `${origin}/?checkout=success`,
      cancelUrl: `${origin}/?checkout=cancelled`,
    }),
  })
  if (!response.ok) throw new Error('Não foi possível iniciar o checkout. Tente novamente.')

  const payload = await response.json() as {checkoutUrl?: string}
  if (!payload.checkoutUrl) throw new Error('O servidor de pagamentos retornou uma resposta inválida.')
  return payload.checkoutUrl
}
