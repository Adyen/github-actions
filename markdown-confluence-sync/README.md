# Confluence Markdown sync

Syncs Markdown documentation from the repo to Confluence.

## Usage

First create a page on confluence and find the page id in the url `pages/{pageId}/some-text`.
In your repository add frontmatter to the Markdown document that should be synced:

```md
---
confluence_page_id: 123456
title: "Getting started"
---
```
Every document with that frontmatter will be synced to Confluence.

The following secrets are needed for Github Actions: `CONFLUENCE_BASE_URL`, `CONFLUENCE_EMAIL`, and `CONFLUENCE_API_TOKEN`.

```yaml
jobs:
  sync:
    runs-on: ubuntu-latest
    environment: confluence-docs
    steps:
      - uses: actions/checkout@<pinned-SHA>
      - uses: Adyen/github-actions-internal/markdown-confluence-sync@v1
        env:
          CONFLUENCE_BASE_URL: ${{ secrets.CONFLUENCE_BASE_URL }}
          CONFLUENCE_EMAIL: ${{ secrets.CONFLUENCE_EMAIL }}
          CONFLUENCE_API_TOKEN: ${{ secrets.CONFLUENCE_API_TOKEN }}
```

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `banner` | Auto-generated warning with a source link | Signals that the page should not be manually edited on Confluence. |

The frontmatter must have `confluence_page_id` and `title`.

`CONFLUENCE_BASE_URL` must be the site origin, for example `https://your-site.atlassian.net`.

`CONFLUENCE_EMAIL` can be a bot email, and will result as the author of the changes.
