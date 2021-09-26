'use strict'

module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2020: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-prototype-builtins': 'off',
    strict: 1,
  },
}
