/// <reference types="cypress" />

import { iDEALUrlFormat, urlDecode } from '../support/helpers'

context('checkout', () => {
  it('iDEAL is supported', () => {
    cy.createMyCart({ method: 'iDEAL', shopperBankCode: 'RABOBANK' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      // Validate before payment submission
      cy.checkPayment(paymentDetails.id).then((validatedPayment) => {
        const customValidatedFields = validatedPayment.custom.fields
        // Check initial payment states
        expect(validatedPayment.paymentStatus.interfaceCode).to.equal('INITIAL')
        expect(validatedPayment.paymentStatus.interfaceText).to.equal(undefined)
        validatedPayment.transactions.forEach((transaction) => {
          expect(transaction.state).to.equal('Initial')
          expect(transaction.interactionId).to.equal(undefined)
        })

        // Check transaction total matches
        const totalTransactionValue = validatedPayment.transactions
          .map((transaction) => transaction.amount.centAmount)
          .reduce((acc, current) => acc + current)
        expect(totalTransactionValue).to.equal(paymentDetails.totalPrice.centAmount)

        // Check ids
        expect(validatedPayment.id).to.equal(customPaymentFields.worldpayOrderCode)
        expect(validatedPayment.interfaceId).to.equal(customPaymentFields.referenceId)

        // Validate payment method details
        expect(validatedPayment.paymentMethodInfo.paymentInterface).to.equal(
          paymentDetails.paymentMethodInfo.paymentInterface,
        )
        expect(validatedPayment.paymentMethodInfo.method).to.equal(paymentDetails.paymentMethodInfo.method)
        expect(validatedPayment.paymentMethodInfo.card).to.equal(paymentDetails.paymentMethodInfo.card)

        // Validate custom fields
        const fieldsToMatch = [
          'cartId',
          'redirectUrl',
          'languageCode',
          'installationId',
          'merchantCode',
          'referenceId',
          'worldpayOrderCode',
        ]
        fieldsToMatch.forEach((fieldName) => {
          assert.isDefined(customValidatedFields[fieldName])
          expect(customValidatedFields[fieldName]).to.equal(customPaymentFields[fieldName])
        })
        expect(customValidatedFields.merchantCode).to.equal(Cypress.env('WORLDPAY_CONNECTOR_MERCHANT_CODE'))
      })

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('#op-Auth').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=success`)
    })
  })

  it('iDEAL cancellation is supported', () => {
    cy.createMyCart({ method: 'iDEAL', shopperBankCode: 'BUNQ' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      // Validate before payment submission
      cy.checkPayment(paymentDetails.id).then((validatedPayment) => {
        // Check initial payment states
        expect(validatedPayment.paymentStatus.interfaceCode).to.equal('INITIAL')
        expect(validatedPayment.paymentStatus.interfaceText).to.equal(undefined)
      })

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)
      expect(redirectUrl).to.match(iDEALUrlFormat)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('#op-Cancel').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=cancel`)
    })
  })
})
