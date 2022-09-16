// import config from '../../sunrise.config'
import { getAuthToken } from './auth'
import { fetch } from 'apollo-env'
export const fetchJson = (...args) =>
  fetch(...args).then((result) => {
    if (result.status === 401) {
      // eslint-disable-next-line no-throw-literal
      throw { statusCode: 401 }
    }
    return result.json()
  })

export const baseUrl = `${Cypress.env('WORLDPAY_CONNECTOR_CTP_API_URL')}/${Cypress.env(
  'WORLDPAY_CONNECTOR_CTP_PROJECT_KEY',
)}`
export const withToken = (() => {
  let tries = 0
  return function tryRequest(fn, error) {
    const doRequest = (...args) =>
      getAuthToken(error)
        .then((tk) => fn(...args.concat(tk)))
        .catch((err) => {
          tries += 1
          if (err.statusCode === 401 && tries < 3) {
            return tryRequest(fn, true)(...args)
          }
          throw err
        })
    return doRequest
  }
})()
export const makeConfig = (token) => ({
  headers: {
    accept: '*/*',
    authorization: token,
    'content-type': 'application/json',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
  },
  mode: 'cors',
})
