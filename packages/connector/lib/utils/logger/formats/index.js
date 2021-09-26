'use strict'

let formats

if (process.env.NODE_ENV === 'development') {
  formats = require('./dev')
} else {
  formats = require('./prd')
}

module.exports = formats
