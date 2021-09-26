'use strict'

const path = require('path')
const ConfigLoader = require('./lib/config/Loader')
const CommercetoolsClient = require('./lib/commercetools/Client')
const CommercetoolsBootstrapper = require('./lib/commercetools/Bootstrapper')
const log = require('./lib/utils/log')

log.level = process.env.WORLDPAY_EXTENSION_LOG_LEVEL

const configLoader = new ConfigLoader()
const config = configLoader.load(process.env)
const commercetoolsClient = new CommercetoolsClient(config.commercetools)

const bootstrapper = new CommercetoolsBootstrapper(commercetoolsClient, {
  extensionEndpoint: config.server.endpoint,
  bearerToken: config.server.bearerToken,
  resourcesPath: path.resolve(__dirname, './resources/commercetools'),
  forceRecreate: process.argv.includes('--force') || process.argv.includes('--force=true'),
})

bootstrapper.execute()
