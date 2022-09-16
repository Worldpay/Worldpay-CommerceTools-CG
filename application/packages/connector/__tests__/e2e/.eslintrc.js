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
    sourceType: 'module',
  },
  rules: {
    'no-prototype-builtins': 'off',
    strict: 'off',
  },
  globals: {
    cy: true,
    Cypress: true,
    document: true,
    context: true,
    assert: true,
  },
}
