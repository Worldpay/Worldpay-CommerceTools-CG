'use strict'

module.exports = async function handler(context, req) {
  context.log.verbose('Worldpay payment request', { req })

  return {
    statusCode: 200,
    body: '[OK]',
  }
}
