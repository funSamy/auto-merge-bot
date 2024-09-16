import { getPrInfo } from '../src/getPrInfo'
import { context } from '@actions/github'

describe('getPrInfo', () => {
  it('should return the owner, repo, and prNumber when context.payload.pull_request.number is defined', () => {
    jest
      .spyOn(context, 'repo', 'get')
      .mockImplementation(() => ({ owner: 'owner', repo: 'repo' }))

    // Mock the payload getter
    context.payload = { pull_request: { number: 123 } }

    const result = getPrInfo()
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      prNumber: 123
    })
  })

  it('should return the owner and repo when context.payload.pull_request.number is undefined', () => {
    jest
      .spyOn(context, 'repo', 'get')
      .mockImplementation(() => ({ owner: 'owner', repo: 'repo' }))

    context.payload = {}

    const result = getPrInfo()
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      prNumber: undefined
    })
  })
})
