'use strict'

const { contextLocalStorage } = require('./create')

module.exports.update = (data) => {
  contextLocalStorage.getStore().data = data
}
