# Slack webhook send message

Send a message to a Slack channel using a Slack incoming webhook.

The action retries rate-limited requests and transient Slack server errors up to three times. Rate-limited requests honor Slack's `Retry-After` header.

## Webhook setup

Create an incoming webhook for the target Slack channel and store its URL as a GitHub Actions secret. Do not add the webhook URL to workflow files.

## Usage

```yaml
steps:
  - name: Send Slack message
    uses: Adyen/github-actions/slack/webhook/send-message@main
    with:
      webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
      message: Deployment completed successfully.
```

Pin the action to a commit SHA instead of `main` in production workflows.

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `webhook-url` | Yes | Slack incoming webhook URL. |
| `message` | Yes | Message text. |
