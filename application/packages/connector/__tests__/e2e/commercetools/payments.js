/* eslint-disable no-shadow */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import { withToken, fetchJson, makeConfig, baseUrl } from './api'
import { v4 as uuid } from 'uuid'

const payments = {
  createItem: withToken((body, accessToken) =>
    fetchJson(`${baseUrl}/me/payments`, {
      ...makeConfig(accessToken),
      method: 'POST',
      body: JSON.stringify(body),
    }),
  ),
  getItem: withToken(({ id }, accessToken) =>
    fetchJson(`${baseUrl}/payments/${id}`, {
      ...makeConfig(accessToken),
      method: 'GET',
    }),
  ),
  deleteItem: withToken(({ id, version }, accessToken) => {
    const url = new URL(`${baseUrl}/payments/${id}`)
    url.searchParams.append('version', version)
    url.searchParams.append('dataErasure', true)
    fetchJson(url, {
      ...makeConfig(accessToken),
      method: 'DELETE',
    })
  }),
  updateItem: withToken(({ id, version, amount, paymentMethod }, accessToken) =>
    fetchJson(`${baseUrl}/me/payments/${id}`, {
      ...makeConfig(accessToken),
      method: 'POST',
      body: JSON.stringify({
        version,
        actions: [
          {
            action: 'setCustomField',
            name: 'makePaymentRequest',
            value: JSON.stringify({
              amount,
              reference: uuid(),
              paymentMethod,
              merchantAccount: process.env.VUE_APP_ADYEN_MERCHANT_ACCOUNT,
            }),
          },
          {
            action: 'setStatusInterfaceCode',
            interfaceCode: 'paid',
          },
        ],
      }),
    }),
  ),
  updatePaymentData: withToken(({ id, version, paymentData }, accessToken) => {
    const newData = JSON.stringify(paymentData)
    fetchJson(`${baseUrl}/me/payments/${id}`, {
      ...makeConfig(accessToken),
      method: 'POST',
      body: JSON.stringify({
        version,
        actions: [
          {
            action: 'setCustomField',
            name: 'paymentData',
            value: newData,
          },
        ],
      }),
    })
  }),
}

export default payments
