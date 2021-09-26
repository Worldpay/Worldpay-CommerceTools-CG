'use strict'

const log = require('../lib/utils/log')

if (process.argv.indexOf('--silent') >= 0) {
  log.silence()
}
