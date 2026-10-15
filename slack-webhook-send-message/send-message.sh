set -e -o pipefail

PAYLOAD=$(jq -n --arg text "$MESSAGE" '{text: $text}')

MAX_RETRIES=3
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_RETRIES ]; do
  ATTEMPT=$((ATTEMPT + 1))

  if HTTP_STATUS=$(curl -sS --max-time 30 \
    -D /tmp/slack-webhook-headers.txt -o /tmp/slack-webhook-response.txt \
    -w "%{http_code}" -X POST "$SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD"); then
    CURL_STATUS=0
  else
    CURL_STATUS=$?
  fi

  if [ "$CURL_STATUS" -eq 0 ] && [ "$HTTP_STATUS" == "200" ]; then
    exit 0
  fi

  if [ "$CURL_STATUS" -ne 0 ] && [ $ATTEMPT -lt $MAX_RETRIES ]; then
    WAIT=4
    echo "Slack transport error (curl exit $CURL_STATUS). Waiting ${WAIT}s before retry (attempt $ATTEMPT/$MAX_RETRIES)..."
    sleep "$WAIT"
  elif [ "$CURL_STATUS" -ne 0 ]; then
    echo "Slack transport error (curl exit $CURL_STATUS)."
    exit 1
  elif [ "$HTTP_STATUS" == "429" ] && [ $ATTEMPT -lt $MAX_RETRIES ]; then
    RETRY_AFTER=$(awk 'tolower($1) == "retry-after:" {print $2}' /tmp/slack-webhook-headers.txt | tr -d '\r')
    WAIT=${RETRY_AFTER:-4}
    echo "Rate limited. Waiting ${WAIT}s before retry (attempt $ATTEMPT/$MAX_RETRIES)..."
    sleep "$WAIT"
  elif [ "$HTTP_STATUS" -ge 500 ] && [ "$HTTP_STATUS" -lt 600 ] && [ $ATTEMPT -lt $MAX_RETRIES ]; then
    WAIT=4
    echo "Slack server error (HTTP $HTTP_STATUS). Waiting ${WAIT}s before retry (attempt $ATTEMPT/$MAX_RETRIES)..."
    sleep "$WAIT"
  else
    ERROR=$(cat /tmp/slack-webhook-response.txt)
    echo "Slack webhook error (HTTP $HTTP_STATUS): $ERROR"
    exit 1
  fi
done
