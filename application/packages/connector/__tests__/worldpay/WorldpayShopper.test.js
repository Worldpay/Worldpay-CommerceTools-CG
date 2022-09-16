'use strict'

const WorldpayShopper = require('../../src/worldpay/WorldpayShopper')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayShopper', () => {
  test('should be valid', () => {
    const shopper = new WorldpayShopper('bob@foo.com', '12345')
    expect(shopper.emailAddress).toEqual('bob@foo.com')
    expect(shopper.authenticatedShopperID).toEqual('12345')
    expect(shopper.browserAcceptHeader).toBeUndefined()
    expect(shopper.browserUserAgentHeader).toBeUndefined()
    expect(shopper.validate()).toBeUndefined()
    expect(shopper.isValid()).toBe(true)

    expect(buildXmlFragment(shopper)).toEqualXML(
      `<shopper>
        <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
        <authenticatedShopperID>12345</authenticatedShopperID>
      </shopper>`,
    )
  })

  test('should be valid even with trailing spaces in email', () => {
    const shopper = new WorldpayShopper(' bob@foo.com  ', '12345')
    expect(shopper.emailAddress).toEqual('bob@foo.com')
    expect(shopper.authenticatedShopperID).toEqual('12345')
    expect(shopper.validate()).toBeUndefined()
    expect(shopper.isValid()).toBe(true)

    expect(buildXmlFragment(shopper)).toEqualXML(
      `<shopper>
        <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
        <authenticatedShopperID>12345</authenticatedShopperID>
      </shopper>`,
    )
  })

  test('should be valid with browser accept header', () => {
    const shopper = new WorldpayShopper('bob@foo.com', '12345').withBrowserAcceptHeader('ACCEPT_HEADER')
    expect(shopper.emailAddress).toEqual('bob@foo.com')
    expect(shopper.authenticatedShopperID).toEqual('12345')
    expect(shopper.browserAcceptHeader).toEqual('ACCEPT_HEADER')
    expect(shopper.browserUserAgentHeader).toBeUndefined()
    expect(shopper.validate()).toBeUndefined()
    expect(shopper.isValid()).toBe(true)

    expect(buildXmlFragment(shopper)).toEqualXML(
      `<shopper>
        <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
        <authenticatedShopperID>12345</authenticatedShopperID>
        <browser>
          <acceptHeader>ACCEPT_HEADER</acceptHeader>
        </browser>
      </shopper>`,
    )
  })

  test('should be valid with browser agent header', () => {
    const shopper = new WorldpayShopper('bob@foo.com', '12345').withBrowserUserAgentHeader('AGENT_HEADER')
    expect(shopper.emailAddress).toEqual('bob@foo.com')
    expect(shopper.authenticatedShopperID).toEqual('12345')
    expect(shopper.browserAcceptHeader).toBeUndefined()
    expect(shopper.browserUserAgentHeader).toEqual('AGENT_HEADER')
    expect(shopper.validate()).toBeUndefined()
    expect(shopper.isValid()).toBe(true)

    expect(buildXmlFragment(shopper)).toEqualXML(
      `<shopper>
        <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
        <authenticatedShopperID>12345</authenticatedShopperID>
        <browser>
          <userAgentHeader>AGENT_HEADER</userAgentHeader>
        </browser>
      </shopper>`,
    )
  })

  test('should be valid with all browser details', () => {
    const shopper = new WorldpayShopper('bob@foo.com', '12345')
      .withBrowserAcceptHeader('ACCEPT_HEADER')
      .withBrowserUserAgentHeader('AGENT_HEADER')
    expect(shopper.emailAddress).toEqual('bob@foo.com')
    expect(shopper.authenticatedShopperID).toEqual('12345')
    expect(shopper.browserAcceptHeader).toEqual('ACCEPT_HEADER')
    expect(shopper.browserUserAgentHeader).toEqual('AGENT_HEADER')
    expect(shopper.validate()).toBeUndefined()

    expect(buildXmlFragment(shopper)).toEqualXML(
      `<shopper>
        <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
        <authenticatedShopperID>12345</authenticatedShopperID>
        <browser>
          <acceptHeader>ACCEPT_HEADER</acceptHeader>
          <userAgentHeader>AGENT_HEADER</userAgentHeader>
        </browser>
      </shopper>`,
    )
  })

  test('should be valid with email containing unicode chars', () => {
    const shopper = new WorldpayShopper('bobä@foo.com', '12345')
    expect(shopper.emailAddress).toEqual('bobä@foo.com')
    expect(shopper.authenticatedShopperID).toEqual('12345')
    expect(shopper.validate()).toBeUndefined()
    expect(shopper.isValid()).toBe(true)

    expect(buildXmlFragment(shopper)).toEqualXML(
      `<shopper>
        <shopperEmailAddress>bobä@foo.com</shopperEmailAddress>
        <authenticatedShopperID>12345</authenticatedShopperID>
      </shopper>`,
    )
  })

  test('should fail with invalid emailAddress', () => {
    const shopper = new WorldpayShopper('not_valid_email')
    expect(shopper.validate()).toBeDefined()
    expect(shopper.validate()).toEqual(expect.arrayContaining(['EmailAddress [not_valid_email] is not a valid email']))
  })

  test('should fail with invalid emailAddress', () => {
    const shopper = new WorldpayShopper('@foo')
    expect(shopper.validate()).toEqual(expect.arrayContaining(['EmailAddress [@foo] is not a valid email']))
    expect(shopper.isValid()).toBe(false)
  })

  test('should fail with missing email address', () => {
    const shopper = new WorldpayShopper()
    expect(shopper.validate()).toEqual(expect.arrayContaining(["EmailAddress can't be blank"]))
    expect(shopper.isValid()).toBe(false)
  })

  test('should fail with non-string browser Accept headers', () => {
    const shopper = new WorldpayShopper().withBrowserAcceptHeader(true)
    expect(shopper.validate()).toEqual(expect.arrayContaining(['BrowserAcceptHeader must be of type string']))

    expect(shopper.isValid()).toBe(false)
  })

  test('should fail with non-string browser user-agent headers', () => {
    const shopper = new WorldpayShopper().withBrowserUserAgentHeader(true)
    expect(shopper.validate()).toEqual(expect.arrayContaining(['BrowserUserAgentHeader must be of type string']))
    expect(shopper.isValid()).toBe(false)
  })
})
