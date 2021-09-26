'use strict'

const AWS = require('aws-sdk')
const _ = require('lodash')
const log = require('../log')

const secretsLoader = {}

/**
 * Load one or more secrets from AWS SecretsManager. The IAM role the function is executing within
 * should have access rights to the named secrets.
 * @param {string[]} secretNames - Array of secret names to load from AWS SecretsManager
 * @param {boolean} merge - If true, the inidividual secrets will be merged into a single object
 * containing the combined secret key/value pairs
 */
secretsLoader.loadSecrets = async function (secretNames, merge = true) {
  if (_.isEmpty(secretNames)) {
    return {}
  }

  // Create a Secrets Manager client
  const secretsClient = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
  })

  log.debug('Loading secrets...')
  let secrets
  try {
    secrets = await Promise.all(
      secretNames.map((secretName) => {
        log.debug(`Loading secret [${secretName}]...`)
        return secretsClient.getSecretValue({ SecretId: secretName }).promise()
      })
    )
  } catch (error) {
    log.error(`Failed to load secrets [${secretNames}]`)
    throw error
  }

  secrets = secrets.filter((secret) => !_.isEmpty(secret))
  if (!secrets.length) {
    log.error(`No secrets loaded for [${secretNames}]`)
    throw new Error(`No secrets loaded for [${secretNames}]`)
  }

  secrets = secrets.map((secret) => JSON.parse(secret.SecretString))
  if (merge) {
    log.debug(`Merging ${secrets.length} secrets`)
    secrets = _.merge(...secrets)
  }
  return secrets
}

/**
 * Load a single secret from AWS SecretsManager. The IAM role the function is executing within
 * should have access rights to the named secrets.
 * @param {string[]} secretName - Name of secret to load from AWS SecretsManager
 */
secretsLoader.loadSecret = async function (secretName) {
  return await secretsLoader.loadSecrets([secretName])
}

module.exports = secretsLoader
