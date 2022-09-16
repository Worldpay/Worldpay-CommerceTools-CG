'use strict'

module.exports = {
  env: {
    commonjs: true,
    node: true,
    jest: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    eqeqeq: 'error',
    'no-prototype-builtins': 'off',
    strict: 1,
  },
}
