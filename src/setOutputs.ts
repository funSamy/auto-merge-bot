import { setOutput } from '@actions/core'

/**
 * Sets output variables for the action.
 *
 * @param data An object with properties where the key is the name of the
 * output variable and the value is the value of the output variable.
 */
export function setOutputs<T>(data: { [key: string]: T }): void {
  Object.entries(data).forEach(([key, value]) => setOutput(key, value))
}
