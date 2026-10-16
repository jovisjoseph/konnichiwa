# konnichiwa

Kitsune Tabi (きつね旅), the trip companion app for our Japan trip, Oct 18 to 29, 2026.

## What's here

- `site/index.html`: the built app. One self-contained file; this is what Cloudflare Pages serves.
- `src/data.js`: all trip content (days, stops, travel legs, things to see, history, food, bookings).
- `src/app.js`, `src/app.css`: the app (day view, re-planning, drag to reorder, wallet, taxi cards, QR and link sync).
- `vendor/`: QR code generator (qrcode-generator, MIT) and scanner (jsQR, Apache 2.0).
- `itinerary/index.html`: the day-by-day itinerary page.

## Rebuild after editing

```
python3 build.py
```

This regenerates `site/index.html` from `src/` and `vendor/`.

## Deploy (Cloudflare Pages)

Connect this repo in Cloudflare Pages, no build command, output directory `site`.

## How sync works

Each phone keeps its own plan in the browser. Sync → Show my QR code (or Share as a link) packs only the changes; scanning or opening the link offers to replace the other phone's plan, with Undo. No accounts, no server.
