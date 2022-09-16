/// <reference types="cypress" />

import { urlDecode } from '../support/helpers'

context('checkout', () => {
  function checkCommonFields(paymentDetails, customPaymentFields) {
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
  }

  it('Klarna Pay Now is supported', () => {
    cy.createMyCart({ method: 'klarnaPayNow' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      checkCommonFields(paymentDetails, customPaymentFields)

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[name="continue"]').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=success`)
    })
  })

  it('Klarna Pay Now cancel is supported', () => {
    cy.createMyCart({ method: 'klarnaPayNow' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      checkCommonFields(paymentDetails, customPaymentFields)

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[name="status"]').select('CANCEL')
      cy.get('[name="continue"]').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=cancel`)
    })
  })

  it('Klarna Pay Now refused is supported', () => {
    cy.createMyCart({ method: 'klarnaPayNow' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      checkCommonFields(paymentDetails, customPaymentFields)

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[name="status"]').select('REFUSED')
      cy.get('[name="continue"]').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=failure`)
    })
  })

  it('Klarna Pay Now error is supported', () => {
    cy.createMyCart({ method: 'klarnaPayNow' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      checkCommonFields(paymentDetails, customPaymentFields)

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[name="status"]').select('ERROR')
      cy.get('[name="continue"]').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=failure`)
    })
  })

  it('Klarna Pay Now pending is supported', () => {
    cy.createMyCart({ method: 'klarnaPayNow' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      checkCommonFields(paymentDetails, customPaymentFields)

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[name="status"]').select('PENDING')
      cy.get('[name="continue"]').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=pending`)
    })
  })

  it('Klarna Pay Later is supported', () => {
    cy.createMyCart({ method: 'klarnaPayLater' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      checkCommonFields(paymentDetails, customPaymentFields)

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[name="continue"]').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=success`)
      Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')
    })
  })

  it('Klarna Slice It is supported', () => {
    cy.createMyCart({ method: 'klarnaPaySliced' }).then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields

      checkCommonFields(paymentDetails, customPaymentFields)

      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)

      // Visit Worldpay payment url and enter valid test credentials
      cy.visit(redirectUrl)
      cy.get('[name="continue"]').click()
      cy.url().should('contain', `${Cypress.env('WORLDPAY_CONNECTOR_RETURN_URL')}?status=success`)
    })
  })
})
