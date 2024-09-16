import * as core from '@actions/core'
import * as github from '@actions/github'
import { getInputs } from './getInputs'
import { getPrInfo } from './getPrInfo'
import { logToConsole } from './logToConsole'
import { setOutputs } from './setOutputs'

/**
 * Main entry point for the Action.
 *
 * This function does the following:
 *
 * 1. Retrieves the `github-token` and `merge-method` inputs.
 * 2. Authenticates with GitHub using the `github-token`.
 * 3. Retrieves the pull request information.
 * 4. Polls for the pull request's mergeable status until it becomes mergeable.
 * 5. Merges the pull request using the specified `merge-method`.
 * 6. Logs the result of the merge action.
 *
 * @param options - Options to customize the behavior of the action.
 * @param options.maxRetries - The maximum number of retries to attempt.
 * @param options.waitTimeInSeconds - The number of seconds to wait between retries.
 *
 * @returns {Promise<void>} An empty promise that resolves when the action completes.
 */
export async function run(
  options = {
    maxRetries: 20,
    waitTimeInSeconds: 5
  }
): Promise<void> {
  try {
    const { githubToken, mergeMethod } = await getInputs()

    core.debug('Getting Pull request info')
    const prInfo = getPrInfo()
    core.debug('Done .... ☑')

    if (prInfo.prNumber === undefined) {
      core.setFailed(`Could not find pull request. Skipping...`)
      return
    }

    core.debug('Authenticating with GitHub...')
    const octokit = github.getOctokit(githubToken, {
      log: {
        debug: console.log,
        error: core.error,
        info: core.notice,
        warn: core.warning
      }
    })
    core.debug('Done .... ☑')

    let pr
    for (let i = 0; i < options.maxRetries; i++) {
      pr = await octokit.rest.pulls.get({
        owner: prInfo.owner,
        repo: prInfo.repo,
        pull_number: prInfo.prNumber
      })

      if (pr.data.mergeable) break
      if (i === options.maxRetries - 1) {
        core.setFailed('Pull request is not mergeable.')
        return
      }

      logToConsole(
        `Pull request is not mergeable. Retrying in ${options.waitTimeInSeconds} seconds... (${i + 1}/10)`
      )
      await wait(options.waitTimeInSeconds)
    }

    const response = await octokit.rest.pulls.merge({
      owner: prInfo.owner,
      repo: prInfo.repo,
      pull_number: prInfo.prNumber,
      merge_method: mergeMethod
    })

    const respData = response.data
    logToConsole(respData)

    // Set the output variables
    setOutputs(respData)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * Waits for a specified number of seconds.
 *
 * @param {number} seconds - The number of seconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified time.
 */
export async function wait(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}
