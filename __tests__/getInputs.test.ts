import * as core from '@actions/core'
import { getInputs } from '../src/getInputs'
import { expect } from '@jest/globals'

describe('getInputs', () => {
  it('should return the correct input values', async () => {
    const tokenInput = 'foo-bar-bizz'
    const methodInput = 'squash'
    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'github-token':
          return tokenInput
        case 'merge-method':
          return methodInput
        default:
          return ''
      }
    })
    jest.spyOn(core, 'getBooleanInput').mockImplementation(() => false)

    const result = await getInputs()

    expect(result.githubToken).toBe(tokenInput)
    expect(result.mergeMethod).toBe(methodInput)
  })

  it('should throw an error if github-token is missing', async () => {
    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'github-token':
          return ''
        case 'merge-method':
          return ''
        default:
          return ''
      }
    })
    jest.spyOn(core, 'getBooleanInput').mockImplementation(() => false)

    await expect(getInputs()).rejects.toThrow('github-token is required')
  })

  it('should throw an error if merge-method is invalid', async () => {
    const tokenInput = 'foo-bar-bizz'
    const methodInput = 'foo-bar-bizz'
    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'github-token':
          return tokenInput
        case 'merge-method':
          return methodInput
        default:
          return ''
      }
    })
    jest.spyOn(core, 'getBooleanInput').mockImplementation(() => false)

    await expect(getInputs()).rejects.toThrow(
      `Invalid merge method: ${methodInput}`
    )
  })

  it('should return the default merge method if none is provided', async () => {
    const tokenInput = 'foo-bar-bizz'
    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'github-token':
          return tokenInput
        case 'merge-method':
          return ''
        default:
          return ''
      }
    })
    jest.spyOn(core, 'getBooleanInput').mockImplementation(() => false)

    const result = await getInputs()

    expect(result.mergeMethod).toBe('squash')
  })

  it('should return debug to be true', async () => {
    const tokenInput = 'foo-bar-bizz'
    const methodInput = 'merge'
    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'github-token':
          return tokenInput
        case 'merge-method':
          return methodInput
        default:
          return ''
      }
    })
    jest.spyOn(core, 'getBooleanInput').mockImplementation(name => {
      switch (name) {
        case 'debug':
          return true
        default:
          return false
      }
    })

    const result = await getInputs()

    expect(typeof result.debug).toBe('boolean')
    expect(result.debug).toBe(true)
  })
})
