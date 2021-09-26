'use strict'

module.exports = {
  '@orderCode': 'b28581de-9c62-4bf8-8d95-01d2f19e587b',
  payment: {
    paymentMethod: 'VISA_CREDIT-SSL',
    paymentMethodDetail: {
      card: {
        '@type': 'creditcard',
      },
    },
    amount: {
      '@value': '13600',
      '@currencyCode': 'EUR',
      '@exponent': '2',
      '@debitCreditIndicator': 'credit',
    },
    lastEvent: 'SETTLED',
    CVCResultCode: {
      '@description': 'NOT SENT TO ACQUIRER',
    },
    AVSResultCode: {
      '@description': 'NOT SENT TO ACQUIRER',
    },
    cardHolderName: {
      $: 'Jimmy Thomson',
    },
    issuerCountryCode: 'N/',
    issuerName: 'UNKNOWN',
    balance: [
      {
        '@accountType': 'SETTLED_BIBIT_COMMISSION',
        amount: {
          '@value': '363',
          '@currencyCode': 'GBP',
          '@exponent': '2',
          '@debitCreditIndicator': 'credit',
        },
      },
      {
        '@accountType': 'SETTLED_BIBIT_NET',
        amount: {
          '@value': '8539',
          '@currencyCode': 'GBP',
          '@exponent': '2',
          '@debitCreditIndicator': 'credit',
        },
      },
    ],
  },
  journal: {
    '@journalType': 'SETTLED',
    '@description': '1 EUR = 0.89015 GBP',
    bookingDate: {
      date: {
        '@dayOfMonth': '19',
        '@month': '10',
        '@year': '2020',
      },
    },
    accountTx: [
      {
        '@accountType': 'IN_PROCESS_CAPTURED',
        '@batchId': '15',
        amount: {
          '@value': '13600',
          '@currencyCode': 'EUR',
          '@exponent': '2',
          '@debitCreditIndicator': 'debit',
        },
      },
      {
        '@accountType': 'SETTLED_BIBIT_NET',
        '@batchId': '5',
        amount: {
          '@value': '11743',
          '@currencyCode': 'GBP',
          '@exponent': '2',
          '@debitCreditIndicator': 'credit',
        },
      },
      {
        '@accountType': 'SETTLED_BIBIT_COMMISSION',
        amount: {
          '@value': '363',
          '@currencyCode': 'GBP',
          '@exponent': '2',
          '@debitCreditIndicator': 'credit',
        },
      },
    ],
  },
}
