/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import { run } from '../src/main'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as getInputsModule from '../src/getInputs'
import * as getPrInfoModule from '../src/getPrInfo'
import * as logToConsoleModule from '../src/logToConsole'

jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  notice: jest.fn(),
  warning: jest.fn(),
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setOutput: jest.fn()
}))
jest.mock('@actions/github')
jest.mock('../src/getInputs')
jest.mock('../src/getPrInfo')
jest.mock('../src/logToConsole')

describe('run', () => {
  let mockGetInputs: jest.MockedFunction<typeof getInputsModule.getInputs>
  let mockGetPrInfo: jest.MockedFunction<typeof getPrInfoModule.getPrInfo>
  let mockLogToConsole: jest.MockedFunction<
    typeof logToConsoleModule.logToConsole
  >
  let mockGetOctokit: jest.MockedFunction<typeof github.getOctokit>
  let mockSetFailed: jest.Mock // jest.MockedFunction<typeof core.setFailed>

  beforeEach(() => {
    jest.resetAllMocks()

    mockGetInputs = getInputsModule.getInputs as jest.MockedFunction<
      typeof getInputsModule.getInputs
    >
    mockGetPrInfo = getPrInfoModule.getPrInfo as jest.MockedFunction<
      typeof getPrInfoModule.getPrInfo
    >
    mockLogToConsole = logToConsoleModule.logToConsole as jest.MockedFunction<
      typeof logToConsoleModule.logToConsole
    >
    mockGetOctokit = github.getOctokit as jest.MockedFunction<
      typeof github.getOctokit
    >
    mockSetFailed = core.setFailed as jest.Mock //jest.MockedFunction<typeof core.setFailed>

    // Mock core.debug to prevent actual logging during tests
    ;(core.debug as jest.Mock).mockImplementation(() => {})
  })

  it('should merge the PR when mergeable', async () => {
    // Mock getInputs to return valid inputs
    mockGetInputs.mockResolvedValue({
      githubToken: 'fake-token',
      mergeMethod: 'squash',
      debug: false
    })

    // Mock getPrInfo to return valid PR information
    mockGetPrInfo.mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      prNumber: 123
    })

    // Create mocks for octokit methods
    const pullsGetMock = jest.fn()
    const pullsMergeMock = jest.fn()

    const octokitMock = {
      rest: {
        pulls: {
          get: pullsGetMock,
          merge: pullsMergeMock
        }
      }
    }

    // Mock github.getOctokit to return our octokitMock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetOctokit.mockReturnValue(octokitMock as any)

    // Mock pulls.get to return a mergeable PR
    pullsGetMock.mockResolvedValue({
      data: {
        mergeable: true
      }
    })

    // Mock pulls.merge to simulate successful merge
    pullsMergeMock.mockResolvedValue({
      data: { merged: true }
    })

    // Run the function
    await run()

    // Assertions
    expect(pullsGetMock).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 123
    })

    expect(pullsMergeMock).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 123,
      merge_method: 'squash'
    })

    expect(mockLogToConsole).toHaveBeenCalledWith({ merged: true })

    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should set failed when prNumber is undefined', async () => {
    // Mock getInputs to return valid inputs
    mockGetInputs.mockResolvedValue({
      githubToken: 'fake-token',
      mergeMethod: 'squash',
      debug: false
    })

    // Mock getPrInfo to return undefined prNumber
    mockGetPrInfo.mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      prNumber: undefined
    })

    // Run the function
    await run()

    // Assertions
    expect(mockSetFailed).toHaveBeenCalledWith(
      'Could not find pull request. Skipping...'
    )

    // Ensure that octokit methods are not called
    expect(mockGetOctokit).not.toHaveBeenCalled()
  })

  it('should set failed when PR is not mergeable after retries', async () => {
    // Mock getInputs to return valid inputs
    mockGetInputs.mockResolvedValue({
      githubToken: 'fake-token',
      mergeMethod: 'squash',
      debug: false
    })

    // Mock getPrInfo to return valid PR information
    mockGetPrInfo.mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      prNumber: 123
    })

    // Create mocks for octokit methods
    const pullsGetMock = jest.fn()
    const pullsMergeMock = jest.fn()

    const octokitMock = {
      rest: {
        pulls: {
          get: pullsGetMock,
          merge: pullsMergeMock
        }
      }
    }

    // Mock github.getOctokit to return our octokitMock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetOctokit.mockReturnValue(octokitMock as any)

    // Mock pulls.get to always return a non-mergeable PR
    pullsGetMock.mockResolvedValue({
      data: {
        mergeable: false
      }
    })

    // Mock the wait function to resolve immediately
    /* eslint-disable */
    jest
      .spyOn(require('../src/main'), 'wait')
      .mockImplementation(() => Promise.resolve())
    /* eslint-enable */

    const maxRetries = 20
    // Run the function
    await run({ maxRetries: maxRetries, waitTimeInSeconds: 0.1 })

    // Assertions
    expect(pullsGetMock).toHaveBeenCalledTimes(maxRetries)
    expect(mockSetFailed).toHaveBeenCalledWith('Pull request is not mergeable.')

    // Ensure merge was not attempted
    expect(pullsMergeMock).not.toHaveBeenCalled()
  })

  it('should set failed when an exception occurs', async () => {
    const errorMessage = 'An error occurred'

    // Mock getInputs to throw an error
    mockGetInputs.mockRejectedValue(new Error(errorMessage))

    // Run the function
    await run()

    // Assertions
    expect(mockSetFailed).toHaveBeenCalledWith(errorMessage)
  })
})
