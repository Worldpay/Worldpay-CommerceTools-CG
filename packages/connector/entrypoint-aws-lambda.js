'use strict'

const serverless = require('serverless-http')

const { loadSecrets } = require('./lib/utils/aws/secretsLoader')
const ConfigLoader = require('./lib/config/Loader')
const log = require('./lib/utils/log')
const createServer = require('./createServer')

log.level = process.env.WORLDPAY_EXTENSION_LOG_LEVEL

const configLoader = new ConfigLoader()

const initialisation = new Promise((resolve) => {
  let secrets = {}
  new Promise((resolve) => {
    let secretNames = process.env.SECRET_NAMES
    if (secretNames) {
      secretNames = secretNames.split(',').map((secretName) => secretName.trim())
      loadSecrets(secretNames).then((loadedSecrets) => {
        secrets = loadedSecrets
        resolve()
      })
    } else {
      resolve()
    }
  }).then(() => {
    const config = configLoader.load({ ...process.env, ...secrets })
    const server = createServer(config)
    resolve(
      serverless(server.getApp(), {
        basePath: process.env.WORLDPAY_EXTENSION_API_BASE_PATH,
      })
    )
  })
})

module.exports.handler = async function (event, context) {
  const handler = await initialisation
  return handler(event, context)
}
