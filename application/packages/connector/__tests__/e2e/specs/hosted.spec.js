/// <reference types="cypress" />

import { urlDecode, urlFormat } from '../support/helpers'

context('checkout', () => {
  it('Creates a cart and submits a VALID hosted payment', () => {
    cy.createMyCart({ method: 'card' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields
      // Validate before payment submission
      cy.checkPayment(paymentDetails.id).then((validatedPayment) => {
        const customValidatedFields = validatedPayment.custom.fields
        console.log('paymentDetails', paymentDetails)
        console.log('validatedPayment', validatedPayment)
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
      expect(redirectUrl).to.match(urlFormat)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[data-pm="VISA"]').eq(0).click()
      cy.get('#cardNumber').type('4444333322221111')
      cy.get('#cardholderName').clear().type('Test test')
      cy.get('#expiryMonth').type('10')
      cy.get('#expiryYear').type('23')
      cy.get('#securityCode').type('555')
      cy.get('#submitButton').click()
      cy.contains('Thank you, your transaction has been successful.')
    })
  })

  it('Creates a cart and submits an INVALID hosted payment', () => {
    cy.createMyCart({ paymentMethod: 'card' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields
      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter invalid test credentials
      cy.visit(redirectUrl)
      cy.get('[data-pm="VISA"]').eq(0).click()

      cy.get('#cardNumber').type('4444333322221111')
      cy.get('#cardholderName').clear()
      cy.get('#cardholderName').type('ERROR')
      cy.get('#expiryMonth').type('10')
      cy.get('#expiryYear').type('23')
      cy.get('#securityCode').type('555')
      cy.get('#submitButton').click()
      cy.contains('Sorry, there has been a problem processing your transaction. Please try again.')
    })
  })
})
