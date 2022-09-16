'use strict'

const { PAYMENT_TYPE_KEY, PAYMENT_INTERFACE_INTERACTION_TYPE_KEY } = require('./constants')

function getSetCustomTypeAction(fields) {
  return {
    action: 'setCustomType',
    type: {
      key: PAYMENT_TYPE_KEY,
    },
    fields,
  }
}

/**
 * Get the 'AddInterfaceInteraction' action object
 *
 * @param {string} xmlMessage The XML message sent to Worldpay
 * @param {object} response The response object
 * @returns {object}
 */
function getAddInterfaceInteractionAction(xmlMessage, response) {
  return {
    action: 'addInterfaceInteraction',
    type: {
      key: PAYMENT_INTERFACE_INTERACTION_TYPE_KEY,
    },
    fields: {
      createdAt: new Date().toISOString(),
      request: xmlMessage,
      response: response.data,
    },
  }
}

/**
 * Get the 'SetCustomField' action for the given name/value pair
 *
 * @param {string} name Name of the custom field
 * @param {*} value Value to set the field to
 * @returns {{name: *, action: string, value: *}}
 */
function getSetCustomFieldAction(name, value) {
  return {
    action: 'setCustomField',
    name,
    value,
  }
}

/**
 * Get the 'setInterfaceId' action object
 *
 * @returns {{action: string, interfaceId: (string|string)}}
 */
function getSetInterfaceIdAction(id) {
  return {
    action: 'setInterfaceId',
    interfaceId: id,
  }
}

/**
 * Get the 'setMethodInfoName' action object
 *
 * @returns {{name: {en: (string|string)}, action: string}}
 */
function getSetMethodInfoNameAction(payload) {
  return {
    action: 'setMethodInfoName',
    name: {
      en: payload.resource.obj.paymentMethodInfo.method,
    },
  }
}

/**
 * Get the 'setStatusInterfaceCode' action object
 *
 * @returns {{action: string, interfaceCode: string}}
 */
function getSetStatusInterfaceCodeAction() {
  return {
    action: 'setStatusInterfaceCode',
    interfaceCode: 'INITIAL',
  }
}

/**
 * Get the 'AddTransaction' action object
 * @param amount
 * @returns {{action: string, transaction: {amount: *, type: string}}}
 */
function getAddTransactionAction(amount) {
  return {
    action: 'addTransaction',
    transaction: {
      type: 'Authorization',
      state: 'Initial',
      amount,
      timestamp: new Date().toISOString(),
    },
  }
}

const CommercetoolsActions = {
  getSetCustomTypeAction,
  getAddInterfaceInteractionAction,
  getSetCustomFieldAction,
  getSetInterfaceIdAction,
  getSetMethodInfoNameAction,
  getSetStatusInterfaceCodeAction,
  getAddTransactionAction,
}

module.exports = CommercetoolsActions
