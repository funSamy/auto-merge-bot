import { context } from '@actions/github'

export function getPrInfo(): {
  owner: string
  repo: string
  prNumber?: number
} {
  const prNumber = context.payload.pull_request?.number
  const { owner, repo } = context.repo

  return { owner, repo, prNumber }
}
