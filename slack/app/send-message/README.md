# Slack app send message

Send a message to a Slack channel using a Slack app and the Slack `chat.postMessage` API.

The action retries rate-limited requests up to three times and honors Slack's `Retry-After` header. It can also reply to an existing thread and returns the timestamp of the posted message.

## Slack app setup

The Slack app must:

- have the `chat:write` bot token scope;
- be installed in the target Slack workspace;
- have access to the target channel.

Store the app's bot token as a GitHub Actions secret. Do not add the token to workflow files.

## Usage

```yaml
steps:
  - name: Send Slack message
    id: slack-message
    uses: Adyen/github-actions/slack/app/send-message@main
    with:
      bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
      channel: ${{ vars.SLACK_CHANNEL_ID }}
      message: Release completed successfully.

  - name: Reply in thread
    uses: Adyen/github-actions/slack/app/send-message@main
    with:
      bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
      channel: ${{ vars.SLACK_CHANNEL_ID }}
      message: Deployment completed successfully.
      thread-ts: ${{ steps.slack-message.outputs.thread-ts }}
```

Pin the action to a commit SHA instead of `main` in production workflows.

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `bot-token` | Yes | Slack bot token used to authenticate the app. |
| `channel` | Yes | Slack conversation ID for the target channel or direct message. |
| `message` | Yes | Message text. |
| `thread-ts` | No | Timestamp of an existing Slack message to reply to. |

## Outputs

| Output | Description |
| --- | --- |
| `thread-ts` | Timestamp of the posted message, for thread replies. |
