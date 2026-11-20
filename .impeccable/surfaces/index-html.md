---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

## Scope and visitor mode

Operate. The whole single-page app at index.html: Dashboard (Home), Trades, Analytics, Portfolio & Wallet, ZSE/VFEX, Goals & Giving, Pulse, Simulator, Admin, plus auth, modals and forms. The visitor's job is to know where their money is, update prices, log trades and read performance.

## Audience, job, action, proof, constraints

ZSE/VFEX retail investors in Zimbabwe, phone and desktop equally. Job: see total value and today's move, scan holdings, log a trade. Primary action: read the portfolio number; secondary: New trade. Proof: real Supabase prices, holdings, wallets, wallet history. Constraints: single HTML file, inline CSS/JS, ECharts + Canvas 2D charts, theme toggle must survive and now defaults to the device setting.

## Redesign request (2026-11-20)

User asked for "the Robinhood look": clean, no tiles, no lines, no divisions. Answers: theme follows the device (toggle still overrides); slim top navigation bar replaces the sidebar (bottom tab bar stays on mobile); whole app in one pass, with Dashboard, ZSE/VFEX and Portfolio rebuilt.

## Direction contract

**THESIS:** Tsoro is one big number and one line: the page is the portfolio, not a dashboard about it. It refuses the incumbent tile wall (bordered stat strips, cards in cards, ruled tables, a sidebar panel) and lets whitespace, type size and the green/orange-red of the day do all the separating.

**OWN-WORLD:** Robinhood's grammar on Tsoro's facts. Page and surface are the same colour: pure white (#FFFFFF) or true black (#000000) by device. Near-black/white text, one grey for secondary (#6B6B73 / #8E8E96). Gain green #00C853 (text-safe #008A3E on white), loss orange-red #FF5000 (#D93A00 on white). Geist, tabular numerals, money set large and semibold. No borders, no card fills, no row rules; a faint fill (#F4F4F5 / #151517) only for inputs, hover and pressed states. Pill buttons: green with black ink for the primary action, grey fill for secondary. Charts are a single 2px line with no grid or axes, a dotted baseline, area-free.

**STORY:** The investor opens Tsoro and reads their total and today's move before anything else. They drag across the line to see what they were worth on any day, glance at the holdings rail on the right, then drop into ZSE/VFEX to update a price or into Trades to log one. They leave knowing exactly where the money is.

**FIRST VIEWPORT:** Top bar 64px: "Tsoro" wordmark left; Home, Trades, Portfolio, ZSE / VFEX, Analytics, More in one quiet text row; New trade (green pill) and the account avatar right. Under it the holdings ticker as a borderless quiet strip. Content centred at max 1180px in two columns. Left (fluid): "Portfolio" label, the total at ~44px semibold, change line "+$4.21 (+0.77%) Today" in trend colour, then the value chart full column width (~280px tall), range tabs 1W 1M 3M 1Y All under it. Right rail (320px, sticky): "Holdings" heading and one row per stock: logo, symbol, shares, sparkline, price and day change. Mobile: single column, rail falls below the chart, bottom tab bar.

**FORM:** The canon, pinned by the user ("the Robinhood look"); standing exit, no roll. Quality bar: Robinhood web and app, Yahoo Finance for data density on Analytics. Signature move: the day's trend colours the surface (chart line, change line, range tab, rail accents turn green or orange-red with the portfolio's move), and scrubbing the chart rewrites the big number to that day's value. Seed key: none (pinned direction).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Portfolio history before wallet snapshots exist uses current cash balances; label stays honest ("Portfolio value").
