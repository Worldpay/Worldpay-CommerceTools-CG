'use strict'

const { mapPayPalLanguageCodes, mapKlarnaLocaleCodes } = require('../../src/utils/worldPayMapper')

describe('PayPal mapper', () => {
  test('maps the correct language for a given locale', () => {
    const country = 'UK'
    expect(mapPayPalLanguageCodes(country)).toEqual('en')
  })

  test('defaults to English language if there country is unsupported it', () => {
    const country = 'unsupported'
    expect(mapPayPalLanguageCodes(country)).toEqual('en')
  })

  test('defaults to English language if there country is undefined', () => {
    expect(mapPayPalLanguageCodes()).toEqual('en')
  })
})

describe('Klarna locale mapper', () => {
  test('maps the correct language for a given locale', () => {
    const country = 'DE'
    expect(mapKlarnaLocaleCodes(country)).toEqual('de-DE')
  })

  test('defaults to English language if there country is unsupported it', () => {
    const country = 'unsupported'
    expect(mapKlarnaLocaleCodes(country)).toEqual('en-GB')
  })

  xtest('defaults to English language if there country is undefined', () => {
    expect(mapKlarnaLocaleCodes()).toEqual('en-GB')
  })
})
