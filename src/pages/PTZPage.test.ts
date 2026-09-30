import {describe, expect, it} from 'vitest'
import {constrainJoystickVector} from './PTZPage'

describe('constrainJoystickVector', () => {
  it('mantém os dois eixos no modo livre', () => {
    expect(constrainJoystickVector(12, -7, 'free')).toEqual({x: 12, y: -7})
  })

  it('trava o movimento no eixo horizontal', () => {
    expect(constrainJoystickVector(12, -7, 'horizontal')).toEqual({x: 12, y: 0})
  })

  it('trava o movimento no eixo vertical', () => {
    expect(constrainJoystickVector(12, -7, 'vertical')).toEqual({x: 0, y: -7})
  })
})
