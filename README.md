# 🌱 Kisan Sathi — Farmer's Companion

A mobile-first web app for Indian farmers. From the farmer's GPS location it shows the
**soil profile & suitability**, **which crops to grow this season** with sowing/harvest
windows and **live mandi prices**, **loan & government schemes** with tap-to-call contacts,
and an **AI plant scan** (camera → growth stage, health, disease, cure & prevention).
Full **English ⇄ Hindi** toggle and **light/dark** mode throughout.

## Features

| Screen | What it does |
| --- | --- |
| **Soil** | GPS → district/state, soil type, texture, pH, fertility, composition, suitability + live weather & farming tip |
| **Crops** | Current season (Kharif/Rabi/Zaid), crops matched to your soil with sow/harvest calendar, water need, and live mandi prices |
| **Support** | KCC, PM-Kisan, PMFBY, NABARD & AIF schemes; Kisan Call Centre, KVK, State Agri Dept, Soil Health Card & e-NAM contacts |
| **Scan** | Camera or photo upload → Claude vision → growth stage, healthy/unhealthy, disease, cause, treatment, prevention, tips. History saved on-device. |

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **next-themes** (dark mode) · **lucide-react**
- **@anthropic-ai/sdk** — Claude vision for plant analysis
- **zod** — validates every external API response
- Custom lightweight i18n (`src/i18n`) with `en`/`hi` dictionaries

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then add your keys
npm run dev
```

Open the URL it prints. **Use a phone (or a real device on your LAN) to test GPS and camera** —
both require HTTPS or `localhost` and a real device sensor.

### Environment variables

| Key | Needed for | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Plant Scan | Get one at [console.anthropic.com](https://console.anthropic.com/). Without it, Scan shows a friendly "add key" message. |
| `DATA_GOV_IN_API_KEY` | Live mandi prices | Free at [data.gov.in](https://data.gov.in/) → My Account → Generate API key. Without it the app uses data.gov.in's shared **sample key**, which is heavily rate-limited (429s are expected). |
| `ANTHROPIC_MODEL` | (optional) | Overrides the scan model. Defaults to `claude-sonnet-5`. |

## Data sources (live, with graceful fallback)

- **Reverse geocoding** — OpenStreetMap Nominatim (no key)
- **Weather** — Open-Meteo (no key)
- **Soil** — ISRIC SoilGrids point query. ⚠️ **SoilGrids' REST API is currently paused (2026)**,
  so the app transparently falls back to a **state-level soil estimate** and badges the card
  **"Estimated"** instead of **"Live"**. When SoilGrids returns, it is used automatically.
- **Mandi prices** — data.gov.in Agmarknet daily price resource
- **Loan schemes & agencies** — there is no queryable live API for "which loan to take / whom to
  contact", so these are official scheme summaries + official portal/locator deep-links keyed to
  your state. Details are guidance — confirm current terms at the official source.

Every API route returns a `{ ok, data, source, fallbackUsed }` envelope, so the UI shows a
**Live / Estimated / Not available** badge and never breaks on a dead upstream.

## Project structure

```
src/
  app/
    page.tsx                 Soil & Location
    crops/  support/  scan/  feature pages
    api/{geo/reverse,soil,weather,market,scan}/route.ts
  components/                Header, TabBar, cards, camera, toggles, UI kit
  i18n/                      en/hi dictionaries + LanguageProvider
  lib/                       soil classifier, season logic, API client, providers, types
  data/                      soil-regions, crops calendar, schemes & agencies
```

## Notes & ideas for later

- Add accounts + cloud sync (Supabase) to save scans and farm profiles across devices.
- Offline PWA caching for low-connectivity areas.
- More granular district-level soil via Soil Health Card datasets once available.

> Guidance only. For serious crop damage, consult your local **Krishi Vigyan Kendra (KVK)**.
