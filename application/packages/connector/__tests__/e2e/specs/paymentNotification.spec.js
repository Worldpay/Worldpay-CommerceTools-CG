/// <reference types="cypress" />

import { get } from 'lodash'
import { urlDecode, urlFormat, retryHelper } from '../support/helpers'
import WorldpayNotification from '../../../src/worldpay/WorldpayNotification'

// Timeout set in .env config with a 30 minute fallback
const pollTimeout = isNaN(Cypress.env('WORLDPAY_CONNECTOR_E2E_TEST_TIMEOUT_MINS'))
  ? 30
  : Cypress.env('WORLDPAY_CONNECTOR_E2E_TEST_TIMEOUT_MINS')

// Keeping polling for specified duration with a delay between requests
const { maxRetryAttempts, requestInterval } = retryHelper(pollTimeout, 5)

let actualJournalTypes = []
let retryAttempts = 0

// Recursive function that keeps polling the payment query until the correct journal types have been received
const requestPaymentDetails = (paymentDetails, typesToMatch) => {
  const { id } = paymentDetails
  cy.checkPayment(id).then((validatedPayment) => {
    // Ignore the initial payment request for now due to escaping issues.
    // 1st interaction is the create from CT, not a notification!
    const rawResults = validatedPayment.interfaceInteractions.slice(1)
    rawResults.forEach((result, index) => {
      const xmlResponse = new WorldpayNotification(result.fields.request)
      const journalType = xmlResponse.type

      expect(JSON.stringify(result)).to.exist
      expect('Next number is payment interaction index (1st is skipped)').to.contain('index')
      expect(index + 1).to.eq(index + 1)
      // Validate xml data
      const paymentProps = journalType === 'ERROR' ? [] : ['centAmount', 'currencyCode', 'fractionDigits', 'type']
      paymentProps.forEach((prop) => {
        expect(get(xmlResponse, `amount.${prop}`)).to.equal(paymentDetails.totalPrice[prop])
      })
      expect(xmlResponse.orderCode).to.equal(paymentDetails.id)
      expect(xmlResponse.merchantCode).to.equal(paymentDetails.customPaymentFields.merchantCode)
      if (typesToMatch.includes(journalType) && !actualJournalTypes.includes(journalType)) {
        actualJournalTypes.push(journalType)
      }
    })
    retryAttempts++
    const success = actualJournalTypes.length === typesToMatch.length
    const failure = retryAttempts === maxRetryAttempts
    const message = success ? 'Passed' : 'Failed'
    if (success || failure) {
      expect(message).to.equal('Passed')
      return
    }
    cy.wait(requestInterval)
    requestPaymentDetails(paymentDetails, typesToMatch)
  })
}

context('payment notifications', () => {
  beforeEach(() => {
    actualJournalTypes = []
    retryAttempts = 0
  })

  it('updates the payment object with all the success stages', () => {
    const successJournalTypes = ['SENT_FOR_AUTHORISATION', 'AUTHORISED', 'CAPTURED']
    cy.createMyCart().then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields
      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)
      expect(redirectUrl).to.match(urlFormat)

      // Visit Worldpay payment url and enter VALID test credentials
      cy.visit(redirectUrl)
      cy.get('[data-pm="VISA"]').eq(0).click()
      cy.get('#cardNumber').type('4444333322221111')
      cy.get('#cardholderName').clear().type('Test test')
      cy.get('#expiryMonth').type('10')
      cy.get('#expiryYear').type('23')
      cy.get('#securityCode').type('555')
      cy.get('#submitButton').click()
      cy.contains('Thank you, your transaction has been successful.')

      cy.createMyOrderFromCart({
        id: customPaymentFields.cartId,
        version: paymentDetails.cartVersion,
      }).then(() => {
        // Check payment details match
        requestPaymentDetails({ ...paymentDetails, customPaymentFields }, successJournalTypes)
      })
    })
  })

  it.only('updates the payment object with all the error stages', () => {
    const errorJournalTypes = ['SENT_FOR_AUTHORISATION', 'ERROR']
    cy.createMyCart().then((paymentDetails) => {
      const customPaymentFields = paymentDetails.custom.fields
      const redirectUrl = urlDecode(customPaymentFields.redirectUrl)
      expect(redirectUrl).to.match(urlFormat)

      // Visit Worldpay payment url and enter INVALID test credentials
      cy.visit(redirectUrl)
      cy.get('[data-pm="VISA"]').eq(0).click()
      cy.get('#cardNumber').type('4444333322221111')
      cy.get('#cardholderName').clear().type('ERROR')
      cy.get('#expiryMonth').type('10')
      cy.get('#expiryYear').type('23')
      cy.get('#securityCode').type('555')
      cy.get('#submitButton').click()
      cy.contains('Sorry, there has been a problem processing your transaction. Please try again.')

      cy.createMyOrderFromCart({
        id: customPaymentFields.cartId,
        version: paymentDetails.cartVersion,
      }).then(() => {
        // Check payment details match
        requestPaymentDetails({ ...paymentDetails, customPaymentFields }, errorJournalTypes)
      })
    })
  })
})
