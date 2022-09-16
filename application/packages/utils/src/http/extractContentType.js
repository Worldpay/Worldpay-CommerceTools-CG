'use strict'

const { Headers } = require('http-headers-js')

/**
 * Extract the `content-type` header from the HTTP headers. Remove any
 * `charset` component of the content-type string.
 *
 * @param {string[]} headers map of HTTP header key:value pairs
 */
function extractContentType(headers) {
  if (!headers) {
    return undefined
  }
  const contentType = headers[Headers.CONTENT_TYPE.toLowerCase()]
  if (!contentType || !contentType.length) {
    return undefined
  }

  return contentType.split(';')[0].trim()
}

module.exports = {
  extractContentType,
}
