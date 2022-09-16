'use strict'

const { contextLocalStorage } = require('./create')

module.exports.retrieve = () => {
  const requestContext = contextLocalStorage.getStore()
  if (!requestContext) {
    throw Error('Cannot retrieve the request context as local storage has not yet been set')
  }
  return requestContext.data
}
