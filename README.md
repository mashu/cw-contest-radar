# CW Contest Radar

A static web app that answers two questions for a CW operator: **which contest is
on the air right now (or on any date I pick, or on the frequency I'm tuned to),
and exactly what do I send back?**

It's a Next.js static export, so it runs on GitHub Pages with no server. Contest
schedules are computed in the browser from a hand-verified database, and a
scheduled GitHub Action keeps a live "this week" feed, an RSS feed, and a
subscribable calendar fresh.

## How the data works

Two independent layers, by design:

1. **Curated database** (`lib/contests.ts`). Every contest carries a *recurrence
   rule* — "last full weekend of November", "every Wednesday 1300Z", etc. — plus
   its exchange, bands, rules link and tips. `lib/recurrence.ts` expands those
   rules into concrete UTC sessions **client-side**, so the timeline, the 24-hour
   view, the search and the exchanges all work offline and for any date. This is
   the authoritative "how to answer it" source.

2. **Live feed** (`public/data/contests.json`). A cron job pulls the current week
   from the [WA7BNM Contest Calendar](https://www.contestcalendar.com/), filters
   it to CW, and commits it as static JSON. **Every CW row is folded into the
   radar** — known contests get curated exchanges; anything new or unlisted still
   appears with whatever name, time, bands, exchange blurb and rules URL the
   calendar published. Nothing is dropped just because we lack a hand-written
   recurrence rule.

Because the app never depends on the live feed to function, the very first deploy
already works — the committed seed JSON is enough, and the recurrence engine does
the rest.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # verifies the recurrence engine + exchanges (17 contests)
npm run build        # static export to ./out
```

Generate the data files locally (the live pull needs network; a sample is
included for offline runs):

```bash
# offline, from the bundled sample:
SAMPLE_FILE=scripts/sample-weeklycal.txt npm run refresh
npm run build-feeds
# online (what CI runs):
npm run data
```

## Deploying to GitHub Pages

Two workflows are included:

- **`.github/workflows/deploy.yml`** — builds and deploys on every push to `main`.
  It sets `NEXT_PUBLIC_BASE_PATH=/<repo>` automatically so a project site served
  at `https://<you>.github.io/<repo>/` gets the right asset paths.
- **`.github/workflows/refresh-data.yml`** — every 6 hours, pulls WA7BNM, rebuilds
  the RSS + calendar, and commits if anything changed (which triggers a redeploy).

To turn it on: push the repo, then in **Settings → Pages** set the source to
**GitHub Actions**. Both workflows need the default `GITHUB_TOKEN` write access
(already declared in each file).

**Root site or custom domain?** If you serve from `https://<you>.github.io/`
(a `<you>.github.io` repo) or a custom domain, leave the base path empty — remove
the `NEXT_PUBLIC_BASE_PATH` line in `deploy.yml`.

## Subscriptions

Both are plain static files the refresh job regenerates:

- **RSS** — `…/feed.xml`, point any reader at it.
- **Calendar** — `…/cw-contests.ics`. In Google Calendar: *Other calendars →
  From URL* and paste the full `https://…/cw-contests.ics` address. Google
  re-reads it on its own schedule, so refreshed data flows through.

## Your station

The **profile** chip in the header stores your call, name, zones, grid, power,
province/SPC, country tag, etc. in this browser (localStorage). Every "you send"
line fills in from it — e.g. CQ WW shows `599 15`, SP DX shows `599 R`, CWops
shows `MATEUSZ SO`. Where a rule differs for DX vs. home stations, the app takes
the view from your side.

Works for any callsign worldwide. Sample defaults are a Polish station (SO5KM)
so the first visit already shows realistic exchanges; open the profile once and
your own values stick.

## Adding or editing a contest

Edit `lib/contests.ts`. Each entry is plain data:

```ts
{
  id: "cwt",
  name: "CWops Mini-CWT Test",
  short: "CWT",
  cq: "CQ CWT",
  aliases: ["CWT", "CWO"],      // what you might copy off the air
  bands: ["80","40","20","15","10"],
  exchange: { youSend: "{name} {prefix}", note: "…", rst: false },
  logs: { url: "…" },
  rules: "https://…",
  tier: "sprint",
  recurrence: { kind: "weekly", sessions: [{ days:[3], start:"1300", end:"1400" }] },
}
```

Exchange tokens: `{rst} {serial} {name} {prefix} {age} {cq} {itu} {grid} {spc}
{country} {province} {power}`.

Recurrence kinds:

- `weekly` — UTC weekdays (0=Sun…6=Sat) + `HHMM` windows (wrap past midnight if
  `end ≤ start`).
- `annual` — anchored to the *nth Saturday* of a month, either `fullWeekend`
  (its Sunday is still in the month) or plain `saturday`; sessions are offset in
  hours from that Saturday 00:00Z (negative = the Friday before).
- `manual` — explicit ISO UTC windows, for contests whose dates are announced
  yearly (e.g. YOTA).

Run `npm test` after changes.

## A note on accuracy

The exchanges and schedules are hand-checked, but organizers tweak rules from year
to year. Treat the "you send" lines as a memory aid and **confirm the exact
exchange on each contest's rules page before it counts.** Dates from the built-in
rules are computed; the WA7BNM feed is the tiebreaker for the current week.

## Stack

Next.js 14 (App Router, `output: 'export'`), React 18, TypeScript, hand-written
CSS — no UI framework (and no Tailwind). Visualizations are inline SVG. No
client-side dependencies beyond React. A local `postcss.config.mjs` is included
so builds stay self-contained even if a parent folder has a Tailwind PostCSS
config.
