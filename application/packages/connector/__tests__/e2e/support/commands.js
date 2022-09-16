import createClient from './apolloClient'
import * as mutation from './mutations'
import { cartDraft, updateMyCartAction, paymentArguments } from './data'
import payments from '../commercetools/payments'

const CYPRESS_COMMAND_TIMEOUT = 10000
const clientPromise = createClient()

Cypress.Commands.add('createMyCart', (paymentData = {}) => {
  cy.wrap(
    clientPromise.then((client) =>
      mutation.createMyCart(client, cartDraft).then((cart) =>
        mutation
          .updateMyCart(client, {
            id: cart.id,
            version: cart.version,
            actions: updateMyCartAction,
          })
          .then(async (initialCartUpdate) => {
            paymentData = { ...paymentData, ip: '0.0.0.0', method: paymentData?.method ?? 'card' }
            const draft = paymentArguments(initialCartUpdate.id, paymentData)
            draft.paymentMethodInfo.method = paymentData.method
            const payment = await payments.createItem(draft)

            // Link the payment to the customer's cart
            return mutation
              .updateMyCart(client, {
                id: cart.id,
                version: initialCartUpdate.version,
                actions: [
                  {
                    addPayment: {
                      payment: {
                        typeId: 'payment',
                        id: payment.id,
                      },
                    },
                  },
                ],
              })
              .then((nextCartUpdate) => {
                return {
                  ...payment,
                  totalPrice: nextCartUpdate.totalPrice,
                  cartVersion: nextCartUpdate.version,
                }
              })
          }),
      ),
    ),
    { timeout: CYPRESS_COMMAND_TIMEOUT },
  )
})

Cypress.Commands.add('checkPayment', (paymentId) => {
  cy.wrap(
    clientPromise.then(async () => await payments.getItem({ id: paymentId })),
    { timeout: CYPRESS_COMMAND_TIMEOUT },
  )
})

Cypress.Commands.add('createMyOrderFromCart', (draft) => {
  cy.wrap(
    clientPromise.then((client) =>
      mutation.createMyOrderFromCart(client, draft).then((order) => {
        return order
      }),
    ),
    { timeout: CYPRESS_COMMAND_TIMEOUT },
  )
})
