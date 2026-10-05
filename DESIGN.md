---
name: Tsoro Journal
description: A precise trade-journal and portfolio tracker for ZSE/VFEX retail investors — clarity at a glance, Robinhood × Yahoo Finance craft.
colors:
  brand: "#00C853"
  brand-dim: "#00A843"
  bg: "#0A0E1A"
  surface: "#111827"
  surface2: "#1A2438"
  surface3: "#1E2A42"
  border: "#243050"
  text: "#F0F4FC"
  muted: "#5F7490"
  muted2: "#8FA8C4"
  green: "#00C853"
  red: "#EF4444"
  yellow: "#F59E0B"
  blue: "#38BDF8"
  purple: "#A855F7"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.8px"
    fontFeature: "tnum"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.2px"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.5px"
rounded:
  sm: "6px"
  md: "8px"
  nav: "11px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    rounded: "{rounded.nav}"
    padding: "9px 18px"
  button-primary-hover:
    backgroundColor: "{colors.brand-dim}"
    textColor: "#ffffff"
    rounded: "{rounded.nav}"
    padding: "9px 18px"
  button-ghost:
    backgroundColor: "{colors.surface2}"
    textColor: "{colors.muted2}"
    rounded: "{rounded.nav}"
    padding: "9px 18px"
  button-ghost-hover:
    backgroundColor: "{colors.surface3}"
    textColor: "{colors.text}"
    rounded: "{rounded.nav}"
    padding: "9px 18px"
  button-danger:
    backgroundColor: "rgba(239,68,68,.12)"
    textColor: "{colors.red}"
    rounded: "{rounded.nav}"
    padding: "9px 18px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "22px"
  stat-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "18px 20px"
  badge:
    backgroundColor: "rgba(34,197,94,.12)"
    textColor: "{colors.green}"
    rounded: "4px"
    padding: "3px 8px"
---

# Design System: Tsoro Journal

## Overview

**Creative North Star: "The Clarity Window"**

Tsoro Journal is a financial-data surface built around a single discipline: let the investor know their position instantly. The system refuses the common dashboard reflex of stacking metric tiles and colored card borders to signal importance; instead it uses a deep navy shell, a single green accent, and tight typographic hierarchy to make the numbers do the talking. Every design decision exists in service of quick comprehension under the pressure of real capital decisions.

The visual quality bar is Robinhood × Yahoo Finance — not as irony but as craft commitment. That means consistent padding, tonal layering without decorative gradients, Inter at tabular-numeral weight for every monetary figure, and a dual-mode system (dark default, light toggle) that preserves legibility in both contexts. The dark shell (`#0A0E1A`) is deep enough to function as a zero-point for the luminance ramp; the light shell (`#F8F9FC`) is a near-white that avoids clinical harshness. In both modes, accent green (`#00C853` dark / `#00A843` light) is the one non-neutral color that carries weight.

Canvas 2D charts inherit palette through CSS custom properties, keeping the chart layer in sync with the theme toggle without a redraw pipeline. The layout is a fixed 240 px sidebar on desktop, collapsing to a bottom tab bar on mobile at 768 px.

**Key Characteristics:**
- Single brand accent; all other non-neutral color is semantic (green = gain, red = loss, yellow = open, blue = day trade, purple = long-term)
- `font-variant-numeric: tabular-nums` on every monetary figure and table cell — figures never shift column width
- Tonal surface layering (bg → surface → surface2 → surface3) replaces box-shadow depth
- Thin 1 px borders at low-opacity for separation without visual weight
- Subdued 1 px ambient shadow only; structural depth comes from tonal steps, not elevation

## Colors

A near-monochromatic navy shell with a single green accent; all other hues are reserved for semantic data states.

### Primary
- **Signal Green** (`#00C853` dark / `#00A843` light): Brand accent and positive data signal. Used on the primary button, active nav item, positive P&L values, the brand logo gradient endpoint, and any gain percentage. Its rarity is its power — the eye reads "green" as "this is what matters."

### Neutral
- **Deep Navy Shell** (`#0A0E1A`): Page background in dark mode. The darkest surface; appears only as the canvas behind raised surfaces.
- **Midnight Surface** (`#111827`): Primary card and sidebar background. One luminance step above the shell.
- **Charcoal Surface** (`#1A2438`): Secondary surface — inputs, table headers, toggle backgrounds, analysis sections.
- **Lifted Surface** (`#1E2A42`): Tertiary surface — hover states on secondary surfaces, active toggle segments.
- **Navy Border** (`#243050`): 1 px borders on cards, inputs, nav, and dividers. Keeps separation visible without harsh contrast.
- **Cloud Text** (`#F0F4FC`): Primary text in dark mode. Not pure white; slightly cooled to reduce glare.
- **Slate Muted** (`#5F7490`): Metadata labels, secondary descriptors, empty states.
- **Steel Muted** (`#8FA8C4`): Nav items at rest, supporting prose, form hints.

### Semantic
- **Loss Red** (`#EF4444` dark / `#DC2626` light): Negative P&L, error states, danger action button tint.
- **Open Yellow** (`#F59E0B` dark / `#D97706` light): Open-position badge, pending states.
- **Day-Trade Blue** (`#38BDF8` dark / `#0369A1` light): Day-trade badge, informational accent.
- **Long-Term Purple** (`#A855F7` dark / `#7C3AED` light): Long-term trade badge.

### Named Rules
**The One Voice Rule.** Signal Green appears on ≤10% of any given screen. It is the only non-semantic accent color. Introducing a second accent color violates the data hierarchy.

**The Semantic Lock Rule.** Red, yellow, blue, and purple are permanently bound to their data roles (loss, open, day, long-term). They must not appear as decorative or UI-identity colors.

## Typography

**Body / Display Font:** Inter (Google Fonts, weights 300–700), `system-ui, sans-serif` fallback.
**Label / Mono Font:** Inter with `font-variant-numeric: tabular-nums` applied wherever numerals appear in financial context.

**Character:** A single-family system with weight-and-size hierarchy rather than a serif/sans pairing. The financial context demands legibility and optical stability under data-dense scanning, not editorial expressiveness. Inter's tabular numerals are a first-class system feature.

### Hierarchy
- **Display** (weight 900, 28 px, line-height 1, letter-spacing −0.8 px): Wallet balance and the largest monetary headline. Tabular numerals required. Appears only once per screen section.
- **Headline** (weight 500, 22 px, line-height 1, letter-spacing −0.02em): Stat card values — portfolio total, day change, position size. Tabular numerals required.
- **Title** (weight 700, 17 px, line-height 1.3, letter-spacing −0.2 px): Topbar page title, modal heading.
- **Body** (weight 400–600, 14 px, line-height 1.5): All prose, trade notes, tooltips, nav labels.
- **Label** (weight 600, 11 px, letter-spacing 0.5 px, uppercase): Stat card labels, table column headers, form field labels, badge text. Always uppercase in data contexts.

### Named Rules
**The Tabular Mandate.** `font-variant-numeric: tabular-nums` is applied globally to `.stat-value`, `td`, `.perf-val`, and `.wallet-sum-val`. Every monetary value, percentage, and share count must use this feature. Column jitter as prices update is a legibility failure.

**The Weight Restraint Rule.** Weight 900 (black) is reserved for the single largest number on a screen — wallet balance and rate display. Using it on secondary figures collapses the hierarchy.

## Layout

The app uses a two-column shell on desktop: a fixed 240 px sidebar on the left carrying page navigation, and a fluid main column filling the remainder. The topbar is a 56 px fixed strip at the top of the main column; it holds the centered page title, the theme toggle, and the user avatar. Content area padding is 28 px on all sides (desktop), collapsing to 16 px on mobile with 72 px bottom padding to clear the mobile nav bar.

The dashboard leads with a stat card grid using `grid-template-columns: repeat(auto-fill, minmax(175px, 1fr))` at 12 px gap. Analytics and securities use `minmax(280px, 1fr)` and `minmax(320px, 1fr)` respectively, scaling gracefully from two to four columns. Two-column sub-layouts within cards use `grid-template-columns: 1fr 1fr` with 16 px gap.

At 768 px and below, the sidebar is hidden and replaced by a bottom tab bar (56 px, `position: fixed`). The topbar collapses to wordmark + avatar only, removing the centered title to reclaim horizontal space. Market pages use `position: fixed` to escape the DOM stacking context and fill the viewport above the mobile nav.

Page transitions use a subtle `fadeSlideIn` animation: `opacity 0→1` and `translateY(14px→0)` over 0.22 s with `cubic-bezier(.22,1,.36,1)`. The spring-like curve gives the transition momentum without feeling playful.

## Elevation & Depth

This system uses tonal layering as its primary depth signal; physical shadows are ambient-only and intentionally quiet.

Four surface tones create a depth ladder: `--bg` (darkest) → `--surface` → `--surface2` → `--surface3` (lightest raised state). Hover states move a component one step up the ladder. This means cards, modals, and sidebars feel elevated by color, not shadow weight.

The single shadow token (`--shadow: 0 1px 4px rgba(0,0,0,.24)` dark / `0 1px 4px rgba(0,0,0,.08)` light) is applied to stat cards and wallet cards as an ambient baseline. Modals use a deep lift shadow (`0 24px 80px rgba(0,0,0,.6)`) that separates the dialog from the page plane decisively. No components use intermediate shadow steps.

### Shadow Vocabulary
- **Ambient** (`0 1px 4px rgba(0,0,0,.24)` dark / `0 1px 4px rgba(0,0,0,.08)` light): Cards and stat cards at rest. Barely perceptible; the tonal background difference does more work.
- **Modal Lift** (`0 24px 80px rgba(0,0,0,.6)`): Modal dialogs and the auth box. Anchors the dialog to the z-plane above the blurred overlay.

### Named Rules
**The Tonal-First Rule.** Surfaces communicate depth by their background color, not their shadow. Before reaching for a heavier shadow, verify that the surface is using the correct tone step. Shadows amplify; they do not substitute.

## Shapes

The system uses two radius values: `--r: 8px` (cards, modals, stat cards, auth box, brand logo icon) and `--r-sm: 6px` (inputs, form selects, buttons, badges at a tighter 4 px, checklist items). Buttons and nav items use 11 px for a slightly pill-like quality that distinguishes interactive controls from container surfaces.

The single decorative geometry is the brand gradient — a 160° linear sweep from `#00A843` to `#00C853` — applied to the brand logo icon, user avatar, and the hero checklist progress bar. This gradient is strictly ornamental; it does not appear on data surfaces or as a chart fill.

Borders are 1 px and use the `--border` token throughout. No surface uses a 2 px or heavier stroke except the checklist checkbox (2 px border for tactile affordance). No colored left-border accent on cards — the OWN-WORLD contract explicitly forbids it.

Scrollbars are styled to 6 px with a transparent track and `--border` thumb, keeping them unobtrusive in the dark shell.

## Components

### Buttons
- **Shape:** Rounded (11 px radius); slightly more pill-like than card corners to signal interactivity
- **Primary:** Signal Green background (`var(--accent)`), white text, `padding: 9px 18px`, `font-size: 13px`, `font-weight: 600`
- **Hover:** Background shifts to `var(--accent2)` (dimmed green) over 0.15 s
- **Ghost:** Surface2 background, muted2 text, 1 px border at `--border`; hover shifts to surface3 and full `--text`
- **Danger:** 12% red tint background (`rgba(239,68,68,.12)`), loss-red text, 20%-opacity red border; hover fills to full red with white text
- **Logout/Tertiary:** Transparent background, muted text, 1 px `--border`; hover shifts text to loss-red and border to red
- **Small variant:** `padding: 6px 12px; font-size: 12px` — same radius

### Badges
- **Style:** 4 px radius, `padding: 3px 8px`, `font-size: 11px`, `font-weight: 600`, always a semantic color pairing (10-12% tint background + full-saturation text)
- **Variants:** Long (green tint), Short (red tint), Open (yellow tint), Closed (slate tint), Day (blue tint), Long-Term (purple tint), Market (surface3 / muted2 — neutral, non-semantic)
- No badge uses a solid fill; all use the tint-plus-saturated-text pattern

### Cards / Containers
- **Corner Style:** Gently rounded (8 px)
- **Background:** `--surface` (Midnight Surface)
- **Shadow Strategy:** Ambient shadow at rest; surface2 background on hover (tonal lift)
- **Border:** 1 px `--border`
- **Internal Padding:** 22 px (standard card); 18–20 px (stat card, wallet card, rate card)

### Inputs / Fields
- **Style:** Surface2 background, 1 px `--border`, 6 px radius, `padding: 9px 12px`, `font-size: 13px`
- **Focus:** Border shifts to `var(--accent)` over 0.15 s; no glow, no box-shadow; the color change alone marks focus
- **Error:** No dedicated error style in the current build beyond the checklist item pattern (red tint background + red border)
- **Disabled:** Opacity 0.5 (auth button pattern)

### Navigation
- **Sidebar (desktop):** 240 px fixed, `--surface` background, 1 px right border. Items are full-width buttons with 11 px radius, `padding: 10px 14px`, `font-size: 13.5px`. Default color `--muted2`; hover surface2 + full text; active surface3 + accent green + weight 600. Section headers are 11 px uppercase labels at `--muted`.
- **Mobile bottom bar:** 56 px fixed strip, 5 primary destinations, icon + 10 px label. Default `--muted`; active `--accent`. Background `--surface`, 1 px top border.

### Stat Card
- Signature component. Grid of KPI tiles — each carries an uppercase label (10.5 px, `letter-spacing: .9px`) and a large tabular value (22 px, weight 500). Background `--surface`, 8 px radius, ambient shadow. Hover shifts to surface2. Color variants (`.green`, `.red`, `.blue`) apply the semantic color to the value only — the card background never changes color.

### Overlay / Modal
- Backdrop: `rgba(0,0,0,.7)` with `backdrop-filter: blur(4px)`. The blur reinforces the modal as a separate z-plane.
- Modal shell: `--surface` background, 8 px radius, 1 px `--border`, modal-lift shadow. Maximum width 640 px, maximum height 92 vh with internal scroll. Interior padding 28 px.

## Do's and Don'ts

### Do:
- **Do** apply `font-variant-numeric: tabular-nums` to every element that displays monetary values, share counts, or percentages.
- **Do** use tonal surface steps (surface → surface2 → surface3) to indicate hover and active states before reaching for a heavier shadow.
- **Do** reserve Signal Green (`#00C853` / `#00A843`) for the primary button, positive P&L, active navigation, and brand elements only. Keep its surface coverage below 10% per view.
- **Do** use semantic colors (red, yellow, blue, purple) exclusively for their assigned data roles. A loss is red; an open position is yellow; day trades are blue.
- **Do** use the 11 px radius on interactive controls (buttons, nav items) and the 8 px radius on container surfaces (cards, modals) to preserve a clear affordance signal.
- **Do** show theme transitions at 0.2 s on background and color properties on all key surfaces to prevent flash on toggle.

### Don't:
- **Don't** add colored left-border accents to cards. The OWN-WORLD contract prohibits them; they create a banded hierarchy that competes with the data.
- **Don't** use gradient text. Text rendering of gradients is inconsistent across platforms and reduces legibility on financial figures.
- **Don't** place kicker or eyebrow text above section headings. This is a financial data surface, not editorial content. Kickers above headings are not canonized into this system.
- **Don't** use a second accent color for UI identity. Any new hue introduced must earn a semantic data role (loss, open, type) or it does not belong.
- **Don't** render monetary values without `tabular-nums` — column-width shift as data refreshes is a legibility failure at the craft level this system targets.
- **Don't** apply the brand gradient (`--hero-grad`) to data surfaces, chart fills, or badge backgrounds. It belongs on brand identity elements (logo, avatar) only.
