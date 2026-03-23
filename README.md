# Reminder Bot

A Cloudflare Worker that sends daily Telegram reminders for birthdays and anniversaries, sourced from a Google Sheet. Runs automatically at **8:00 AM IST** every day via cron.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Google Sheet published as CSV

## Google Sheet Setup

1. Create a sheet with columns: `Name`, `Type`, `Date`
2. `Type` must be either `Birthday` or `Anniversary`
3. `Date` format: `YYYY-MM-DD`
4. Publish it: **File → Share → Publish to web → CSV**
5. Copy the published CSV URL

Example:

| Name  | Type        | Date       |
|-------|-------------|------------|
| Alice | Birthday    | 1995-06-15 |
| Bob   | Anniversary | 2018-03-22 |

## Setup

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd reminder-bot
npm install
```

2. Create a `.dev.vars` file for local development:

```
BOT_TOKEN=<your_telegram_bot_token>
CHAT_ID=<your_telegram_chat_id>
SHEET_URL=<your_google_sheet_csv_url>
```

3. Add secrets to Cloudflare for production:

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put CHAT_ID
npx wrangler secret put SHEET_URL
```

## Development

Run locally and test the cron trigger:

```bash
npm run dev
```

Then visit `http://localhost:8787/__scheduled` to manually trigger the cron.

## Deploy

```bash
npm run deploy
```

The worker runs on cron `30 2 * * *` (UTC), which is **8:00 AM IST**.
