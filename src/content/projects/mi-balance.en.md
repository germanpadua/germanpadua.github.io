---
locale: en
slug: mi-balance
title: Mi Balance
summary: A PWA for iPhone that records income and expenses and calculates the monthly savings rate. The data never leaves the device, backups
  are encrypted and it works offline.
role: Design, implementation and testing
period: August 2026
year: 2026
order: 8
status: shipped
visibility: case-study
confidentiality: Private repository. There is no server and no account, so there is nothing to publish.
domains:
- local-first
- web applications
- applied cryptography
- accessibility
stack:
- React
- TypeScript
- Vite
- Dexie / IndexedDB
- Zod
- Recharts
- Web Crypto
- Vitest
- Playwright
metrics: []
highlights:
- 'No backend, no account, no sync and no telemetry. The content security policy blocks every outgoing connection, so the guarantee does not rest
  on my word: the browser enforces it.'
- The backup is encrypted on the device with AES-256-GCM and a key derived with 600 000 iterations, and it carries authenticated additional data
  so a file from another version cannot be restored by mistake.
- 'Restoration is atomic: it validates, shows a preview and only then replaces, all inside a single transaction. A corrupt backup cannot leave
  you with half your data.'
- Money is stored as whole cents. No floating decimals in a ledger.
- What has been done and what is planned are derived from the device's local date and are never persisted, so there is no state that can fall
  out of sync when the day or the time zone changes.
limits:
- The 80 % and 90 % coverage figures are contractual thresholds of the project, not measurements. I have no coverage report to publish, so I list
  them as targets.
- There is no CSV export or import, no multi-currency, no sync between devices. It is out of scope, on purpose.
- Validation on a physical iPhone is still pending and I am not going to take it as done.
- 'An internal review of the code itself documented a critical failure in the full data wipe: the settings screen received the database as null
  and the operation did nothing. It is written in the project''s log. I do not present it as resolved until I have verified it with the tests
  in hand.'
- The references folder includes a screenshot of another application I used as visual inspiration. Its own documentation forbids reusing it as
  an image, so it does not appear in this portfolio.
---

## The problem

Personal finance apps ask for an account, upload your transactions to a server and live off that. To know how much I save per month I do not need to hand my accounts to anyone.

Mi Balance does the opposite: **everything happens on the device**. There is no server, no account, no sync, no analytics.

## The decisions that carry weight

**No backend.** It is not a limitation, it is the feature. The data lives in IndexedDB and only moves if the user exports a backup.

**The browser enforces the guarantee.** I could promise in the documentation that the app sends no data. Instead there is a content security policy with `connect-src none`: any attempt at an outgoing connection fails in the browser. A verifiable promise is worth more than a written one.

**Encryption with explicit parameters.** The backup uses AES-256-GCM with a key derived by PBKDF2-HMAC-SHA-256 and 600 000 iterations, and adds authenticated data carrying the format version. The latter avoids the rare, unpleasant case of restoring a file from another version and ending up with half your data.

**Atomic restoration.** Validate, preview and replace in a single transaction. If something fails, there is no intermediate state.

**Whole cents.** Storing money in floating point is an error that is discovered late and fixed badly.

## What did not go well

I wrote the project log with the same honesty as this portfolio, and it records a critical failure I found myself: the full data wipe did nothing, because the settings screen received the database as null and returned before touching anything.

That failure is worth more than the code that did work, because it proves the review exists. A project that only tells you what went well is not telling you about the project.
