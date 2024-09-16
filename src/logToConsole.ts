/**
 * Logs a message to the console. If the message is an object or array, it will
 * be JSON stringified with 2 spaces of indentation.
 * @param {T} message The message to log to the console.
 */
export function logToConsole<T>(message: T): void {
  if (message instanceof Object || message instanceof Array) {
    console.log(JSON.stringify(message, null, 2))
  } else {
    console.log(message)
  }
}
