'use strict'

const ConfigLoader = require('./lib/config/Loader')
const log = require('./lib/utils/log')
const createServer = require('./createServer')

log.level = process.env.WORLDPAY_EXTENSION_LOG_LEVEL

const configLoader = new ConfigLoader()
const config = configLoader.load(process.env)
const server = createServer(config)

server.start()
