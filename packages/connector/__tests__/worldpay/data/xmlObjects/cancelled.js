'use strict'

module.exports = {
  '@orderCode': '2ec33dad-4765-4b9f-ae31-9acfb7aa5741',
  payment: {
    paymentMethod: 'ECMC-SSL',
    paymentMethodDetail: {
      card: {
        '@type': 'creditcard',
      },
    },
    amount: {
      '@value': '12800',
      '@currencyCode': 'EUR',
      '@exponent': '2',
      '@debitCreditIndicator': 'credit',
    },
    lastEvent: 'CANCELLED',
    AuthorisationId: {
      '@id': '583044',
    },
    CVCResultCode: {
      '@description': 'NOT SENT TO ACQUIRER',
    },
    AVSResultCode: {
      '@description': 'NOT SENT TO ACQUIRER',
    },
    cardHolderName: {
      $: 'Test',
    },
    issuerCountryCode: 'N/A',
    issuerName: 'UNKNOWN',
    balance: {
      '@accountType': 'IN_PROCESS_AUTHORISED',
      amount: {
        '@value': '12800',
        '@currencyCode': 'EUR',
        '@exponent': '2',
        '@debitCreditIndicator': 'credit',
      },
    },
  },
  journal: {
    '@journalType': 'CANCELLED',
    bookingDate: {
      date: {
        '@dayOfMonth': '13',
        '@month': '11',
        '@year': '2020',
      },
    },
    accountTx: {
      '@accountType': 'IN_PROCESS_AUTHORISED',
      '@batchId': '25',
      amount: {
        '@value': '12800',
        '@currencyCode': 'EUR',
        '@exponent': '2',
        '@debitCreditIndicator': 'debit',
      },
    },
  },
}
