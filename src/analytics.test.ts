import {describe, expect, it, vi} from 'vitest'
import {ANALYTICS_CONSENT_KEY, CONSENT_MAX_AGE_MS, isPublicAnalyticsPath, readAnalyticsConsent} from './analytics'

function storage(value: string | null) { return {getItem: vi.fn(() => value), removeItem: vi.fn()} }

describe('analytics consent', () => {
  it('accepts a current choice and expires it after six months', () => {
    const decidedAt = 1_000
    expect(readAnalyticsConsent(storage(JSON.stringify({choice: 'rejected', decidedAt})), decidedAt + 1)).toEqual({choice: 'rejected', decidedAt})
    const expired = storage(JSON.stringify({choice: 'accepted', decidedAt}))
    expect(readAnalyticsConsent(expired, decidedAt + CONSENT_MAX_AGE_MS)).toBeNull()
    expect(expired.removeItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_KEY)
  })

  it('restricts analytics to public pages', () => {
    expect(isPublicAnalyticsPath('/')).toBe(true)
    expect(isPublicAnalyticsPath('/termos/')).toBe(true)
    expect(isPublicAnalyticsPath('/produtos')).toBe(false)
    expect(isPublicAnalyticsPath('/deck')).toBe(false)
    expect(isPublicAnalyticsPath('/ptz')).toBe(false)
  })
})
