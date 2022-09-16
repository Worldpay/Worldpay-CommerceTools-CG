'use strict'

/**
 * Given a map of locale -> string find the entry best matching the given locale
 * @param {Map<string, string>} name A map of locale to string
 * @param {string} locale The locale of the user
 * @returns {string} The best matching entry (use
 */
function findValueForLocale(name, locale) {
  if (name[locale]) {
    return name[locale]
  }
  if (locale.indexOf('-') >= 0) {
    return findValueForLocale(name, locale.substring(0, locale.lastIndexOf('-')))
  }
  return undefined
}

module.exports = { findValueForLocale }
