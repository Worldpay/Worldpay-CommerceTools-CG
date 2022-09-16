'use strict'

const express = require('express')
const { ResponseCodes, Headers, MimeTypes } = require('http-headers-js')
const log = require('@gradientedge/wcc-logger')
const { Connector, PaymentProcessorException } = require('@gradientedge/wcc-connector')
const authMiddleware = require('./middleware/auth')

const connector = new Connector(process.env)

const app = express()

app.use(express.json())
app.use(
  express.text({
    type: 'text/*',
  }),
)

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.set(Headers.CONTENT_TYPE, 'application/health+json')
  res.status(ResponseCodes.OK).json({ status: 'pass' })
})

/**
 * Handle incoming requests from commercetools in response to a payment update/create event
 *
 * Returns 200 status on successful processing of the data
 * Returns 415 status if the Content-Type is incorrect
 * Returns 400 status when reporting back errors
 * Returns 500 status when unexpected/serious errors occur
 * Returns 401 status when the bearer token is missing or invalid
 */
app.post(
  '/payment',
  authMiddleware(process.env.PAYMENT_BEARER_TOKEN, process.env.PAYMENT_BEARER_REALM),
  async (req, res) => {
    let response

    if (req.get(Headers.CONTENT_TYPE) !== MimeTypes.Application.JSON) {
      res.status(ResponseCodes.UNSUPPORTED_MEDIA_TYPE).send('Content-Type must be application/json')
      return
    }

    try {
      response = await connector.paymentProcessor.execute(req.body, req.headers)
      log.debug('Payment processor response', { response })
      res.status(ResponseCodes.OK)
      res.send(response)
    } catch (e) {
      if (e instanceof PaymentProcessorException) {
        /*
         * If the exception is something that can be reported back to Commercetools
         * then a PaymentProcessorException is thrown. Converting this to JSON will
         * result in an array of errors being returned as per the following docs page:
         * https://docs.commercetools.com/http-api-projects-api-extensions#validation-failed
         * The status code returned must be 400.
         */
        log.error('Error processing payment create request', { err: e.toString() })
        res.status(ResponseCodes.BAD_REQUEST).json(e)
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
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).send('Unexpected error processing payment create request')
      }
    }
  },
)

/**
 * Handle incoming notification requests from Worldpay
 *
 * Returns 200 status with a body of [OK] unless an exception is thrown
 * Returns 500 status when an exception is thrown
 *
 * In almost all circumstances, a 200 status should be returned. A 500
 * status would only be returned if there is an unexpected exception thrown
 * (perhaps due to a code error).
 *
 * Be aware that the {@see NotificationProcessor.execute} method will return
 * an object containing a 'storage' and 'process' property. Each one will
 * resolve when that particular stage is complete. Note that the `process`
 * promise will only resolve once the storage stage is complete. The response
 * is sent to Worldpay as soon as a successful response is received back from
 * the `storage` promise.
 *
 * @param {object} req ExpressJS request object
 * @param {object} res ExpressJS response object
 */
app.post('/notification', async (req, res) => {
  let handlers
  log.debug('Notification route request', { req })
  try {
    handlers = connector.notificationProcessor.execute(req.body)
  } catch (e) {
    log.error('Error calling `execute` on notification processor', {
      err: e.toString(),
      stack: e.stack,
      req,
      res,
    })
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).send()
    return
  }

  try {
    const result = await handlers.storage
    log.debug('Notification processor `storage` stage complete', { result })
  } catch (e) {
    log.error('Error storing notification', { err: e.toString(), stack: e.stack, req, res })
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).send()
    return
  }

  if (handlers.process) {
    try {
      const result = await handlers.process
      log.debug('Notification processor `process` stage complete', { result })
    } catch (e) {
      log.error('Error processing notification', { err: e.toString(), stack: e.stack, req, res })
    }
  }

  res.status(ResponseCodes.OK).send('[OK]')
})

app.listen(process.env.DOCKER_SERVER_PORT, () => {
  log.info(`Extension listening on port ${process.env.DOCKER_SERVER_PORT}`)
})
