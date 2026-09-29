import {afterEach, describe, expect, it, vi} from 'vitest'
import {APIError, normalizeSettings, OBSControlAPI} from './api'

afterEach(() => vi.restoreAllMocks())

describe('normalizeSettings', () => {
  it('normaliza protocolo, barra e porta inválida', () => {
    expect(normalizeSettings({host: ' http://192.168.1.20/ ', port: 0, token: ' key '})).toEqual({
      host: '192.168.1.20', port: 3456, token: 'key',
    })
  })
})

describe('OBSControlAPI', () => {
  it('envia o token e codifica nomes de cenas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({sources: []}), {status: 200}))
    const api = new OBSControlAPI({host: '10.0.0.8', port: 3456, token: 'secret'})
    await api.sources('Câmera & Logo')
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('http://10.0.0.8:3456/obs/sources?sceneName=C%C3%A2mera+%26+Logo')
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer secret')
  })

  it('transforma erros da API em mensagens úteis', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({error: 'token inválido'}), {status: 401}))
    const api = new OBSControlAPI({host: 'localhost', port: 3456, token: 'wrong'})
    await expect(api.status()).rejects.toEqual(new APIError('token inválido', 401))
  })

  it('não envia token ao endpoint de saúde', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({status: 'ok'}), {status: 200}))
    await new OBSControlAPI({host: 'localhost', port: 3456, token: 'secret'}).health()
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).has('Authorization')).toBe(false)
  })

  it('carrega a prévia autenticada como imagem', async () => {
    const image = new Blob(['jpeg'], {type: 'image/jpeg'})
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(image, {status: 200}))
    const result = await new OBSControlAPI({host: 'localhost', port: 3456, token: 'secret'}).preview('Cena principal', 640, 50)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:3456/obs/preview?sceneName=Cena+principal&width=640&quality=50')
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer secret')
    expect(result.type).toBe('image/jpeg')
  })
})
