'use strict'

const fs = require('fs')
const path = require('path')

const log = require('../utils/log')

const API_EXTENSION_FILE_PATH = 'api-extension/worldpay-payment-api-extension.json'
const PAYMENT_TYPE_FILE_PATH = 'types/worldpay-payment.json'
const PAYMENT_INTERFACE_INTERACTION_TYPE_FILE_PATH =
  'types/worldpay-payment-interface-interaction.json'
const NOTIFICATION_INTERFACE_INTERACTION_TYPE_FILE_PATH =
  'types/worldpay-notification-interface-interaction.json'

/**
 * Commercetools Bootstrapper
 *
 */
class CommercetoolsBootstrapper {
  /**
   * Constructor
   *
   * @param {CommercetoolsClient} client Commercetools client
   * @param {object} options Config options
   * @param {boolean} options.forceRecreate
   * @param {string} options.resourcesPath
   */
  constructor(client, options) {
    this.client = client
    this.forceRecreate = !!(options && options.forceRecreate)
    this.resourcesPath = options && options.resourcesPath
    this.extensionEndpoint = options && options.extensionEndpoint
    this.bearerToken = options && options.bearerToken

    if (!this.client) {
      throw new Error('`client` parameter is missing')
    }

    if (!this.extensionEndpoint) {
      throw new Error('`options.extensionEndpoint` parameter is missing')
    }

    if (!this.bearerToken) {
      throw new Error('`options.bearerToken` parameter is missing')
    }

    if (!this.resourcesPath || !fs.existsSync(this.resourcesPath)) {
      throw new Error('`options.resourcesPath` is empty or does not exist')
    }
  }

  /**
   * Carry out the bootstrap process
   *
   * @returns {Promise<void>}
   */
  async execute() {
    await this.processApiExtensions()
    await this.processTypes()
  }

  /**
   * Process the API extension
   *
   * This process allows for multiple extensions to be loaded, though
   * currently there is only one we need to worry about.
   *
   * @returns {Promise<>}
   */
  processApiExtensions() {
    const extensions = this.loadApiExtensionsData()
    log.debug('API extension data loaded', { extensions })

    return Promise.all(
      extensions.map(async (definition) => {
        let exists = false
        let existingDef = await this.getExistingApiExtension(definition)
        log.debug('API extension retrieved', { apiExtension: existingDef })
        if (existingDef) {
          exists = true
          if (this.forceRecreate) {
            await this.deleteApiExtension(existingDef.key, existingDef.version)
            log.silly('Deleted API extension', { apiExtension: existingDef })
            exists = false
          }
        }
        if (!exists) {
          const extension = await this.createApiExtension(definition)
          log.debug('API extension created', { apiExtension: extension })
        }
      })
    )
  }

  /**
   * Load the API extension data
   *
   * @returns {[string]}
   */
  loadApiExtensionsData() {
    return [this.readJSONFile(path.resolve(this.resourcesPath, API_EXTENSION_FILE_PATH))]
  }

  /**
   * Create the API extension
   *
   * We need to ensure that the endpoint for the extension is replaced,
   * based on the `extensionEndpoint` property.
   *
   * @param {object} definition API extension definition object
   * @returns {Promise<{}>}
   */
  createApiExtension(definition) {
    definition.destination.url = this.extensionEndpoint
    definition.destination.authentication.headerValue = `Bearer ${this.bearerToken}`
    return this.client.createApiExtension(definition)
  }

  /**
   * Delete the API extension
   *
   * @param {string} key API extension key
   * @param {number} version API extension version
   * @returns {Promise<{}>}
   */
  deleteApiExtension(key, version) {
    return this.client.deleteApiExtensionByKey(key, version)
  }

  /**
   * Get the existing API extension
   *
   * @param {object} definition API extension definition object
   * @returns {Promise<{}>}
   */
  getExistingApiExtension(definition) {
    return this.client.getApiExtensionByKey(definition.key)
  }

  /**
   * Process the types
   *
   * @returns {Promise<>}
   */
  processTypes() {
    const types = this.loadTypesData()

    return Promise.all(
      types.map(async (definition) => {
        let exists = false
        let existingDef = await this.getExistingType(definition)
        log.debug('Type retrieved', { type: existingDef })
        if (existingDef) {
          exists = true
          if (this.forceRecreate) {
            await this.deleteType(existingDef.key, existingDef.version)
            log.silly('Deleted type', { type: existingDef })
            exists = false
          }
        }
        if (!exists) {
          const type = await this.createType(definition)
          log.debug('Type created', { type })
        }
      })
    )
  }

  /**
   * Load the types data
   *
   * @returns {array}
   */
  loadTypesData() {
    return [
      this.readJSONFile(
        `${this.resourcesPath}${path.sep}${PAYMENT_INTERFACE_INTERACTION_TYPE_FILE_PATH}`
      ),
      this.readJSONFile(
        `${this.resourcesPath}${path.sep}${NOTIFICATION_INTERFACE_INTERACTION_TYPE_FILE_PATH}`
      ),
      this.readJSONFile(`${this.resourcesPath}${path.sep}${PAYMENT_TYPE_FILE_PATH}`),
    ]
  }

  /**
   * Create the type
   *
   * @param {object} definition Type definition object
   * @returns {Promise<{}>}
   */
  createType(definition) {
    return this.client.createType(definition)
  }

  /**
   * Delete the type
   *
   * @param {string} key Type key
   * @param {number} version Type version
   * @returns {Promise<{}>}
   */
  deleteType(key, version) {
    return this.client.deleteTypeByKey(key, version)
  }

  /**
   * Get an existing type
   *
   * @param {object} definition API extension definition object
   * @returns {Promise<{}>}
   */
  getExistingType(definition) {
    return this.client.getTypeByKey(definition.key)
  }

  /**
   * Read in a JSON file
   *
   * Primarily exists for ease of stubbing.
   *
   * @param {string} path File system path to the file
   * @returns {object} Object as defined in the JSON file
   */
  readJSONFile(path) {
    return require(path)
  }
}

module.exports = CommercetoolsBootstrapper
