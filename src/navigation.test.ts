import {describe, expect, it} from 'vitest'
import {safeLocalReturnTo} from './navigation'

describe('safeLocalReturnTo', () => {
  it('accepts local application paths', () => {
    expect(safeLocalReturnTo('/deck')).toBe('/deck')
    expect(safeLocalReturnTo('/ptz?mode=joystick')).toBe('/ptz?mode=joystick')
  })

  it('rejects external and protocol-relative destinations', () => {
    expect(safeLocalReturnTo('//malicious.example')).toBe('/produtos')
    expect(safeLocalReturnTo('/\\malicious.example')).toBe('/produtos')
    expect(safeLocalReturnTo('https://malicious.example')).toBe('/produtos')
    expect(safeLocalReturnTo(null)).toBe('/produtos')
  })
})
