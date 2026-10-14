set -e -o pipefail

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT
HEADERS_FILE="$TEMP_DIR/headers"
RESPONSE_FILE="$TEMP_DIR/response"
AUTH_HEADER_FILE="$TEMP_DIR/auth-header"
PAYLOAD_FILE="$TEMP_DIR/payload"

printf 'Authorization: Bearer %s\n' "$SLACK_BOT_TOKEN" > "$AUTH_HEADER_FILE"
chmod 600 "$AUTH_HEADER_FILE"
jq -n \
  --arg channel "$CHANNEL" \
  --arg text "$MESSAGE" \
  --arg thread_ts "$THREAD_TS" \
  'if $thread_ts != "" then {channel: $channel, text: $text, thread_ts: $thread_ts} else {channel: $channel, text: $text} end' \
  > "$PAYLOAD_FILE"

MAX_RETRIES=3
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_RETRIES ]; do
  ATTEMPT=$((ATTEMPT + 1))

  HTTP_STATUS=$(curl -sS --connect-timeout 10 --max-time 30 \
    -D "$HEADERS_FILE" -o "$RESPONSE_FILE" \
    -w "%{http_code}" -X POST "https://slack.com/api/chat.postMessage" \
    -H @"$AUTH_HEADER_FILE" \
    -H "Content-Type: application/json" \
    --data-binary @"$PAYLOAD_FILE")
  RESPONSE=$(cat "$RESPONSE_FILE")

  if [ "$HTTP_STATUS" == "200" ] && [ "$(echo "$RESPONSE" | jq -r '.ok')" == "true" ]; then
    echo "thread-ts=$(echo "$RESPONSE" | jq -r '.ts')" >> "$GITHUB_OUTPUT"
    exit 0
  fi

  if [ "$HTTP_STATUS" == "429" ] && [ $ATTEMPT -lt $MAX_RETRIES ]; then
    RETRY_AFTER=$(awk 'tolower($1) == "retry-after:" {print $2}' "$HEADERS_FILE" | tr -d '\r')
    WAIT=${RETRY_AFTER:-4}
    echo "Rate limited. Waiting ${WAIT}s before retry (attempt $ATTEMPT/$MAX_RETRIES)..."
    sleep "$WAIT"
  else
    ERROR=$(echo "$RESPONSE" | jq -r '.error // "unknown_error"')
    echo "Slack API error (HTTP $HTTP_STATUS): $ERROR"
    exit 1
  fi
done
