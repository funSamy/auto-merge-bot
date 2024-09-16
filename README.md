# Auto merge bot

[![GitHub Super-Linter](https://github.com/funSamy/auto-merge-bot/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/funSamy/auto-merge-bot/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/funSamy/auto-merge-bot/actions/workflows/check-dist.yml/badge.svg)](https://github.com/funSamy/auto-merge-bot/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/funSamy/auto-merge-bot/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/funSamy/auto-merge-bot/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Automatically merge pull request when all the checks have passed

## Setup

In order to use this bot, you need to give the `write permission` to the
repository.

```yaml
jobs:
  auto_merge:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: write
    steps:
      # ... Other steps

      - uses: funSamy/auto-merge-bot@v1.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          merge-method: merge
```

## Inputs

### `github-token`

- **Description:** Your GitHub token.
- **Required:** `true`.
- **Default:** `null`.

### `merge-method`

- **Description:** The merge method.
- **Required:** `false`.
- **Default:** `squash`.
- **Options:** `merge`, `squash`, `rebase`.

## Example usage

```yaml
uses: funSamy/auto-merge-bot@v1.1.0
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Getting result from bot

```yaml
# ...
steps:
  - name: Try to auto merge PR
    uses: funSamy/auto-merge-bot@v1.1.0
    id: auto-merge
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}

  - name: Merge results
    run: |
      echo sha: ${{ env.sha }}
      echo merged: ${{ env.merged }}
      echo message: ${{ env.message }}
    env:
      sha: ${{ steps.auto-merge.outputs.sha }}
      merged: ${{ steps.auto-merge.outputs.merged }}
      message: ${{ steps.auto-merge.outputs.message }}
```

## Outputs

### `sha`

- **Description** The SHA of the commit

### `merged`

- **Description** Whether the PR was merged or not

### `message`

- **Description** The message of the mermeg commit

## License

This project is licensed under the [MIT](LICENSE) License.
