# SentryWebhook

> See [Sentry docs](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/)

Sentry [doesn't support](https://github.com/getsentry/sentry/issues/61998) Telegram integrations.
This component deploys a lambda function that handles [issue alerts](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issue-alerts/) and sends notifications to the Telegram chat.

## Setup

1. Create Sentry Internal Integration ([docs](https://docs.sentry.io/api/guides/create-auth-token/)) without specifying Webhook URL.
1. Create an integration token, copy _Client Secret_ and the newly created _integration token_.
1. Create a Telegram bot ([docs](https://core.telegram.org/bots#how-do-i-create-a-bot)) and copy the _bot token_.
1. Get the _chat id_ of the Telegram chat (see [How to get chat id and message thread id](https://stackoverflow.com/a/75178418)) and (optionally, if this chat has topics enabled) a _message thread id_
1. Deploy the `SentryWebhook` component with the above tokens and get a webhook URL.
1. Go back to Sentry Integration, set the Webhook URL, set the required permissions (`event:read`, `project:read`), select `issue: created, resolved, assigned, archived, unresolved` under Webhooks section and enable Alert Rule Action.

You can now create Issue Alerts using this integration - see [docs](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issue-alerts/).
