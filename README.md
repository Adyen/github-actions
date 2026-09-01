# Adyen Reusable GitHub Actions

Reusable GitHub Actions maintained for use across Adyen repositories.

This repository provides shared automation that can be consumed from GitHub Actions workflows without duplicating implementation across repositories.

## Available actions

| Action | Description |
| :---- | :---- |
| [`markdown-confluence-sync`](./markdown-confluence-sync) | Sync Markdown documentation to Confluence. |

## Usage

Actions in this repository are referenced using:

```
uses: Adyen/github-actions-internal/<action>@<version>
```

For example:

```
steps:
  - uses: actions/checkout@v7

  - uses: Adyen/github-actions-internal/markdown-confluence-sync@v1
```

See the README for each action for its supported inputs, outputs, permissions, and secrets.

Each directory at the repository root represents an independently reusable action.

## Adding or changing an action

When contributing to this repository:

1. Keep the action interface small and explicit.  
2. Document all inputs, outputs, required permissions, and secrets.  
3. Avoid embedding repository-specific configuration in shared actions.  
4. Never commit credentials or other sensitive values.  
5. Preserve backwards compatibility within a major version where possible.  
6. Update the action's README when its interface or behavior changes.

## Security

Secrets should be supplied by the consuming workflow using GitHub Actions secrets and should not be stored in this repository.

Prefer least-privilege GitHub token permissions and avoid logging credentials or other sensitive values.

## Support

For questions, issues, or proposed changes, open an issue or pull request in this repository.  
