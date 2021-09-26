'use strict'

const PaymentProcessor = require('./lib/processor/payment/PaymentProcessor')
const NotificationProcessor = require('./lib/processor/notification/NotificationProcessor')
const CommercetoolsClient = require('./lib/commercetools/Client')
const HttpServer = require('./lib/httpserver')
const packageJson = require('./package.json')

let commercetoolsClient
let paymentProcessor
let notificationProcessor
let server

module.exports = (config) => {
  if (server) {
    return server
  }

  commercetoolsClient = new CommercetoolsClient(config.commercetools)

  paymentProcessor = new PaymentProcessor(commercetoolsClient, config.worldpay, {
    key: config.commercetools.projectKey,
    version: packageJson.version,
  })

  notificationProcessor = new NotificationProcessor(commercetoolsClient, config.worldpay)

  server = new HttpServer(
    {
      payment: paymentProcessor,
      notification: notificationProcessor,
    },
    config.server
  )

  return server
}
