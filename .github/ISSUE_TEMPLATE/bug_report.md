---
name: Bug report
about: Report an action that is not behaving as documented
title: '[Bug] '
labels: 'bug'
assignees: ''
---

## Action

Which action is affected, and at which version?

- Action: `Adyen/github-actions-internal/<action>`
- Version / ref: <!-- e.g. v1, v1.2.0, or a commit SHA -->

## Description

A clear description of what is going wrong.

## Expected behavior

What you expected the action to do, and where that behavior is documented (link to the action README if relevant).

## Actual behavior

What actually happens.

## Steps to reproduce

1.
2.
3.

## Workflow snippet

The relevant part of the consuming workflow, with the action inputs used.

```yaml
steps:
  - uses: actions/checkout@v7

  - uses: Adyen/github-actions-internal/<action>@<version>
    with:
      # inputs
```

## Logs

Relevant workflow run output or error messages.

> Do not paste secrets, tokens, or other credentials. Redact any sensitive values before submitting.

```
```

## Additional context

Anything else that helps, such as when it last worked, recent version bumps, or a link to a failing workflow run.

## Are you willing to fix this?

- [ ] I would like to open a pull request for this

If so, see [CONTRIBUTING.md](https://github.com/Adyen/github-actions-internal/blob/main/CONTRIBUTING.md).
