import {
  getInput,
  setFailed,
  error,
  notice,
  warning,
  setOutput
} from '@actions/core'
import { getOctokit, context as _context } from '@actions/github'
import { exit } from 'node:process'

const githubToken = getInput('github-token', {
  required: true,
  trimWhitespace: true
})

const mergeMethod = getInput('merge-method')

if (
  mergeMethod !== '' &&
  !['merge', 'squash', 'rebase'].includes(mergeMethod)
) {
  setFailed(`Invalid merge method: ${mergeMethod}`)
  exit(1)
}

// This GitHub Action will automatically merge pull requests when all the checks have passed
const octokit = getOctokit(githubToken, {
  log: {
    debug: console.log,
    error: error,
    info: notice,
    warn: warning
  }
})
const context = _context

// Get the pull request's information
const prNumber = context.payload.pull_request.number
const { owner, repo } = context.repo

async function run() {
  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber
  })
  logToActions(data)

  let pr

  // Poll for the PR's mergeable status
  for (let i = 0; i < 10; i++) {
    pr = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    })

    if (pr.data.mergeable_state === 'clean') {
      break
    } else if (
      pr.data.mergeable_state === 'dirty' ||
      pr.data.mergeable_state === 'unknown'
    ) {
      return setFailed('Pull request is not mergeable.')
    }

    // Wait for a few seconds before retrying
    logToActions(
      `Pull request is not mergeable. Retrying in ${5 * (i + 1)} seconds... (${
        i + 1
      }/10)`
    )
    await new Promise(resolve => setTimeout(resolve, 5_000 * (i + 1)))

    if (i === 9) {
      setFailed('Timed out waiting for pull request to become mergeable.')
      return
    }
  }

  if (pr.data.mergeable_state !== 'clean') {
    setFailed('Timed out waiting for pull request to become mergeable.')
  }

  const response = await octokit.rest.pulls.merge({
    owner,
    repo,
    // sha: pr.data.merge_commit_sha,
    pull_number: prNumber,
    merge_method: mergeMethod || 'squash' // Change to 'squash' or 'rebase' if desired
  })
  const respData = response.data
  logToActions(respData)

  const { sha, merged, message } = respData

  // Set the output variables
  setOutput('sha', sha)
  setOutput('merged', merged)
  setOutput('message', message)
}

/**
 * Logs a message to the GitHub Actions log.
 * @param {any} message
 */
function logToActions(message) {
  const paramType = typeof message
  if (paramType === 'object' || paramType === 'array') {
    console.log(JSON.stringify(message, null, 2))
  } else {
    console.log(message)
  }
  return
}

try {
  run()
} catch (error) {
  setFailed(error.message)
}
