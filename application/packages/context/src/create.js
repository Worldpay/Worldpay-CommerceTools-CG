'use strict'

const { AsyncLocalStorage } = require('async_hooks')

const contextLocalStorage = new AsyncLocalStorage()

module.exports.contextLocalStorage = contextLocalStorage
module.exports.create = (data, callback) => {
  contextLocalStorage.run({ data }, callback)
}
