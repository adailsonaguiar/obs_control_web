import {describe, expect, it, vi} from 'vitest'
import {createBillingPortalSession, createCheckoutSession, getCurrentLegalDocuments, getPTZEntitlement} from './billing'

describe('createCheckoutSession', () => {
  it('sends only public checkout data to the billing backend', async () => {
    const fetcher = vi.fn().mockResolvedValue({ok: true, json: async () => ({checkoutUrl: 'https://checkout.example/session'})})
    const checkoutUrl = await createCheckoutSession('ptz-monthly', {apiUrl: 'https://billing.example/', fetcher, origin: 'https://tools.example', token: 'firebase-token', legalVersions: {terms: '1.0', privacy: '1.0', cancellation: '1.0'}})

    expect(checkoutUrl).toBe('https://checkout.example/session')
    expect(fetcher).toHaveBeenCalledWith('https://billing.example/checkout-sessions', expect.objectContaining({method: 'POST'}))
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(expect.objectContaining({planId: 'ptz-monthly'}))
    expect(JSON.parse(fetcher.mock.calls[0][1].body).legalVersions).toEqual({terms: '1.0', privacy: '1.0', cancellation: '1.0'})
    expect(fetcher.mock.calls[0][1].headers).toEqual(expect.objectContaining({Authorization: 'Bearer firebase-token'}))
  })

  it('requires a configured billing backend', async () => {
    await expect(createCheckoutSession('ptz-monthly', {apiUrl: ''})).rejects.toThrow('checkout ainda não está disponível')
  })

  it('validates PTZ access with the Firebase token', async () => {
    const fetcher = vi.fn().mockResolvedValue({ok: true, json: async () => ({active: true, planId: 'ptz-yearly'})})
    await expect(getPTZEntitlement('token', {apiUrl: 'https://billing.example/', fetcher})).resolves.toEqual({active: true, planId: 'ptz-yearly'})
    expect(fetcher).toHaveBeenCalledWith('https://billing.example/entitlements/ptz', {headers: {Authorization: 'Bearer token'}})
  })

  it('loads authoritative legal document versions', async () => {
    const payload = {checkoutEnabled: false, documents: [{type: 'terms', version: 'draft-0.1'}]}
    const fetcher = vi.fn().mockResolvedValue({ok: true, json: async () => payload})
    await expect(getCurrentLegalDocuments({apiUrl: 'https://billing.example', fetcher})).resolves.toEqual(payload)
  })

  it('creates an authenticated self-service portal session', async () => {
    const fetcher = vi.fn().mockResolvedValue({ok: true, json: async () => ({portalUrl: 'https://billing.stripe.com/session'})})
    await expect(createBillingPortalSession('token', {apiUrl: 'https://billing.example', fetcher, origin: 'https://tools.example'})).resolves.toBe('https://billing.stripe.com/session')
    expect(fetcher).toHaveBeenCalledWith('https://billing.example/billing-portal-sessions', expect.objectContaining({method: 'POST', headers: expect.objectContaining({Authorization: 'Bearer token'})}))
  })

  it('asks for fresh confirmation when legal versions are stale', async () => {
    const fetcher = vi.fn().mockResolvedValue({ok: false, json: async () => ({error: 'legal_documents_outdated'})})
    await expect(createCheckoutSession('ptz-monthly', {apiUrl: 'https://billing.example', fetcher, origin: 'https://tools.example'})).rejects.toThrow('documentos foram atualizados')
  })
})
