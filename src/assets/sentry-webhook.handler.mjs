/* eslint-disable import/no-unresolved, no-console */
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import process from 'node:process'

import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'

const { VARIABLES_PARAMETER_ARN } = process.env
assert.ok(VARIABLES_PARAMETER_ARN)

const {
  SENTRY_INTEGRATION_TOKEN,
  SENTRY_CLIENT_SECRET,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  TELEGRAM_CHAT_THREAD_ID,
} = JSON.parse(
  (
    await new SSMClient().send(
      new GetParameterCommand({
        Name: VARIABLES_PARAMETER_ARN,
        WithDecryption: true,
      }),
    )
  ).Parameter.Value,
)

export async function handler(event) {
  console.log('got event:', JSON.stringify(event, null, 2))
  if (event.headers['sentry-hook-resource'] !== 'event_alert') {
    console.log("event resource doesn't match. skipping...")
    return
  }

  if (
    crypto
      .createHmac('sha256', SENTRY_CLIENT_SECRET)
      .update(event.body, 'utf8')
      .digest('hex') !== event.headers['sentry-hook-signature']
  ) {
    console.log("signature doesn't match. skipping...")
    return
  }

  // https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issue-alerts/
  console.log('parsing event body...')
  const { issue_url } = JSON.parse(event.body).data.event

  // https://docs.sentry.io/api/events/retrieve-an-issue/
  console.log('fetching sentry issue...')
  const response = await fetch(issue_url, {
    headers: {
      Authorization: `Bearer ${SENTRY_INTEGRATION_TOKEN}`,
    },
  })
  if (!response.ok) {
    console.error(
      'Cannot retrieve Sentry issue. Response -',
      await response.text(),
    )
    throw new Error('Cannot retrieve Sentry issue')
  }
  const {
    permalink,
    shortId,
    title,
    status,
    project: { name: projectName },
  } = await response.json()

  console.log('sending Telegram message...')
  await sendTelegramMessage({
    chatId: TELEGRAM_CHAT_ID,
    threadId: (() => {
      const parsed = Number.parseInt(TELEGRAM_CHAT_THREAD_ID)
      if (Number.isNaN(parsed)) {
        return null
      }
      return parsed
    })(),
    text: `__*_🚨 Sentry Issue Alert 🚨_*__

*Title*: ${escapeMd(title)}
*Short ID*: ${escapeMd(shortId)}
*Status*: ${escapeMd(status)}
*Permalink*: ${escapeMd(permalink)}
*Project Name*: ${escapeMd(projectName)}`,
  })
}

// https://core.telegram.org/bots/api#markdownv2-style
function escapeMd(text) {
  for (const character of [
    '_',
    '*',
    '[',
    ']',
    '(',
    ')',
    '~',
    '`',
    '>',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}',
    '.',
    '!',
  ]) {
    text = text.replaceAll(character, `\\${character}`)
  }
  return text
}

async function sendTelegramMessage({ chatId, threadId, text }) {
  // https://core.telegram.org/bots/api#sendmessage
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        // eslint-disable-next-line eqeqeq
        ...(threadId != null && { message_thread_id: threadId }),
        text,
        parse_mode: 'MarkdownV2',
      }),
    },
  )
  if (!response.ok) {
    console.error(
      'Cannot send Telegram message. Response -',
      await response.text(),
    )
    throw new Error('Cannot send Telegram message')
  }
  // Avoid memory leak https://undici.nodejs.org/#/?id=garbage-collection
  // eslint-disable-next-line unused-imports/no-unused-vars
  for await (const _chunk of response.body) {
    //
  }
}
