import {describe, expect, it, vi} from 'vitest'
import {createCheckoutSession} from './billing'

describe('createCheckoutSession', () => {
  it('sends only public checkout data to the billing backend', async () => {
    const fetcher = vi.fn().mockResolvedValue({ok: true, json: async () => ({checkoutUrl: 'https://checkout.example/session'})})
    const checkoutUrl = await createCheckoutSession('obs-tools-pro', {apiUrl: 'https://billing.example/', fetcher, origin: 'https://tools.example'})

    expect(checkoutUrl).toBe('https://checkout.example/session')
    expect(fetcher).toHaveBeenCalledWith('https://billing.example/checkout-sessions', expect.objectContaining({method: 'POST'}))
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(expect.objectContaining({planId: 'obs-tools-pro'}))
  })

  it('requires a configured billing backend', async () => {
    await expect(createCheckoutSession('obs-tools-pro', {apiUrl: ''})).rejects.toThrow('checkout ainda não está disponível')
  })
})
