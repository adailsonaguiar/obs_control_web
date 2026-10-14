export type LegalDocumentType = 'terms' | 'privacy' | 'cancellation'

export type LegalDocument = {
  type: LegalDocumentType
  title: string
  version: string
  effectiveAt: string
  url: string
  hash: string
}

export const legalLinks = {
  terms: '/termos',
  privacy: '/privacidade',
  cancellation: '/cancelamento-e-reembolso',
} as const

export const supplier = {
  legalName: 'VEROLAB SOLUCOES EM TECNOLOGIA LTDA - ME',
  tradeName: 'VEROLAB',
  cnpj: '64.491.841/0001-21',
  address: 'QD ARSO 101 AL 12 QI 08 LT 07 A 7A, Plano Diretor Sul, CEP 77018-410, Palmas/TO',
  email: 'verolabso@gmail.com',
} as const

export const publicPaths = new Set([
  '/', '/entrar', '/assinar', '/termos', '/privacidade', '/cancelamento-e-reembolso',
  '/como-usar/obs-deck', '/como-usar/ptz', '/checkout/sucesso', '/checkout/cancelado',
])
