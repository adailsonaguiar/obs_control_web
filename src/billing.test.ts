import {describe, expect, it, vi} from 'vitest'
import {createCheckoutSession, getPTZEntitlement} from './billing'

describe('createCheckoutSession', () => {
  it('sends only public checkout data to the billing backend', async () => {
    const fetcher = vi.fn().mockResolvedValue({ok: true, json: async () => ({checkoutUrl: 'https://checkout.example/session'})})
    const checkoutUrl = await createCheckoutSession('ptz-monthly', {apiUrl: 'https://billing.example/', fetcher, origin: 'https://tools.example', token: 'firebase-token'})

    expect(checkoutUrl).toBe('https://checkout.example/session')
    expect(fetcher).toHaveBeenCalledWith('https://billing.example/checkout-sessions', expect.objectContaining({method: 'POST'}))
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(expect.objectContaining({planId: 'ptz-monthly'}))
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
})
