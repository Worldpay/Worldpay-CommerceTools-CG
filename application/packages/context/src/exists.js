'use strict'

const { contextLocalStorage } = require('./create')

module.exports.exists = () => {
  return !!contextLocalStorage.getStore()
}
