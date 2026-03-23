Track your progress through the project. Update this file as you complete modules — this ensures you don't lose direction or build random pieces without integration.

> **Note:** Logging (Module 7) is a cross-cutting concern — wire it in from Module 4 onwards, not just at the end.
> **Stack:** Cloudflare Workers (JavaScript) + Google Sheets (public read) + Telegram Bot API

## Convention

* `[ ]` = Not started
* `[-]` = In progress
* `[x]` = Completed

---

# Modules

### Module 1: Project Setup & Environment

[x] Install Wrangler CLI (`npm install -g wrangler`)
[x] Login to Cloudflare via Wrangler (`wrangler login`)
[x] Create new Worker project (`wrangler init reminder-bot`)
[x] Select JavaScript as the Worker language
[x] Cron trigger configured in `wrangler.jsonc` (`30 2 * * *` = 8:00 AM IST)
[x] Basic Worker execution test (`wrangler dev`)

---

### Module 2: Google Sheets Data Design & Validation

[x] Define sheet schema (Name, Date, Type)
[x] Populate sample data in Google Sheets
[x] Enforce date format (`YYYY-MM-DD`) in sheet
[x] Publish sheet as public CSV (File > Share > Publish to web > CSV)
[x] Note the published CSV URL for use in Worker
[x] All rows treated as distinct entries — no deduplication

---

### Module 3: Telegram Bot Setup & Secrets

[x] Create bot using BotFather
[x] Retrieve personal chat ID via `@userinfobot`
[x] Store `BOT_TOKEN` via `wrangler secret put BOT_TOKEN`
[x] Store `CHAT_ID` via `wrangler secret put CHAT_ID`
[x] Store `SHEET_URL` via `wrangler secret put SHEET_URL`

---

### Module 4: Data Processing Module

[x] Fetch Google Sheets CSV via `fetch()` in Worker using an abstracted `loadData()` function
[x] Parse CSV response into array of objects
[x] Convert Date values to date objects
[x] Handle parsing errors safely
[x] Normalize Type values (Birthday / Anniversary) — case insensitive
[x] Clean name formatting (strip spaces, casing)
[x] Add logging for data issues

---

### Module 5: Event Filtering Logic

[x] Get current date (IST timezone — UTC+5:30 offset)
[x] Extract day and month from dataset
[x] Compare with current date
[x] Filter today's events
[x] Handle empty results case
[x] Handle Feb 29 edge case — fire on Feb 28 in non-leap years (decided)

---

### Module 6: Message Formatting Engine

[x] Create message template
[x] Format multiple events into one message
[x] Add emojis and readability
[x] Handle single vs multiple entries
[x] Age calculation (turns X years old)
[x] Anniversary year calculation (X years)

---

### Module 7: Notification Trigger System

[x] Integrate filtered events with message engine
[x] Call Telegram `sendMessage` API via `fetch()` in Worker
[x] Send message only if events exist
[x] Handle API errors (invalid token, network issues)
[x] Add fallback message (optional: "No events today")
[x] Prevent duplicate sends — Cloudflare cron guarantees single daily trigger, no extra safeguard needed
[x] Add execution logs via `console.log` (visible in Cloudflare Workers dashboard)

---

### Module 8: Logging & Error Handling

[x] Use `console.log` / `console.error` for all logs (visible in Cloudflare Workers Logs)
[x] Log script start and end
[x] Log number of records processed
[x] Log errors (fetch failure, parsing issues)
[x] Log Telegram send status
[x] Add basic retry on Telegram send failure

---

### Module 9: Scheduler Setup & Deployment

[x] Verify cron trigger in `wrangler.jsonc` (`30 2 * * *` = 8:00 AM IST)
[x] Deploy Worker (`wrangler deploy`)
[x] Verify cron trigger is active in Cloudflare dashboard (Workers & Pages > your Worker > Triggers)
[x] Trigger manually once to confirm end-to-end flow
[x] Handle Worker failures (Cloudflare logs + Telegram error alert)

---

### Module 10: Testing & Validation

[x] Test with sample sheet data
[x] Test with multiple events same day
[x] Test with no events
[x] Test invalid/missing sheet data
[x] Test Telegram failure scenarios
[x] Validate IST timezone correctness

---

### Module 11: Monitoring & Maintenance

[ ] Monitor logs for 3–5 days
[ ] Fix edge case failures
[ ] Verify scheduler runs daily

---

### Module 12: Optional Enhancements (Post-MVP)

[ ] Add UI for managing Google Sheet data
[ ] Add email fallback notifications
[ ] Add weekly/monthly summary message
[ ] Add backup/export feature
[ ] Interactive bot — step-by-step conversation to add/update entries in Google Sheet (requires Google Sheets API + service account + Cloudflare KV for conversation state)
[ ] Multi-user support — each user manages their own sheet; bot maps chat_id to sheet_url on first use; consider master sheet or `/setup <url>` command (requires rethinking architecture from single-user to multi-user platform)

---
