'use strict'

const { loadSecrets } = require('./lib/utils/aws/secretsLoader')
const ConfigLoader = require('./lib/config/Loader')
const log = require('./lib/utils/log')
const createServer = require('./createServer')

log.level = process.env.WORLDPAY_EXTENSION_LOG_LEVEL

const configLoader = new ConfigLoader()

let secretNames = process.env.SECRET_NAMES
if (secretNames) {
  secretNames = secretNames.split(',').map((secretName) => secretName.trim())
  loadSecrets(secretNames).then((secrets) => {
    const config = configLoader.load({ ...process.env, ...secrets })
    const server = createServer(config)
    server.start()
  })
}
