# ADS-B Custom Viewer

A clean, modern starter viewer for your ADS-B feeder using `readsb` / `tar1090` JSON.

## What it does

- Shows aircraft on a Leaflet map
- Pulls live data from `aircraft.json`
- Displays callsign, hex, altitude, speed, track, and aircraft type
- Includes a clean right-side aircraft list
- Works as a static site on GitHub Pages or Cloudflare Pages/Workers

## Setup

Edit:

```js
src/config.js
```

Change:

```js
FEED_URL: "https://feed.yourdomain.com/data/aircraft.json"
```

to your actual Cloudflare Tunnel URL.

Common examples:

```text
https://feed.yourdomain.com/data/aircraft.json
https://feed.yourdomain.com/tar1090/data/aircraft.json
```

## Local testing

Open `index.html` in a browser, or run a simple local server:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## GitHub

Create a repo and upload these files.

Suggested repo name:

```text
adsb-custom-viewer
```

## Next features to add

- MEMS branding
- aircraft trails
- emergency/public safety aircraft highlighting
- range rings
- dark/light map toggle
- receiver status panel
