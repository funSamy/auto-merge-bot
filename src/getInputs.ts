import * as core from '@actions/core'

const validMergeMethods = ['merge', 'squash', 'rebase'] as const

type InputResult = {
  githubToken: string
  mergeMethod: (typeof validMergeMethods)[number]
  debug: boolean
}

/**
 * Retrieves the inputs from the workflow file
 *
 * @returns {Promise<InputResult>} Resolves with an object containing the
 *   github-token, merge-method, and debug inputs.
 *
 * @throws {Error} If github-token is an empty string
 * @throws {Error} If merge-method is not one of: merge, squash, or rebase
 */
export async function getInputs(): Promise<InputResult> {
  const tokenInput = core.getInput('github-token', { required: true })
  const methodInput = core.getInput('merge-method') || 'squash'
  const debugInput = core.getBooleanInput('debug')

  if (tokenInput === '') {
    throw new Error('github-token is required')
  }

  if (
    !validMergeMethods.includes(
      methodInput as (typeof validMergeMethods)[number]
    )
  ) {
    throw new Error(`Invalid merge method: ${methodInput}`)
  }

  return {
    githubToken: tokenInput,
    mergeMethod: methodInput as (typeof validMergeMethods)[number],
    debug: debugInput
  }
}
