'use strict'

module.exports = async function handler(context, req) {
  context.log.verbose('Worldpay notification request', { req })

  return {
    statusCode: 200,
    body: '[OK]',
  }
}
