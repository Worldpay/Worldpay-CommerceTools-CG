'use strict'

const {
  verifyMacCode,
  generateMacCode,
  extractMacCodeParam,
  extractRedirectUrlParameters,
} = require('../../lib/utils/macCodeValidator')

// Test URL provided by Worldpay
// https://developer.worldpay.com/docs/wpg/hostedintegration/securingpayments#creating-and-adding-the-mac
const TEST_REDIRECT_URL =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=AUTHORISED&paymentAmount=1400&paymentCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_MISSING_MAC =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=AUTHORISED&paymentAmount=1400&paymentCurrency=GBP'
const TEST_REDIRECT_URL_EMPTY_MAC =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=AUTHORISED&paymentAmount=1400&paymentCurrency=GBP&mac2='
const TEST_REDIRECT_URL_MISSING_ORDER_KEY =
  'https://www.mymerchant.com/Success.jsp?paymentStatus=AUTHORISED&paymentAmount=1400&paymentCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_MISSING_PAYMENT_STATUS =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentAmount=1400&paymentCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_MISSING_PAYMENT_AMOUNT =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=AUTHORISED&paymentCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_MISSING_PAYMENT_CURRENCY =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=AUTHORISED&paymentAmount=1400&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_ALTERED_PAYMENT_AMOUNT =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=AUTHORISED&paymentAmount=1500&paymentCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_ALTERED_PAYMENT_CURRENCY =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=AUTHORISED&paymentAmount=1400&paymentCurrency=EUR&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_ALTERED_PAYMENT_STATUS =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&paymentStatus=CAPTURED&paymentAmount=1400&paymentCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'
const TEST_REDIRECT_URL_ALTERED_ORDER_KEY =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODEXX^MYMERCHANT^T0211010&paymentStatus=CAPTURED&paymentAmount=1400&paymentCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'

const TEST_CANCEL_URL =
  'https://www.mymerchant.com/Success.jsp?orderKey=MYADMINCODE^MYMERCHANT^T0211010&orderAmount=1400&orderCurrency=GBP&mac2=856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'

const TEST_MAC_SECRET = '@p-p1epie'
const TEST_MAC_CODE_VALUE = '856ff737b2987f21513b91992818d983ce9fed97847b15756c56493a23090415'

describe('MAC Code', () => {
  test('should be extracted', () => {
    const macCode = extractMacCodeParam(TEST_REDIRECT_URL)
    expect(macCode).toEqual(TEST_MAC_CODE_VALUE)
  })

  test('should fail with missing MAC', () => {
    expect(() => {
      extractMacCodeParam(TEST_REDIRECT_URL_MISSING_MAC)
    }).toThrow(Error)
  })

  test('should fail with empty MAC', () => {
    expect(() => {
      extractMacCodeParam(TEST_REDIRECT_URL_EMPTY_MAC)
    }).toThrow(Error)
  })

  test('should fail with invalid URL', () => {
    expect(() => {
      extractMacCodeParam('not_a_url')
    }).toThrow(Error)
  })
})

describe('Extract expected params', () => {
  test('should have valid payment params', () => {
    const params = extractRedirectUrlParameters(TEST_REDIRECT_URL)
    expect(params).toEqual(['MYADMINCODE^MYMERCHANT^T0211010', '1400', 'GBP', 'AUTHORISED'])
  })

  test('should have valid cancel params', () => {
    const params = extractRedirectUrlParameters(TEST_CANCEL_URL)
    expect(params).toEqual(['MYADMINCODE^MYMERCHANT^T0211010', '1400', 'GBP'])
  })

  test('should fail with missing orderKey', () => {
    expect(() => {
      extractRedirectUrlParameters(TEST_REDIRECT_URL_MISSING_ORDER_KEY)
    }).toThrow(Error)
  })

  test('should fail with missing paymentAmount', () => {
    expect(() => {
      extractRedirectUrlParameters(TEST_REDIRECT_URL_MISSING_PAYMENT_AMOUNT)
    }).toThrow(Error)
  })

  test('should fail with missing paymentCurrency', () => {
    expect(() => {
      extractRedirectUrlParameters(TEST_REDIRECT_URL_MISSING_PAYMENT_CURRENCY)
    }).toThrow(Error)
  })

  test('should fail with missing paymentStatus', () => {
    expect(() => {
      extractRedirectUrlParameters(TEST_REDIRECT_URL_MISSING_PAYMENT_STATUS)
    }).toThrow(Error)
  })

  test('should fail with invalid URL', () => {
    expect(() => {
      extractRedirectUrlParameters('not_a_url')
    }).toThrow(Error)
  })
})

describe('MAC Code Generation', () => {
  test('should generate valid code', () => {
    const stringToHash = ['MYADMINCODE^MYMERCHANT^T0211010', '1400', 'GBP', 'AUTHORISED'].join(':')
    const macCode = generateMacCode(stringToHash, TEST_MAC_SECRET)
    expect(macCode).toEqual(TEST_MAC_CODE_VALUE)
  })

  test('should generate invalid code with modified adminCode', () => {
    const stringToHash = [
      'MYADMINCODE^MYMERCHANT^T0211010_MODIFIED',
      '1400',
      'GBP',
      'AUTHORISED',
    ].join(':')
    const macCode = generateMacCode(stringToHash, 'invalid_secret')
    expect(macCode).not.toEqual(TEST_MAC_CODE_VALUE)
  })

  test('should generate invalid code with modified paymentAmount', () => {
    const stringToHash = ['MYADMINCODE^MYMERCHANT^T0211010', '1500', 'GBP', 'AUTHORISED'].join(':')
    const macCode = generateMacCode(stringToHash, TEST_MAC_SECRET)
    expect(macCode).not.toEqual(TEST_MAC_CODE_VALUE)
  })

  test('should generate invalid code with modified paymentCurrency', () => {
    const stringToHash = ['MYADMINCODE^MYMERCHANT^T0211010', '1400', 'EUR', 'AUTHORISED'].join(':')
    const macCode = generateMacCode(stringToHash, TEST_MAC_SECRET)
    expect(macCode).not.toEqual(TEST_MAC_CODE_VALUE)
  })

  test('should generate invalid code with modified paymentStatus', () => {
    const stringToHash = ['MYADMINCODE^MYMERCHANT^T0211010', '1400', 'GBP', 'CAPTURED'].join(':')
    const macCode = generateMacCode(stringToHash, TEST_MAC_SECRET)
    expect(macCode).not.toEqual(TEST_MAC_CODE_VALUE)
  })

  test('should generate invalid code with incorrect secret', () => {
    const stringToHash = ['MYADMINCODE^MYMERCHANT^T0211010', '1400', 'GBP', 'AUTHORISED'].join(':')
    const macCode = generateMacCode(stringToHash, 'invalid_secret')
    expect(macCode).not.toEqual(TEST_MAC_CODE_VALUE)
  })
})

describe('MAC Code Verification', () => {
  test('should validate valid code', () => {
    expect(verifyMacCode(TEST_REDIRECT_URL, TEST_MAC_SECRET)).toEqual(true)
  })

  test('should fail with altered payment amount', () => {
    expect(verifyMacCode(TEST_REDIRECT_URL_ALTERED_PAYMENT_AMOUNT, TEST_MAC_SECRET)).toEqual(false)
  })

  test('should fail with altered payment currency', () => {
    expect(verifyMacCode(TEST_REDIRECT_URL_ALTERED_PAYMENT_CURRENCY, TEST_MAC_SECRET)).toEqual(
      false
    )
  })

  test('should fail with altered payment status', () => {
    expect(verifyMacCode(TEST_REDIRECT_URL_ALTERED_PAYMENT_STATUS, TEST_MAC_SECRET)).toEqual(false)
  })

  test('should fail with altered order code', () => {
    expect(verifyMacCode(TEST_REDIRECT_URL_ALTERED_ORDER_KEY, TEST_MAC_SECRET)).toEqual(false)
  })
})
