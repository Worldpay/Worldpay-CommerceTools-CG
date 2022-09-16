'use strict'

const { ResponseCodes, MimeTypes } = require('http-headers-js')
const log = require('@gradientedge/wcc-logger')
const utils = require('@gradientedge/wcc-utils')
const { Connector } = require('@gradientedge/wcc-connector')
const mapKeys = require('lodash.mapkeys')

const connector = new Connector(process.env)

// eslint-disable-next-line no-unused-vars
module.exports.handler = async function (event, context) {
  const headers = mapKeys(event.headers, (value, key) => key.toLowerCase())
  let handlers

  log.debug('Worldpay notification request', event)

  // The request's `Content-Type` header must be text/xml`
  const contentType = utils.extractContentType(headers)
  if (!contentType || contentType !== MimeTypes.Text.XML) {
    log.warn(`Invalid content type [${contentType}] - expecting [text/xml]`)
    return {
      statusCode: ResponseCodes.UNSUPPORTED_MEDIA_TYPE,
    }
  }

  try {
    handlers = connector.notificationProcessor.execute(event.body)
  } catch (e) {
    log.error('Error calling `execute` on notification processor', {
      err: e.toString(),
      stack: e.stack,
      event,
    })
    return {
      statusCode: ResponseCodes.INTERNAL_SERVER_ERROR,
    }
  }

  try {
    const result = await handlers.storage
    log.debug('Notification processor `storage` stage complete', { result })
  } catch (e) {
    log.error('Error storing notification', {
      err: e.toString(),
      stack: e.stack,
      e,
      errorData: JSON.stringify(e),
      event,
    })
    return {
      statusCode: ResponseCodes.INTERNAL_SERVER_ERROR,
    }
  }

  if (handlers.process) {
    try {
      const result = await handlers.process
      log.debug('Notification processor `process` stage complete', {
        result,
      })
    } catch (e) {
      log.error('Error processing notification', {
        err: e.toString(),
        stack: e.stack,
        event,
      })
    }
  }

  return {
    statusCode: ResponseCodes.OK,
    body: '[OK]',
  }
}
