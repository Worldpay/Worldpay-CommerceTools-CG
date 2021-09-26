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
    lastEvent: 'AUTHORISED',
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
  },
  journal: {
    '@journalType': 'SENT_FOR_AUTHORISATION',
    bookingDate: {
      date: {
        '@dayOfMonth': '06',
        '@month': '11',
        '@year': '2020',
      },
    },
  },
}
