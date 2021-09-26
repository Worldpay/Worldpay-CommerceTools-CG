'use strict'

module.exports = {
  '@orderCode': '48b39dae-7876-4fb9-9935-cd83166ff415',
  payment: {
    paymentMethod: 'VISA_CREDIT-SSL',
    paymentMethodDetail: {
      card: {
        '@type': 'creditcard',
      },
    },
    amount: {
      '@value': '6800',
      '@currencyCode': 'EUR',
      '@exponent': '2',
      '@debitCreditIndicator': 'credit',
    },
    lastEvent: 'CAPTURED',
    AuthorisationId: {
      '@id': '234359',
    },
    CVCResultCode: {
      '@description': 'NOT SENT TO ACQUIRER',
    },
    AVSResultCode: {
      '@description': 'NOT SENT TO ACQUIRER',
    },
    cardHolderName: {
      $: 'A PERSON',
    },
    issuerCountryCode: 'N/A',
    issuerName: 'UNKNOWN',
    balance: {
      '@accountType': 'IN_PROCESS_CAPTURED',
      amount: {
        '@value': '6800',
        '@currencyCode': 'EUR',
        '@exponent': '2',
        '@debitCreditIndicator': 'credit',
      },
    },
  },
  journal: {
    '@journalType': 'CAPTURED',
    bookingDate: {
      date: {
        '@dayOfMonth': '06',
        '@month': '11',
        '@year': '2020',
      },
    },
    accountTx: [
      {
        '@accountType': 'IN_PROCESS_AUTHORISED',
        '@batchId': '22',
        amount: {
          '@value': '6800',
          '@currencyCode': 'EUR',
          '@exponent': '2',
          '@debitCreditIndicator': 'debit',
        },
      },
      {
        '@accountType': 'IN_PROCESS_CAPTURED',
        '@batchId': '21',
        amount: {
          '@value': '9520',
          '@currencyCode': 'USD',
          '@exponent': '2',
          '@debitCreditIndicator': 'credit',
        },
      },
    ],
  },
}
