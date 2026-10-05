# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: individual retail investors on Zimbabwe's ZSE and VFEX exchanges, starting with the owner, scaling to other self-directed traders who want a private journal for their stock positions and trade history. Users operate on both desktop and mobile with equal frequency — the app must hold up at every screen size.

## Product Purpose

Tsoro Journal is a personal investment and trading journal for ZSE and VFEX equity holders. It lets users log and review closed trades, track live ZSE/VFEX stock positions across multiple lots, monitor their wallet and portfolio value in USD, set investment goals, track loans, and analyse trading performance over time. Success means a user can walk into any session knowing exactly where their money is, how each position is performing, and whether their trading habits are improving.

## Positioning

The only trading journal built natively for ZSE and VFEX, handling ZiG-denominated positions, per-lot buy tracking, multi-lot grouping, and a live ZiG/USD conversion — workflows no generic journal or spreadsheet handles without manual gymnastics.

## Operating Context

- Users check it at the start of a trading session, after placing a trade, and at end of day to review performance.
- Core workflows: logging a new trade, updating a stock price, reviewing unrealised P&L, checking wallet balance, browsing analytics.
- Hosted on Vercel as a single static HTML file with a Supabase (Postgres + auth) backend.
- ZSE/VFEX positions stored in localStorage keyed by user ID; trade history in Supabase.
- No build tooling — single `index.html` with inline CSS and vanilla JS.

## Capabilities and Constraints

- Pages: Dashboard, Trade Journal, Analytics, Securities Analysis, Portfolio & Wallet, ZSE/VFEX Tracker, Investment Goals, Loans & Debts, Exchange Rates, ZSE Market, VFEX Market.
- Markets supported: Crypto, Stocks, Futures, Commodities, Indices, Options, ETF, Bonds (Forex removed).
- Single HTML file — all CSS and JS must remain inline; no external framework.
- Dark/light theme toggle already exists and must be preserved.
- Canvas 2D API used for all charts (no charting library).
- Multi-user accounts via Supabase auth (will expand beyond single user).

## Brand Commitments

Name: Tsoro Journal. "Tsoro" is a Zimbabwean strategy board game — implies methodical thinking, long-term planning, and local roots. The name should anchor the identity.

## Evidence on Hand

- Full working codebase at `index.html` (~7 400 lines).
- App icon assets in `app icons and logo/`.
- No external brand guidelines, no design system file.

## Product Principles

1. **Clarity before decoration** — every number and label earns its place; nothing decorates at the expense of legibility.
2. **Local context first** — ZiG, ZSE, VFEX, and Zimbabwean investment reality are first-class, never an afterthought.
3. **Scales from one to many** — the interface must feel personal for a single user and professional when shared with others.
4. **Trustworthy by design** — financial data demands visual calm and precision; warmth comes through typography and spacing, not gimmicks.
5. **Continuous improvement visible** — the analytics and pattern-detection features exist to help users trade better; the UI should make that progress legible and motivating.

## Accessibility & Inclusion

WCAG AA contrast minimum. Both themes (dark and light) must pass. Touch targets ≥ 44 px on mobile.
