'use strict'

const express = require('express')
const { ResponseCodes, Headers, MimeTypes } = require('http-headers-js')
const log = require('../utils/log')
const auth = require('../middleware/auth')
const PaymentProcessorException = require('../processor/payment/PaymentProcessorException')
const { ROUTE } = require('../constants')

const MIME_TYPE_APPLICATION_HEALTH = 'application/health+json'

/**
 * Http Server - a simple wrapper around express
 *
 */
class HttpServer {
  /**
   * Constructor
   *
   * There are two options that we expect to be passed in:
   *
   *  - port: the port number for the server to run on
   *  - bearerToken: the token we use to authenticate any incoming requests
   *
   * @param {object} processors Map of processors
   * @param {PaymentProcessor} processors.payment An instance of PaymentProcessor
   * @param {NotificationProcessor} processors.notification An instance of NotificationProcessor
   * @param {object} options Configuration options
   */
  constructor(processors, options) {
    if (isNaN(parseInt(options.port, 10))) {
      throw new Error('Invalid port number')
    }
    if (!options.bearerToken) {
      throw new Error('Bearer token is required')
    }
    this.port = options.port
    this.bearerToken = options.bearerToken
    this.paymentProcessor = processors.payment
    this.notificationProcessor = processors.notification
    this.isRunning = false
    this.auth = auth(options.bearerToken, options.authRealm)
    this.runAsServer = options.runAsServer !== false

    this.app = express()
    this.app.use(express.json())
    this.app.use(
      express.text({
        type: 'text/*',
      })
    )

    this.create()
  }

  /**
   * Create the server
   *
   * @returns {HttpServer}
   */
  create() {
    this.app.get(ROUTE.HEALTH, this.healthRouteHandler)

    if (this.paymentProcessor) {
      log.debug('Adding payment route')
      this.app.post(ROUTE.PAYMENT, this.auth, this.paymentRouteHandler.bind(this))
    }

    if (this.notificationProcessor) {
      log.debug('Adding notification route')
      this.app.post(ROUTE.NOTIFICATION, this.notificationRouteHandler.bind(this))
    }

    return this
  }

  /**
   * Handle requests to the health endpoint
   *
   * @param {object} req ExpressJS request object
   * @param {object} res ExpressJS response object
   */
  healthRouteHandler(req, res) {
    res.set(Headers.CONTENT_TYPE, MIME_TYPE_APPLICATION_HEALTH)
    res.status(ResponseCodes.OK).json({ status: 'pass' })
  }

  /**
   * Handle incoming extension API requests from Commercetools
   *
   * Returns 200 status on successful processing of the data
   * Returns 415 status if the Content-Type is incorrect
   * Returns 400 status when reporting back errors
   * Returns 500 status when unexpected/serious errors occur
   * Returns 401 status when the bearer token is missing or invalid
   *
   * @param {object} req ExpressJS request object
   * @param {object} res ExpressJS response object
   */
  async paymentRouteHandler(req, res) {
    let response

    if (req.get(Headers.CONTENT_TYPE) !== MimeTypes.Application.JSON) {
      res.status(ResponseCodes.UNSUPPORTED_MEDIA_TYPE).send('Content-Type must be application/json')
      return
    }

    try {
      response = await this.paymentProcessor.execute(req.body, req.headers)
      log.silly('Payment processor response', { response })
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
        res
          .status(ResponseCodes.INTERNAL_SERVER_ERROR)
          .send('Unexpected error processing payment create request')
      }
    }
  }

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
  async notificationRouteHandler(req, res) {
    let handlers
    log.silly('Notification route request', { req })
    try {
      handlers = this.notificationProcessor.execute(req.body)
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
      log.silly('Notification processor `storage` stage complete', { result })
    } catch (e) {
      log.error('Error storing notification', { err: e.toString(), stack: e.stack, req, res })
      res.status(ResponseCodes.INTERNAL_SERVER_ERROR).send()
      return
    }

    if (handlers.process) {
      try {
        const result = await handlers.process
        log.silly('Notification processor `process` stage complete', { result })
      } catch (e) {
        log.error('Error processing notification', { err: e.toString(), stack: e.stack, req, res })
      }
    }

    res.status(ResponseCodes.OK).send('[OK]')
  }

  /**
   * Start the server
   *
   * Ask the server to start listening in the configured port.
   *
   * @returns {Promise<unknown>}
   */
  start() {
    if (this.runAsServer) {
      /*
       * Note that `this.server` is set to the return value of `this.app.listen`:
       * https://expressjs.com/en/4x/api.html#app.listen which is an instance of `http.Server`:
       * https://nodejs.org/api/http.html#http_class_http_server
       * This is useful as it allows us access to the `close` method which is
       * required for when we want to stop our server.
       */
      return new Promise((resolve) => {
        this.server = this.app.listen(this.port, () => {
          log.info(`Extension listening on port ${this.port}`)
          this.isRunning = true
          resolve(this.app)
        })
      })
    } else {
      log.info('Cannot start a server configured with `runAsServer` set to false')
    }
  }

  /**
   * Stop listening
   *
   * The `this.server` property is of type `http.Server` and so we
   *
   * @returns {Promise<unknown>}
   */
  stop() {
    if (this.runAsServer) {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.isRunning = false
          log.info(`Extension listening on port ${this.port} has been stopped`)
          resolve()
        })
      })
    } else {
      log.info('Cannot stop a server configured with `runAsServer` set to false')
    }
  }

  /**
   * Get the underlying express app
   *
   * This really only exists so that we can grab the app for use
   * with supertest in our test suite.
   *
   * @returns {Express}
   */
  getApp() {
    return this.app
  }
}

module.exports = HttpServer
