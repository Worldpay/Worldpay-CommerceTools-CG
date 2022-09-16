'use strict'

const _ = require('lodash')
const log = require('@gradientedge/wcc-logger')
const { LOG_LEVEL } = require('@gradientedge/wcc-logger')
const { WORLDPAY_ENVIRONMENTS } = require('../worldpay/constants')

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
   * Expects an object to be passed in that contains the properties defined in
   * ({@link file:///../../../../docs/USER_GUIDE.md USER_GUIDE.md}). Typically values are retrieved from
   * environment variables
   *
   * @param {{}} config - complete configuration object
   * @returns {{}}
   */
  load(config) {
    if (_.isUndefined(config) || _.isEmpty(config)) {
      config = process.env
    }

    this.validate(config)

    return {
      system: {
        logLevel: config.WORLDPAY_CONNECTOR_LOG_LEVEL || LOG_LEVEL.DEFAULT,
      },
      commercetools: {
        projectKey: config.WORLDPAY_CONNECTOR_CTP_PROJECT_KEY,
        clientId: config.WORLDPAY_CONNECTOR_CTP_CLIENT_ID,
        clientSecret: config.WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET,
        apiUrl: config.WORLDPAY_CONNECTOR_CTP_API_URL,
        authUrl: config.WORLDPAY_CONNECTOR_CTP_AUTH_URL,
      },
      worldpay: {
        merchantCode: config.WORLDPAY_CONNECTOR_MERCHANT_CODE,
        installationId: config.WORLDPAY_CONNECTOR_INSTALLATION_ID,
        xmlUsername: config.WORLDPAY_CONNECTOR_XML_USERNAME,
        xmlPassword: config.WORLDPAY_CONNECTOR_XML_PASSWORD,
        macSecret: config.WORLDPAY_CONNECTOR_MAC_SECRET,
        timeout: config.WORLDPAY_CONNECTOR_REQUEST_TIMEOUT,
        captureDelay: config.WORLDPAY_CONNECTOR_CAPTURE_DELAY,
        env: config.WORLDPAY_CONNECTOR_ENV,
        exemptionEnabled: config.WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE === 'true',
        exemptionType: config.WORLDPAY_CONNECTOR_EXEMPTION_TYPE,
        exemptionPlacement: config.WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT,
        includeFraudSight: config.WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT === 'true',
        enableTokenisation: config.WORLDPAY_CONNECTOR_ENABLE_TOKENISATION === 'true',
        spacesInPaypalDescription: config.WORLDPAY_CONNECTOR_SPACES_IN_PAYPAL_DESCRIPTION === 'true',
        termsURL: config.WORLDPAY_CONNECTOR_TERMS_URL ?? 'https://www.myshop.com/terms-and-conditions',
        returnURL: config.WORLDPAY_CONNECTOR_RETURN_URL,
        mapStateToISOCode: config.WORLDPAY_CONNECTOR_MAP_STATE_TO_ISO_3611_2 === 'true',
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
    const logLevels = Object.values(LOG_LEVEL)
    if (
      !_.isEmpty(config.WORLDPAY_CONNECTOR_LOG_LEVEL) &&
      !_.isUndefined(config.WORLDPAY_CONNECTOR_LOG_LEVEL) &&
      !logLevels.includes(config.WORLDPAY_CONNECTOR_LOG_LEVEL)
    ) {
      log.error('WORLDPAY_CONNECTOR_LOG_LEVEL invalid', { config })
      throw new Error('WORLDPAY_CONNECTOR_LOG_LEVEL contains an invalid value')
    }
  }

  /**
   * Validate the Commerce Tools config
   *
   * @param {{}} config
   */
  validateCommercetoolsConfig(config) {
    const missing = []
    const ctKeys = [
      'WORLDPAY_CONNECTOR_CTP_PROJECT_KEY',
      'WORLDPAY_CONNECTOR_CTP_CLIENT_ID',
      'WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET',
      'WORLDPAY_CONNECTOR_CTP_API_URL',
      'WORLDPAY_CONNECTOR_CTP_AUTH_URL',
      'WORLDPAY_CONNECTOR_TERMS_URL',
      'WORLDPAY_CONNECTOR_RETURN_URL',
    ]

    ctKeys.forEach((key) => {
      if (_.isEmpty(config[key])) {
        log.debug(`Missing Commerce Tools environment variable: ${key}`)
        missing.push(key)
      }
    })

    if (missing.length) {
      throw new Error(`Not all Commerce Tools environment variables are defined: ${missing.toString()}`)
    }
  }

  /**
   * Validate the Worldpay config
   *
   * @param {{}} config
   */
  validateWorldpayConfig(config) {
    const missing = []
    const wpKeys = [
      'WORLDPAY_CONNECTOR_MERCHANT_CODE',
      'WORLDPAY_CONNECTOR_INSTALLATION_ID',
      'WORLDPAY_CONNECTOR_XML_USERNAME',
      'WORLDPAY_CONNECTOR_XML_PASSWORD',
      'WORLDPAY_CONNECTOR_MAC_SECRET',
      'WORLDPAY_CONNECTOR_ENV',
      'WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT',
      'WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE',
      'WORLDPAY_CONNECTOR_EXEMPTION_TYPE',
      'WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT',
      'WORLDPAY_CONNECTOR_ENABLE_TOKENISATION',
      'WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID',
      'WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN',
      'WORLDPAY_CONNECTOR_MERCHANT_NAME',
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

    if (!WORLDPAY_ENVIRONMENTS.hasOwnProperty(config.WORLDPAY_CONNECTOR_ENV)) {
      log.debug(`Invalid Worldpay environment: ${config.WORLDPAY_CONNECTOR_ENV}`)
      throw new Error(`Invalid Worldpay environment: ${config.WORLDPAY_CONNECTOR_ENV}`)
    }
  }
}

module.exports = ConfigLoader
