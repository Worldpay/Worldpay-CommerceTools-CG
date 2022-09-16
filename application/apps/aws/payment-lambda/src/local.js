'use strict'

const index = require('./index')

exports.handler = async function (request, context) {
  console.log('Request from local', request)
  return index.handler(JSON.parse(request.body), context)
}
