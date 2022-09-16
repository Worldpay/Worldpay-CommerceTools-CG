import gql from 'graphql-tag'

export function payment(client, id) {
  return client
    .query({
      query: gql`
        query payment($id: String) {
          payment(id: $id) {
            id
            createdAt
            interfaceInteractionsRaw {
              results {
                fields {
                  name
                  value
                }
              }
            }
            custom {
              customFieldsRaw {
                name
                value
              }
            }
            interfaceId
            paymentMethodInfo {
              paymentInterface
              method
              name(locale: "en")
            }
            paymentStatus {
              interfaceCode
              interfaceText
            }
            transactions {
              type
              amount {
                type
                currencyCode
                centAmount
                fractionDigits
              }
              interactionId
              state
            }
          }
        }
      `,
      variables: {
        id,
      },
      fetchPolicy: 'network-only',
    })
    .then((response) => response.data.payment)
}
