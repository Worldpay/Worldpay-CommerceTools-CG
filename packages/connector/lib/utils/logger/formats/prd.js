'use strict'

const { format } = require('winston')
const request = require('./request')
const metadata = require('./metadata')

const prdFormats = [request, metadata, format.json()]

module.exports = prdFormats
