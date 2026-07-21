# 🌱 Kisan Sathi — Farmer's Companion

A freemium, installable web + Android app for Indian farmers. From the farmer's
GPS location it shows the **soil profile & suitability**, **which crops to grow
this season** with sowing/harvest windows and **live mandi prices**, **loan &
government schemes**, an **AI plant scan** (camera → disease, cure & prevention),
a **voice AI assistant**, **mandi price & severe-weather push alerts**, a
**farm diary with profit reports**, and a **fertilizer dose calculator** —
in **English, हिन्दी, తెలుగు, ಕನ್ನಡ and தமிழ்**, with light/dark mode, offline
support (PWA) and a Play Store build (TWA).

## Free vs Premium (₹199/year via Razorpay)

| Feature | Free | Premium |
| --- | --- | --- |
| Soil, weather, crops, mandi prices, schemes | ✓ | ✓ |
| Fertilizer calculator, farm diary (basic) | ✓ | ✓ |
| AI plant scans | 5 / month | Unlimited |
| Scan history synced across devices | — | ✓ |
| Mandi price & severe-weather push alerts | — | ✓ |
| Voice AI assistant (Ask) | — | ✓ |
| Diary profit reports | — | ✓ |

Accounts use **Google sign-in** (Supabase Auth). Free features work without an
account; scanning requires sign-in so the monthly quota can be enforced.

## Tech stack

- **Next.js 16** (App Router, `proxy.ts`) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **next-themes** · **lucide-react**
- **Supabase** — Postgres (RLS everywhere), Auth (Google), Storage (scan thumbs)
- **Razorpay** — one-time annual Orders + webhook (idempotent, HMAC-verified)
- **@anthropic-ai/sdk** — Claude vision (scan) + assistant (ask)
- **web-push** — VAPID Web Push, sent by a daily Vercel Cron
- Hand-rolled service worker (`public/sw.js`): offline shell + SWR-cached data
- Custom typed i18n (`src/i18n/dicts/*`) — 5 languages, compile-checked

## Getting started

```bash
npm install
# fill .env.local (see below)
npm run dev
```

Use a phone on your LAN (or `next dev --experimental-https`) to test GPS,
camera, mic and push.

### Environment variables

| Key | Needed for |
| --- | --- |
| `ANTHROPIC_API_KEY` | Plant scan + voice assistant |
| `ANTHROPIC_MODEL` | optional model override (default `claude-sonnet-5`) |
| `DATA_GOV_IN_API_KEY` | Live mandi prices (falls back to rate-limited sample key) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + database |
| `SUPABASE_SERVICE_ROLE_KEY` | Billing webhook + alerts cron (server only) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Premium checkout |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push (`npx web-push generate-vapid-keys`) |
| `CRON_SECRET` | Protects `/api/cron/alerts` (Vercel Cron sends it automatically) |

Mirror all of these into the Vercel project settings for production.

## Architecture notes

- Every API route returns `{ ok, data, source, fallbackUsed, error? }`.
  Auth/paywall errors use `auth_required` (401), `premium_required` /
  `quota_exceeded` (402) inside the same envelope.
- Scan quota is enforced by a race-safe `consume_scan()` Postgres function
  (single `INSERT … ON CONFLICT … WHERE count < limit`), keyed to `auth.uid()`
  and the IST month. Refunded if the model call fails.
- `src/proxy.ts` (Next 16's middleware) only refreshes the session cookie and
  optimistically redirects; real checks live in `src/lib/dal.ts`.
- The Razorpay webhook is the billing source of truth: raw-body HMAC,
  timing-safe compare, and an event-id idempotency ledger.
- Play Store packaging: see [docs/PLAY_STORE.md](docs/PLAY_STORE.md).

## Data sources (live, with graceful fallback)

OpenStreetMap Nominatim (reverse geocoding) · Open-Meteo (weather & alerts) ·
ISRIC SoilGrids with state-level fallback (soil) · data.gov.in Agmarknet
(mandi prices) · official scheme summaries with state deep-links.

> Guidance only. For serious crop damage, consult your local
> **Krishi Vigyan Kendra (KVK)**.
