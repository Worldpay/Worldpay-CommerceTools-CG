'use strict'

const log = require('../src/utils/log')

if (process.argv.indexOf('--silent') >= 0) {
  log.silence()
}
