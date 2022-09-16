'use strict'

const { ResponseCodes, Headers } = require('http-headers-js')

const auth = function (bearerToken, realm) {
  return (req, res, next) => {
    const authHeader = req.get('authorization')
    if (!authHeader) {
      res.set(Headers.WWW_AUTHENTICATE, `Bearer realm="${realm}"`).status(ResponseCodes.UNAUTHORIZED).send()
      return
    } else if (authHeader !== `Bearer ${bearerToken}`) {
      res
        .set(
          Headers.WWW_AUTHENTICATE,
          `Bearer realm="${realm}", error="invalid_token", error_description="Incorrect bearer token provided"`,
        )
        .status(ResponseCodes.UNAUTHORIZED)
        .send()
      return
    }
    next()
  }
}

module.exports = auth
