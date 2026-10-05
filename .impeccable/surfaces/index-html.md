---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

## Scope and visitor mode

Operate. Primary surface: the full single-page app at index.html. The visitor's job is to know where their money is, log trades, and read performance analytics. Navigation spans Dashboard, Trade Journal, Analytics, Portfolio & Wallet, ZSE/VFEX Tracker, Investment Goals, Loans & Debts, Exchange Rates, ZSE Market, VFEX Market, Securities Analysis.

## Audience, job, action, proof, constraints

ZSE/VFEX retail investors in Zimbabwe. Job: check portfolio state quickly, log a trade, review analytics. Primary action: read current P&L; secondary: add a trade. Proof: real price data from Supabase, real positions from localStorage. Constraints: single HTML file, all CSS/JS inline, Canvas 2D charts, no external framework, dark/light theme toggle must survive.

## Direction contract

**THESIS:** Tsoro Journal owns the ZSE/VFEX investor's clarity window — a clean, precise data surface that lets them know their position at a glance — refusing the card-over-card metric-tile scaffold that makes most dashboards feel like UI rather than information. The canon chosen and committed: executed at Robinhood × Yahoo Finance craft level, without irony.

**OWN-WORLD:** Deep navy `#0A0E1A` (dark shell) / `#F8F9FC` (light shell). Single brand accent `#00C853` (green, gain, primary action). Loss red `#FF3B30`. Text: Inter (400, 500, 600) with `font-variant-numeric: tabular-nums` on all monetary values. Border-radius 6px components, 4px inputs. Borders at 1px `rgba(255,255,255,0.08)` (dark) / `rgba(0,0,0,0.08)` (light). Shadows: `0 1px 3px rgba(0,0,0,0.12)`. No gradient text. No colored left-borders on cards. No kickers above headings. Canvas charts inherit palette through CSS custom properties.

**STORY:** Investor opens; sees total portfolio USD and today's change. Taps a stock to see its lots. Opens Journal to log today's trade. Checks Analytics to see if their win rate is trending up. Checks ZSE Tracker for a price. Leaves with complete situational awareness.

**FIRST VIEWPORT:** Full-width top nav bar: Tsoro Journal wordmark (left), page title (center), [theme toggle + user avatar] (right). Immediately below: a summary strip — total portfolio value at ~2.5rem tabular, day change at ~1.25rem green/red with up/down arrow, and 2–3 secondary stats in a horizontal row. Then the page's primary content area. On Desktop ≥1024px: sidebar (240px fixed left) for page navigation, main content area fills remaining space. On mobile: bottom tab bar for primary navigation, top area collapses to wordmark + avatar.

**FORM:** Canon — classic financial standard. Standing exit taken by user. Quality bar: Robinhood + Yahoo Finance. Seed key 02128272, operate mode.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
