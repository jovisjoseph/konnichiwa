# konnichiwa

Konnichiwa, the trip companion app for our Japan trip, Oct 18 to 29, 2026.

## What's here

- `site/`: the built app, served by Cloudflare Pages. `index.html` is self-contained; `sw.js` and `manifest.webmanifest` make it an installable, offline PWA; `art/` and `icons/` hold the illustrations.
- `src/data.js`: all trip content (days, stops, travel legs, things to see, history, food, bookings).
- `src/app.js`, `src/app.css`: the app (day view, re-planning, drag to reorder, wallet, taxi cards, QR and link sync).
- `vendor/`: QR code generator (qrcode-generator, MIT) and scanner (jsQR, Apache 2.0).
- `itinerary/index.html`: the day-by-day itinerary page.

## Rebuild after editing

```
python3 build.py
```

This regenerates `site/` from `src/`, `vendor/`, `art/` and `icons/`, and gives the service worker a new cache version so installed phones pick up the change on their next open.

## Deploy (Cloudflare Pages)

Connect this repo in Cloudflare Pages, no build command, output directory `site`. Or drag the `site` folder onto Pages → Create → Upload assets.

The site contains booking references, so put it behind Cloudflare Access (Zero Trust → Access → Applications, email one-time PIN for our four addresses) before sharing the URL.

## How sync works

Each phone keeps its own plan in the browser. Sync → Show my QR code (or Share as a link) packs only the changes; scanning or opening the link offers to replace the other phone's plan, with Undo. No accounts, no server.


## Install on a phone

Open the site once while online. Android (Chrome): Sync → Install the app. iPhone (Safari): Share → Add to Home Screen. After that it opens full screen and works with no signal.
