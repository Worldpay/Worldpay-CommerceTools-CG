'use strict'

const WorldpayOrderLines = require('../../worldpay/WorldpayOrderLines')
const WorldpayLineItem = require('../../worldpay/WorldpayLineItem')
const { mapKlarnaLocaleCodes } = require('../../utils/worldPayMapper')
const { findValueForLocale } = require('../../utils/textLocale')

/**
 * Extract the customer's cart into order lines
 * @param {object} cart The shopping cart
 */
function getOrderLines(cart, options) {
  const gross = cart.taxedPrice?.totalGross?.centAmount
  const net = cart.taxedPrice?.totalNet?.centAmount
  const taxAmount = gross && net ? gross - net : 0
  const orderLines = new WorldpayOrderLines().withOrderTaxAmount(taxAmount).withTermsURL(options.termsURL)
  let locale

  if (cart.lineItems) {
    cart.lineItems.forEach((orderLine) => {
      const country = orderLine?.taxRate?.country
      locale = mapKlarnaLocaleCodes(country)
      const price = orderLine?.price?.value?.centAmount
      const grossPrice = orderLine?.taxedPrice?.totalGross?.centAmount
      const netPrice = orderLine?.taxedPrice?.totalNet?.centAmount
      const taxAmount = grossPrice && netPrice ? grossPrice - netPrice : 0

      const lineItem = new WorldpayLineItem()
        .withReference(orderLine.id)
        .withName(findValueForLocale(orderLine.name, locale))
        .withQuantity(orderLine.quantity)
        .withQuantityUnit(1)
        .withUnitPrice(price / orderLine.quantity)
        .withTaxRate(orderLine?.taxRate?.amount * 10000)
        .withTotalAmount(orderLine?.totalPrice?.centAmount)
        .withTotalTaxAmount(taxAmount)
        .withTotalDiscountAmount(0)
      orderLines.withLineItem(lineItem)
    })
  }
  // Add an additional line with the shipping costs
  if (cart.shippingInfo?.taxedPrice?.totalGross?.centAmount > 0) {
    const shipping = new WorldpayLineItem('shippingFee')
      .withReference('shippingCost')
      .withName('Shipping Cost')
      .withQuantity(1)
      .withQuantityUnit(1)
      .withUnitPrice(cart.shippingInfo?.taxedPrice?.totalGross?.centAmount)
      .withTaxRate(cart.shippingInfo.taxRate?.amount * 10000)
      .withTotalAmount(cart.shippingInfo?.taxedPrice?.totalGross?.centAmount)
      .withTotalTaxAmount(
        cart.shippingInfo?.taxedPrice?.totalGross?.centAmount - cart.shippingInfo?.taxedPrice?.totalNet?.centAmount,
      )
    orderLines.withLineItem(shipping)
  }
  return orderLines
}

module.exports = getOrderLines
