'use strict'

const log = require('@gradientedge/wcc-logger')
const { Connector, PaymentProcessorException } = require('@gradientedge/wcc-connector')

const connector = new Connector(process.env)

/**
 * Handle incoming requests from commercetools in response to a payment update/create event
 *
 * Returns 200 status on successful processing of the data
 * Returns 415 status if the Content-Type is incorrect
 * Returns 400 status when reporting back errors
 * Returns 500 status when unexpected/serious errors occur
 * Returns 401 status when the bearer token is missing or invalid
 */
module.exports.handler = async function (event, context) {
  try {
    log.debug('Payment event object', event)
    const actions = await connector.paymentProcessor.execute(event, context.headers)
    const response = {
      responseType: 'UpdateRequest',
      actions,
    }
    log.debug('Payment processor response', response)
    return response
  } catch (e) {
    if (e instanceof PaymentProcessorException) {
      /*
       * If the exception is something that can be reported back to Commercetools
       * then a PaymentProcessorException is thrown. Converting this to JSON will
       * result in an array of errors being returned as per the following docs page:
       * https://docs.commercetools.com/http-api-projects-api-extensions#validation-failed
       * The status code returned must be 400.
       */
      log.error('Error processing payment create request', {
        err: e.toString(),
      })
      return {
        responseType: 'FailedValidation',
        errors: [
          {
            code: 'InvalidOperation',
            message: e.message,
            extensionExtraInfo: e,
          },
        ],
      }
    } else {
      /*
       * Any exceptions that aren't an instance of PaymentProcessorException will
       * not be things that we can report back to Commercetools. In this case, a
       * 500 status must be returned.
       */
      log.error('Unexpected error processing payment create request', {
        err: e.toString(),
        stack: e.stack,
      })
      return {
        responseType: 'FailedValidation',
        errors: [
          {
            code: 'InvalidOperation',
            message: 'Unexpected error processing payment create request',
            extensionExtraInfo: e,
          },
        ],
      }
    }
  }
}
