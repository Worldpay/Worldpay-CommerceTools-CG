'use strict'

const AWS = require('aws-sdk')
const secretsLoader = require('../../../lib/utils/aws/secretsLoader')

jest.mock('aws-sdk')

describe('loadSecret', () => {
  it('should call `loadSecrets` passing in the secret name to retrieve as a single item array', async () => {
    const loadSecretsSpy = jest.spyOn(secretsLoader, 'loadSecrets')
    loadSecretsSpy.mockResolvedValue(['mySecretValue'])
    const secretValue = await secretsLoader.loadSecret('mySecretName')
    expect(secretsLoader.loadSecrets).toHaveBeenCalledTimes(1)
    expect(secretsLoader.loadSecrets).toHaveBeenCalledWith(['mySecretName'])
    expect(secretValue).toEqual(['mySecretValue'])
    loadSecretsSpy.mockRestore()
  })
})

describe('loadSecrets', () => {
  it('should return an empty object if the secret names array is empty', async () => {
    await expect(secretsLoader.loadSecrets([])).resolves.toEqual({})
    await expect(secretsLoader.loadSecrets()).resolves.toEqual({})
    await expect(secretsLoader.loadSecrets(null)).resolves.toEqual({})
  })

  it('should attempt to get each secret from AWS', async () => {
    const getSecretValueMock = jest.fn()
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () =>
        Promise.resolve({ SecretString: JSON.stringify({ mySecret1: 'secretString1' }) }),
    }))
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () =>
        Promise.resolve({ SecretString: JSON.stringify({ mySecret2: 'secretString2' }) }),
    }))
    AWS.SecretsManager.mockImplementation(() => ({
      getSecretValue: getSecretValueMock,
    }))
    const secrets = await secretsLoader.loadSecrets(['mySecret1', 'mySecret2'])
    expect(getSecretValueMock).toHaveBeenCalledTimes(2)
    expect(getSecretValueMock).toHaveBeenCalledWith({ SecretId: 'mySecret1' })
    expect(getSecretValueMock).toHaveBeenCalledWith({ SecretId: 'mySecret2' })
    expect(secrets).toEqual({
      mySecret1: 'secretString1',
      mySecret2: 'secretString2',
    })
  })

  it('should throw an exception if any of the calls to get the secret from AWS fail', async () => {
    const getSecretValueMock = jest.fn()
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () =>
        Promise.resolve({ SecretString: JSON.stringify({ mySecret1: 'secretString1' }) }),
    }))
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () => Promise.reject('dummy error'),
    }))
    AWS.SecretsManager.mockImplementation(() => ({
      getSecretValue: getSecretValueMock,
    }))
    await expect(secretsLoader.loadSecrets(['mySecret1', 'mySecret2'])).rejects.toBe('dummy error')
    expect(getSecretValueMock).toHaveBeenCalledTimes(2)
    expect(getSecretValueMock).toHaveBeenCalledWith({ SecretId: 'mySecret1' })
    expect(getSecretValueMock).toHaveBeenCalledWith({ SecretId: 'mySecret2' })
  })

  it('should throw an exception if the single secrets requested returns a falsy value', async () => {
    const getSecretValueMock = jest.fn()
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () => Promise.resolve(null),
    }))
    AWS.SecretsManager.mockImplementation(() => ({
      getSecretValue: getSecretValueMock,
    }))
    await expect(secretsLoader.loadSecrets(['mySecret1'])).rejects.toEqual(
      new Error('No secrets loaded for [mySecret1]')
    )
    expect(getSecretValueMock).toHaveBeenCalledTimes(1)
    expect(getSecretValueMock).toHaveBeenCalledWith({ SecretId: 'mySecret1' })
  })

  it('should throw an exception if all secrets requested return a falsy value', async () => {
    const getSecretValueMock = jest.fn()
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () => Promise.resolve(null),
    }))
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () => Promise.resolve(null),
    }))
    AWS.SecretsManager.mockImplementation(() => ({
      getSecretValue: getSecretValueMock,
    }))
    await expect(secretsLoader.loadSecrets(['mySecret1', 'mySecret2'])).rejects.toEqual(
      new Error('No secrets loaded for [mySecret1,mySecret2]')
    )
  })

  it('should not throw an exception if at least one secrets requested returns a truthy value', async () => {
    const getSecretValueMock = jest.fn()
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () => Promise.resolve(null),
    }))
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () =>
        Promise.resolve({ SecretString: JSON.stringify({ mySecret2: 'secretString2' }) }),
    }))
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({}),
    }))
    AWS.SecretsManager.mockImplementation(() => ({
      getSecretValue: getSecretValueMock,
    }))
    await expect(secretsLoader.loadSecrets(['mySecret1', 'mySecret2'])).resolves.toEqual({
      mySecret2: 'secretString2',
    })
  })

  it('should return an array rather than an object when the `merge` param is false', async () => {
    const getSecretValueMock = jest.fn()
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () =>
        Promise.resolve({ SecretString: JSON.stringify({ mySecret1: 'secretString1' }) }),
    }))
    getSecretValueMock.mockImplementationOnce(() => ({
      promise: () =>
        Promise.resolve({ SecretString: JSON.stringify({ mySecret2: 'secretString2' }) }),
    }))
    AWS.SecretsManager.mockImplementation(() => ({
      getSecretValue: getSecretValueMock,
    }))
    await expect(secretsLoader.loadSecrets(['mySecret1', 'mySecret2'], false)).resolves.toEqual([
      { mySecret1: 'secretString1' },
      { mySecret2: 'secretString2' },
    ])
  })
})
