# Confluence Markdown sync

Syncs Markdown documentation from the repo to Confluence.

## How to use

- Make sure you have [setup the action and secrets](#adding-a-workflow-that-runs-this-action) in your repository
- Manually create a page on confluence and copy the pageId. It can be found in the url with the pattern `pages/{pageId}/some-text`
- In your repository, in the Markdown file you want to sync, add this frontmatter at the top:

```md
---
confluence_page_id: 123456
title: "Getting started"
---
```

That's it, now every document with this kind of frontmatter will be include in the sync. Markdown files without it, will never be included.


## Adding a workflow that runs this action


### Adding the secrets

In your repo, Settings > Secrets and variables > Actions you need to add 3 repository secrets:

- `CONFLUENCE_BASE_URL` destination confluence base url, for example `https://your-site.atlassian.net`
- `CONFLUENCE_EMAIL` email of the authenticated account, typically a bot/organization email
- `CONFLUENCE_API_TOKEN` API token associated to email, created in the Atlassian account settings


### Adding the workflow

This is an example workflow. The action is triggered on pushes and merges to main, using the three previously set env variables.

```yaml
name: Documentation / push to Confluence

on:
  push:
    branches:
      - 'main'
  workflow_dispatch:
concurrency:
  group: confluence-docs-push
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  push:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    environment: confluence-docs
    env:
      CONFLUENCE_BASE_URL: ${{ secrets.CONFLUENCE_BASE_URL }}
      CONFLUENCE_EMAIL: ${{ secrets.CONFLUENCE_EMAIL }}
      CONFLUENCE_API_TOKEN: ${{ secrets.CONFLUENCE_API_TOKEN }}

    steps:
      - name: Checkout the repository
        uses: actions/checkout@7

      - name: Push documentation to Confluence
        uses: Adyen/github-actions-internal/markdown-confluence-sync@main
```

### Example


### Optional configuration and inputs

| Input | Default | Description |
| --- | --- | --- |
| `banner` | Auto-generated warning with a source link | Signals that the page should not be manually edited on Confluence. |
