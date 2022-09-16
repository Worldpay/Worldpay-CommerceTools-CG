'use strict'

const { lookupISO_3611_2_State, compliesWithISO_3611_2 } = require('../../src/utils/ISO_3611_2')

describe('ISO_3611_2', () => {
  describe('lookupISO_3611_2_State', () => {
    it('should be able to accept undefined', () => {
      const result = lookupISO_3611_2_State(undefined)
      expect(result).toBe(undefined)
    })

    it('should return the code of the state when known (US)', () => {
      const result = lookupISO_3611_2_State('Alabama')
      expect(result).toBe('US-AL')
    })

    it('should return the code of the state when known (CN)', () => {
      const result = lookupISO_3611_2_State('江苏省')
      expect(result).toBe('CN-JS')
    })

    it('should return undefined if the state is unknown', () => {
      const result = lookupISO_3611_2_State('Noord Brabant')
      expect(result).toBe(undefined)
    })
  })

  describe('compliesWithISO_3611_2', () => {
    it("should return false if the state's code is undefined", () => {
      const result = compliesWithISO_3611_2(undefined)
      expect(result).toBe(false)
    })

    it("should return false if the state's code is unknown", () => {
      const result = compliesWithISO_3611_2('CN-SJ')
      expect(result).toBe(false)
    })

    it("should return false if the state's code is known in US", () => {
      const result = compliesWithISO_3611_2('CN-JS')
      expect(result).toBe(true)
    })

    it("should return false if the state's code is known in CN", () => {
      const result = compliesWithISO_3611_2('US-FL')
      expect(result).toBe(true)
    })
  })
})
