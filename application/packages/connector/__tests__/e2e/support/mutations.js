import gql from 'graphql-tag'

export function createMyCart(client, draft) {
  return client
    .mutate({
      mutation: gql`
        mutation createMyCart($draft: MyCartDraft!) {
          createMyCart(draft: $draft) {
            id
            version
          }
        }
      `,
      variables: {
        draft,
      },
    })
    .then((response) => response.data.createMyCart)
}

export function updateMyCart(client, { id, version, actions }) {
  return client
    .mutate({
      mutation: gql`
        mutation updateMyCart($id: String!, $version: Long!, $actions: [MyCartUpdateAction!]!) {
          updateMyCart(id: $id, version: $version, actions: $actions) {
            id
            version
            lineItems {
              id
              name(locale: "en")
              productId
              quantity
            }
            totalPrice {
              type
              centAmount
              fractionDigits
              currencyCode
            }
          }
        }
      `,
      variables: {
        id,
        version,
        actions,
      },
    })
    .then((response) => response.data.updateMyCart)
}

export function createMyPayment(client, draft) {
  return client
    .mutate({
      mutation: gql`
        mutation ($draft: MyPaymentDraft!) {
          createMyPayment(draft: $draft) {
            id
            version
            paymentMethodInfo {
              paymentInterface
              method
            }
            custom {
              customFieldsRaw {
                name
                value
              }
            }
          }
        }
      `,
      variables: {
        draft,
        locale: 'en',
      },
    })
    .then((response) => response.data.createMyPayment)
}

export function createMyOrderFromCart(client, draft) {
  return client
    .mutate({
      mutation: gql`
        mutation ($draft: OrderMyCartCommand!) {
          createMyOrderFromCart(draft: $draft) {
            id
            version
            orderNumber
          }
        }
      `,
      variables: {
        draft,
      },
    })
    .then((response) => response.data.createMyOrderFromCart)
}
