'use strict'

const PaymentProcessor = require('./processor/payment/PaymentProcessor')
const NotificationProcessor = require('./processor/notification/NotificationProcessor')
const CommercetoolsClient = require('./commercetools/Client')
const ConfigLoader = require('./config/Loader')

class Connector {
  constructor(config) {
    const configLoader = new ConfigLoader()
    this.config = configLoader.load(config)
    this.commercetoolsClient = new CommercetoolsClient(this.config.commercetools)

    this.paymentProcessor = new PaymentProcessor(this.commercetoolsClient, this.config.worldpay, {
      key: this.config.commercetools.projectKey,
    })

    this.notificationProcessor = new NotificationProcessor(this.commercetoolsClient, this.config.worldpay)
  }
}

module.exports = Connector
