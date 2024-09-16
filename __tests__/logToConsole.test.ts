import { logToConsole } from '../src/logToConsole'

describe('logToConsole', () => {
  it('should log a string message', () => {
    const message = 'Hello, world!'
    const consoleSpy = jest.spyOn(console, 'log')
    logToConsole(message)
    expect(consoleSpy).toHaveBeenCalledWith(message)
    consoleSpy.mockRestore()
  })

  it('should log an object message', () => {
    const message = { foo: 'bar' }
    const consoleSpy = jest.spyOn(console, 'log')
    logToConsole(message)
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(message, null, 2))
    consoleSpy.mockRestore()
  })

  it('should log an array message', () => {
    const message = [1, 2, 3]
    const consoleSpy = jest.spyOn(console, 'log')
    logToConsole(message)
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(message, null, 2))
    consoleSpy.mockRestore()
  })

  it('should not log a non-object or non-array message', () => {
    const message = 42
    const consoleSpy = jest.spyOn(console, 'log')
    logToConsole(message)
    expect(consoleSpy).toHaveBeenCalledWith(message)
    consoleSpy.mockRestore()
  })
})
