import ApolloClient from 'apollo-boost'
import { InMemoryCache } from 'apollo-cache-inmemory'
import SdkAuth from '@commercetools/sdk-auth'

const authClient = new SdkAuth({
  projectKey: Cypress.env('WORLDPAY_CONNECTOR_CTP_PROJECT_KEY'),
  credentials: {
    clientId: Cypress.env('WORLDPAY_CONNECTOR_CTP_CLIENT_ID'),
    clientSecret: Cypress.env('WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET'),
  },
  host: Cypress.env('WORLDPAY_CONNECTOR_CTP_AUTH_URL'),
  scopes: Cypress.env('WORLDPAY_CONNECTOR_CTP_SCOPES').split(' '),
})

export default async function createClient() {
  const anonymousToken = await authClient.anonymousFlow()
  const uri = `${Cypress.env('WORLDPAY_CONNECTOR_CTP_API_URL')}/${Cypress.env(
    'WORLDPAY_CONNECTOR_CTP_PROJECT_KEY',
  )}/graphql`
  return new ApolloClient({
    uri,
    headers: {
      authorization: `Bearer ${anonymousToken.access_token}`,
    },
    cache: new InMemoryCache(),
  })
}
