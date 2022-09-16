'use strict'

/**
 * A Worldpay Mapper to perform map from CommerceTool data into Paypal specifics
 * @param country
 * @returns {string} String representation of the language
 */
function mapPayPalLanguageCodes(country) {
  switch (country) {
    case 'UK':
      return 'en'
    case 'US':
      return 'en'
    case 'DE':
      return 'de'
    case 'FR':
      return 'fr'
    case 'IT':
      return 'it'
    case 'ES':
      return 'es'
    case 'PL':
      return 'pl'
    case 'CN':
      return 'zh'
    default:
      return 'en'
  }
}

/**
 * A Worldpay Mapper to  map Commercetools country into Klarna locales
 * @param country The shopper's country
 * @returns {string} String representation of the locale
 */
function mapKlarnaLocaleCodes(country) {
  switch (country) {
    case 'DE':
      return 'de-DE'
    case 'AT':
      return 'de-AT'
    case 'FI':
      return 'fi-FI'
    case 'NL':
      return 'nl-NL'
    case 'NO':
      return 'nb-NO'
    case 'SE':
      return 'sv-SE'
    case 'GB':
      return 'en-GB'
    case 'DK':
      return 'da-DK'
    default:
      return 'en-GB'
  }
}

module.exports = {
  mapPayPalLanguageCodes,
  mapKlarnaLocaleCodes,
}
