'use strict'

const _ = require('lodash')
const log = require('../utils/log')
const { WORLDPAY_ENVIRONMENTS } = require('../worldpay/constants')

const DEFAULT_LOG_LEVEL = log.defaultLevel
const DEFAULT_PORT = 3000
const DEFAULT_AUTH_REALM = 'Worldpay commercetools extension'

/**
 * Load the config and return it as an object
 *
 * @param options
 * @returns {{}}
 */
class ConfigLoader {
  /**
   * Load the config
   *
   * Expects an object to be passed in that contains the following
   * properties (typically retrieved from environment variables):
   *
   *  - WORLDPAY_EXTENSION_PORT
   *  - WORLDPAY_EXTENSION_LOG_LEVEL
   *  - WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES
   *  - WORLDPAY_EXTENSION_ENDPOINT
   *  - WORLDPAY_EXTENSION_BEARER_TOKEN
   *  - CTP_PROJECT_KEY
   *  - CTP_CLIENT_ID
   *  - CTP_CLIENT_SECRET
   *  - CTP_API_URL
   *  - CTP_AUTH_URL
   *  - WORLDPAY_MERCHANT_CODE
   *  - WORLDPAY_INSTALLATION_ID
   *  - WORLDPAY_XML_USERNAME
   *  - WORLDPAY_XML_PASSWORD
   *  - WORLDPAY_MAC_SECRET
   *  - WORLDPAY_REQUEST_TIMEOUT
   *  - WORLDPAY_ENV
   *  - WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT
   *
   * @param {{}} config - one or more config container objects - multiple objects will be merged
   * @returns {{}}
   */
  load(config) {
    if (_.isUndefined(config) || _.isEmpty(config)) {
      config = process.env
    }

    this.validate(config)

    this.isSystemDebug = config.NODE_ENV === 'development'

    let bootstrapResources = config.WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES
    if (
      _.isEmpty(bootstrapResources) ||
      _.isUndefined(bootstrapResources) ||
      (bootstrapResources !== 'true' && bootstrapResources !== 'force')
    ) {
      bootstrapResources = false
    } else if (bootstrapResources === 'true') {
      bootstrapResources = true
    }

    return {
      system: {
        debug: this.isSystemDebug,
        logLevel: config.WORLDPAY_EXTENSION_LOG_LEVEL || DEFAULT_LOG_LEVEL,
        bootstrapResources,
      },
      server: {
        port: parseInt(config.WORLDPAY_EXTENSION_PORT || DEFAULT_PORT, 10),
        endpoint: config.WORLDPAY_EXTENSION_ENDPOINT,
        bearerToken: config.WORLDPAY_EXTENSION_BEARER_TOKEN,
        authRealm: config.WORLDPAY_EXTENSION_AUTH_REALM || DEFAULT_AUTH_REALM,
      },
      commercetools: {
        projectKey: config.CTP_PROJECT_KEY,
        clientId: config.CTP_CLIENT_ID,
        clientSecret: config.CTP_CLIENT_SECRET,
        apiUrl: config.CTP_API_URL,
        authUrl: config.CTP_AUTH_URL,
      },
      worldpay: {
        merchantCode: config.WORLDPAY_MERCHANT_CODE,
        installationId: config.WORLDPAY_INSTALLATION_ID,
        xmlUsername: config.WORLDPAY_XML_USERNAME,
        xmlPassword: config.WORLDPAY_XML_PASSWORD,
        macSecret: config.WORLDPAY_MAC_SECRET,
        timeout: config.WORLDPAY_REQUEST_TIMEOUT,
        env: config.WORLDPAY_ENV,
        includeFraudSight: config.WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT === 'true',
      },
    }
  }

  /**
   * Lightly validate the config
   *
   * @param {{}} config
   */
  validate(config) {
    if (_.isEmpty(config) || _.isUndefined(config)) {
      throw new Error('`config` parameter is empty or missing')
    }

    this.validateExtensionConfig(config)
    this.validateCommercetoolsConfig(config)
    this.validateWorldpayConfig(config)
  }

  /**
   * Validate the extension config
   *
   * @param {{}} config
   */
  validateExtensionConfig(config) {
    const port = _.get(config, 'WORLDPAY_EXTENSION_PORT', null)
    if (port !== null && isNaN(parseInt(config.WORLDPAY_EXTENSION_PORT, 10))) {
      throw new Error('WORLDPAY_EXTENSION_PORT env var must be a valid integer')
    }

    if (!config.WORLDPAY_EXTENSION_BEARER_TOKEN) {
      log.error('WORLDPAY_EXTENSION_BEARER_TOKEN is missing', { config })
      throw new Error('WORLDPAY_EXTENSION_BEARER_TOKEN is missing')
    }

    if (
      config.WORLDPAY_EXTENSION_AUTH_REALM &&
      /^[a-zA-Z0-9]+[a-zA-Z0-9 ]*$/.test(config.WORLDPAY_EXTENSION_AUTH_REALM) === false
    ) {
      log.error('WORLDPAY_EXTENSION_AUTH_REALM must only contain alphanumerics and spaces', {
        config,
      })
      throw new Error('WORLDPAY_EXTENSION_AUTH_REALM must only contain alphanumerics and spaces')
    }

    if (
      !_.isEmpty(config.WORLDPAY_EXTENSION_LOG_LEVEL) &&
      !_.isUndefined(config.WORLDPAY_EXTENSION_LOG_LEVEL) &&
      !log.levels.hasOwnProperty(config.WORLDPAY_EXTENSION_LOG_LEVEL)
    ) {
      log.error('WORLDPAY_EXTENSION_LOG_LEVEL invalid', { config })
      throw new Error('WORLDPAY_EXTENSION_LOG_LEVEL contains an invalid value')
    }

    if (!config.WORLDPAY_EXTENSION_ENDPOINT) {
      log.error('WORLDPAY_EXTENSION_ENDPOINT is empty', { config })
      throw new Error('WORLDPAY_EXTENSION_ENDPOINT is missing')
    }

    let endpointUrl
    try {
      endpointUrl = new URL(config.WORLDPAY_EXTENSION_ENDPOINT)
    } catch (e) {
      log.error(`WORLDPAY_EXTENSION_ENDPOINT [${config.WORLDPAY_EXTENSION_ENDPOINT}] is invalid`, {
        config,
      })
      throw new Error(
        `WORLDPAY_EXTENSION_ENDPOINT [${config.WORLDPAY_EXTENSION_ENDPOINT}] is invalid`
      )
    }

    if (endpointUrl.protocol !== 'https:') {
      log.error('WORLDPAY_EXTENSION_ENDPOINT must be `https`', { config })
      throw new Error('WORLDPAY_EXTENSION_ENDPOINT must be `https`')
    }
  }

  /**
   * Validate the Commerce Tools config
   *
   * @param {{}} config
   */
  validateCommercetoolsConfig(config) {
    const ctKeys = [
      'CTP_PROJECT_KEY',
      'CTP_CLIENT_ID',
      'CTP_CLIENT_SECRET',
      'CTP_API_URL',
      'CTP_AUTH_URL',
    ]

    ctKeys.forEach((key) => {
      if (_.isEmpty(config[key])) {
        log.debug('Missing Commerce Tools environment variables', { config })
        throw new Error('Not all Commerce Tools environment variables are defined')
      }
    })
  }

  /**
   * Validate the Worldpay config
   *
   * @param {{}} config
   */
  validateWorldpayConfig(config) {
    const missing = []
    const wpKeys = [
      'WORLDPAY_MERCHANT_CODE',
      'WORLDPAY_INSTALLATION_ID',
      'WORLDPAY_XML_USERNAME',
      'WORLDPAY_XML_PASSWORD',
      'WORLDPAY_MAC_SECRET',
      'WORLDPAY_ENV',
      'WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT',
    ]

    wpKeys.forEach((key) => {
      if (_.isEmpty(config[key])) {
        log.debug(`Missing Worldpay environment variable: ${key}`)
        missing.push(key)
      }
    })

    if (missing.length) {
      throw new Error(`Not all Worldpay environment variables are defined: ${missing.toString()}`)
    }

    if (!WORLDPAY_ENVIRONMENTS.hasOwnProperty(config.WORLDPAY_ENV)) {
      log.debug(`Invalid Worldpay environment: ${config.WORLDPAY_ENV}`)
      throw new Error(`Invalid Worldpay environment: ${config.WORLDPAY_ENV}`)
    }
  }
}

module.exports = ConfigLoader
