---
name: Feature request
about: Propose a new action or a change to an existing one
title: '[Feature] '
labels: 'enhancement'
assignees: ''
---

## Scope

- [ ] Change to an existing action: `Adyen/github-actions/<action>`
- [ ] New reusable action

## Problem

What automation problem are you trying to solve? Describe the current workflow and why it is duplicated, manual, or error-prone across repositories.

## Proposed solution

What should the action do? Keep the interface small and explicit.

## Proposed interface

Inputs, outputs, required permissions, and secrets you expect.

| Input | Required | Default | Description |
| :---- | :---- | :---- | :---- |
| | | | |

| Output | Description |
| :---- | :---- |
| | |

- Required token permissions:
- Required secrets:

## Example usage

```yaml
steps:
  - uses: actions/checkout@v7

  - uses: Adyen/github-actions/<action>@<version>
    with:
      # inputs
```

## Backwards compatibility

Does this change the interface or behavior of an existing action? If so, can it be done within the current major version, or does it require a breaking change?

- [ ] Backwards compatible
- [ ] Breaking change

## Alternatives considered

Existing actions from the Marketplace, inline workflow steps, or other approaches, and why they are not sufficient.

## Additional context

Which repositories would consume this, and anything else that is relevant.

## Are you willing to implement this?

- [ ] I would like to open a pull request for this

If so, see [CONTRIBUTING.md](https://github.com/Adyen/github-actions/blob/main/CONTRIBUTING.md).
