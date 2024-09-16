import { setOutput } from '@actions/core'
import { setOutputs } from '../src/setOutputs'

jest.mock('@actions/core')

describe('setOutputs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls setOutput with correct key and value when data has one property', () => {
    const data = { foo: 'bar' }
    setOutputs(data)
    expect(setOutput).toHaveBeenCalledTimes(1)
    expect(setOutput).toHaveBeenCalledWith('foo', 'bar')
  })

  it('calls setOutput with correct key and value when data has multiple properties', () => {
    const data = { foo: 'bar', baz: 2 }
    setOutputs(data)
    expect(setOutput).toHaveBeenCalledTimes(2)
    expect(setOutput).toHaveBeenCalledWith('foo', 'bar')
    expect(setOutput).toHaveBeenCalledWith('baz', 2)
  })

  it('does not call setOutput when data is an empty object', () => {
    const data = {}
    setOutputs(data)
    expect(setOutput).not.toHaveBeenCalled()
  })
})
