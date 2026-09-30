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
  {id: 'ptz-monthly', name: 'Mensal', description: 'Flexibilidade para começar e cancelar quando quiser.', priceLabel: 'R$ 20', intervalLabel: '/mês', features: ['Controle de múltiplas câmeras', 'Joystick, setas e zoom', 'Presets por câmera', 'Atualizações do PTZ Pro']},
  {id: 'ptz-yearly', name: 'Anual', description: 'Doze meses de controle pagando o equivalente a dez.', priceLabel: 'R$ 200', intervalLabel: '/ano', features: ['Tudo do plano mensal', '2 meses de economia', 'Uma renovação por ano', 'Atualizações do PTZ Pro'], highlight: true},
]

const configuredApiUrl = import.meta.env.VITE_BILLING_API_URL?.trim().replace(/\/$/, '') || ''

export const isBillingConfigured = Boolean(configuredApiUrl)

export async function createCheckoutSession(
  planId: BillingPlanId,
  options: {apiUrl?: string; fetcher?: typeof fetch; origin?: string; token?: string} = {},
): Promise<string> {
  const apiUrl = (options.apiUrl ?? configuredApiUrl).replace(/\/$/, '')
  if (!apiUrl) throw new Error('O checkout ainda não está disponível.')
  const origin = options.origin ?? window.location.origin

  const response = await (options.fetcher ?? fetch)(`${apiUrl}/checkout-sessions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', ...(options.token ? {Authorization: `Bearer ${options.token}`} : {})},
    body: JSON.stringify({
      planId,
      successUrl: `${origin}/checkout/sucesso`,
      cancelUrl: `${origin}/checkout/cancelado`,
    }),
  })
  if (!response.ok) throw new Error('Não foi possível iniciar o checkout. Tente novamente.')

  const payload = await response.json() as {checkoutUrl?: string}
  if (!payload.checkoutUrl) throw new Error('O servidor de pagamentos retornou uma resposta inválida.')
  return payload.checkoutUrl
}

export async function getPTZEntitlement(token: string, options: {apiUrl?: string; fetcher?: typeof fetch} = {}) {
  const apiUrl = (options.apiUrl ?? configuredApiUrl).replace(/\/$/, '')
  if (!apiUrl) throw new Error('O serviço de assinaturas ainda não foi configurado.')
  const response = await (options.fetcher ?? fetch)(`${apiUrl}/entitlements/ptz`, {headers: {Authorization: `Bearer ${token}`}})
  if (!response.ok) throw new Error('Não foi possível validar a assinatura.')
  return response.json() as Promise<{active: boolean; planId?: BillingPlanId; currentPeriodEnd?: string}>
}
