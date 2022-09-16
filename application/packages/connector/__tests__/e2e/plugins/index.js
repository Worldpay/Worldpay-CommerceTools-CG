/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  const requiredEnvVars = [
    'WORLDPAY_CONNECTOR_CTP_PROJECT_KEY',
    'WORLDPAY_CONNECTOR_CTP_CLIENT_ID',
    'WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET',
    'WORLDPAY_CONNECTOR_CTP_SCOPES',
    'WORLDPAY_CONNECTOR_CTP_AUTH_URL',
    'WORLDPAY_CONNECTOR_CTP_API_URL',
    'WORLDPAY_CONNECTOR_MERCHANT_CODE',
    'WORLDPAY_CONNECTOR_RETURN_URL',
    'WORLDPAY_CONNECTOR_E2E_TEST_TIMEOUT_MINS',
  ]
  requiredEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      config.env[varName] = process.env[varName]
    } else {
      console.log(`Environment variable ${varName} not found`)
    }
  })
  return config
}
