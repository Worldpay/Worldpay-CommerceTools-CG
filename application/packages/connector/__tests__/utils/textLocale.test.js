'use strict'

const { findValueForLocale } = require('../../src/utils/textLocale')

const input = {
  'en-GB': 'UK English version',
  en: 'Generic English version',
  'en-GB-variant1': 'Variant 1 of UK English',
  nl: 'Nederlandse tekst',
  'nl-BE': 'Vlaamse versie',
}

describe('OrderLineBuilder', () => {
  describe('findValueForLocale', () => {
    it('should return the most specific locale if available', () => {
      const result = findValueForLocale(input, 'en-GB-variant1')
      expect(result).toEqual('Variant 1 of UK English')
    })

    it('should return a less specific locale if requested variant is not available', () => {
      const result = findValueForLocale(input, 'en-GB-variant2')
      expect(result).toEqual('UK English version')
    })

    it('should return the most generic locale if nothing else is available', () => {
      const result = findValueForLocale(input, 'en-US-variant1')
      expect(result).toEqual('Generic English version')
    })

    it('should return the most generic locale if requested', () => {
      const result = findValueForLocale(input, 'nl')
      expect(result).toEqual('Nederlandse tekst')
    })

    it('should return undefined if requested locale is unavailable', () => {
      const result = findValueForLocale(input, 'fr')
      expect(result).toBe(undefined)
    })
  })
})
