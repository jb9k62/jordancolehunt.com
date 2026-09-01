# DESIGN_SPEC.md — Jordan Cole Hunt — Visual Design Spec

> **Status:** Definitive / implementation-ready.
> **Source:** (a) Authoritative CSS tokens extracted from the earendil.com reference (`static/styles.css`), (b) OCR-verified reads of the reference screenshots (`/home/jordan/jch-ref-design/home-light.png`, `posts-light.png`, `home-mobile.png`, `harness-post.png`).
> **Reference site:** <https://earendil.com/posts/what-is-a-harness/>
> This spec re-architects jordancolehunt.com to match the reference's light grey-white theme with a theme switcher, dropping the current dotted background in favour of plain, clean surfaces.

---

## 1. Authoritative Design Tokens (from reference CSS)

### 1.1 Fonts
- **`--mono-font`: `'Departure Mono', ui-monospace, monospace`.**
  - **Already self-hosted** at `public/fonts/departure-mono-regular.woff2` — reuse this asset, do not re-download.
  - Used for **all UI chrome**: menu, footer, nav, labels, meta, buttons, theme toggle.
  - Rendered **UPPERCASE**, letter-spacing `0`.
- **Serif (body reading / hero / posts):** reference uses `'Plantin'` (commercial). Use a free close alternative:
  - **Recommended: `Source Serif 4`** (or `Lora`) via Google Fonts. Self-hosting optional but preferred for a static/no-runtime build.

### 1.2 Type Scale (component tokens)
```
--font-size-xs: 0.8125rem;  sm: 0.9375rem;  md: 1.0625rem;
--font-size-lg: 1.25rem;    xl: 1.375rem;   2xl: 1.625rem; 3xl: 2.25rem

--text-ui:        0.9375rem
--text-meta:      0.9375rem
--text-body:      0.9375rem
--text-reading:   clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)
--text-title:     1.25rem
--text-hero:      clamp(1.25rem, 0.875rem + 1.5vw, 2.5rem)

--leading-ui:    1.25
--leading-body:  1.6
--leading-tight: 1.15
```
- **Menus are UPPERCASE, letter-spacing `0`** (no tracking).

### 1.3 Colour — Light Theme (default, grey-white)
```
--color-text-day:  #353431          /* main text */
page veil / bg:    #faf9f6          /* rgba(250,249,246) */
muted text:        rgba(25,24,22,0.6)   /* dates / meta */
```
- Menu/UI text brightens to near-white on the **home** canvas, but on **content pages** nav & footer text = `#353431` (day text colour).
- **We implement the content-page style: dark text on light page.**

### 1.4 Colour — Dark Theme (`theme-night`)
```
page veil / bg:    #2e2d2b          /* rgba(46,45,43) */
body background:   #1a1a1a
text:              #fff
muted:             rgba(240,240,240,0.6)
```

### 1.5 Layout / Chrome
- Frame gutters: `--frame-inline: 75px; --frame-block: 75px` (desktop); **~20–28px** on mobile.
- **Top-right corner menu** (UPPERCASE mono), subtle, borderless.
- **Footer fixed to bottom** with small mono labels.
- **Theme toggle present** (switches light ↔ dark).
- Pages are **plain** (no dot background).
- Content max-width **`min(100%, 760px)`** centered (`content-surface`).
- Theme transition **~900ms**, subtle. Respect `prefers-reduced-motion`.

---

## 2. Consolidated Visual Spec

### 2.1 Overall Layout & Aesthetic
- Minimalist, clean layout with generous negative space. **No borders or heavy dividers.**
- Content surface is plain (no dot pattern), full-height page, fixed footer.
- Hero features a centred, large **italic serif** quote, overlaid on a subtle grainy, starry-sky texture (home canvas only).
- High contrast between text and background for readability in both themes.
- Theme transition is subtle (~900ms), respecting `prefers-reduced-motion`.

### 2.2 Navigation (Menu)
- **Position:** top-right corner of the viewport.
- **Styling:** Uppercase, monolabel `MENU`, very small, no underline or border. Subtle, non-intrusive.
- **Font:** `Departure Mono`, size **`--text-ui`/`--font-size-sm` (0.9375rem)** on mobile screenshots; `--font-size-xs` (0.8125rem) reads on desktop. Use `--font-size-sm` for desktop MENU is acceptable; keep consistent with existing `--mono-font` glyphs.
- **Weight:** 400 (regular). **Letter-spacing:** `0`.
- **Colour:** near-white `#fff` on dark theme / dark home canvas; `#353431` on light content pages.
- **Spacing:** minimal inline padding around the label, no visible border.

### 2.3 Footer
- **Position:** fixed at bottom of viewport.
- **Layout:** full-width bar, split — **left** "EARENDIL INC." → replaced with **"JORDAN COLE HUNT"**, **right** "EN AUTO" → language selectors placeholder (can be omitted or a small mono label).
- **Styling:** uppercase mono, very small, no border or background.
- **Font:** `Departure Mono`, size `--font-size-xs`/`--text-ui` (0.8125–0.9375rem), weight 400, letter-spacing 0.
- **Colour:** near-white `#fff` on dark; `#353431` on light. Small vertical padding; horizontal padding ~20–28px mobile, 75px desktop.

### 2.4 Content / Reading Text
- **Max width:** `min(100%, 760px)` centered (content-surface).
- **Gutters:** 75px inline/block on desktop; ~20–28px on mobile.
- **Vertical rhythm:** consistent spacing between list items; **~1.5rem** vertical gap between post entries.
- **Font:** **serif** (`Source Serif 4` / `Lora`), **regular weight (400)**.
- **Size:** `--text-reading` = `clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)`. On a 390px viewport this resolves to ≈ **1.125rem (18px)**.
- **Line-height:** `--leading-body` (1.6).
- **Colour:** `#353431` main; `rgba(25,24,22,0.6)` muted (dark theme: `#fff` / `rgba(240,240,240,0.6)`).

### 2.5 Post Titles (blog list & post)
- **Font:** serif, **italic**, regular weight.
- **Size:** `--text-title` (1.25rem) or slightly larger (`--text-lg`) for emphasis.
- **Colour:** `#353431` (light) / `#fff` (dark).
- **Hover:** subtle **underline or colour shift** on titles. No background change on list items — rely on text underline/colour for interactivity.

### 2.6 Dates & Meta
- **Font:** `Departure Mono`, **uppercase**.
- **Size:** `--text-meta` / `--text-ui` (0.9375rem).
- **Colour:** `rgba(25,24,22,0.6)` (light) / `rgba(240,240,240,0.6)` (dark).
- **Letter-spacing:** `0`.

### 2.7 Hero (home)
- **Font:** serif, **italicized**, weight normal.
- **Size:** `--text-hero` = `clamp(1.25rem, 0.875rem + 1.5vw, 2.5rem)`.
- **Line-height:** `--leading-tight` (1.15).
- **Background:** deep textured charcoal `#1a1a1a` with grainy starry-sky texture; near-white text `#fff`.
- Large vertical space around hero text for a dramatic, open feel.

### 2.8 Theme Toggle
- Present globally; switches light ↔ dark.
- Transition **~900ms**, subtle. Respect `prefers-reduced-motion`.

### 2.9 Responsive Behaviour
- Mobile (~390×844): gutters reduced to **~20–28px**; content constrained by viewport width, still centered & stacked, no sidebars.
- Menu + footer: uppercase mono, `--text-ui` (0.9375rem), weight 400, letter-spacing 0.
- Font sizes scale with viewport width (via `clamp()`).
- Background `#faf9f6` (light) / `#2e2d2b` (dark).

---

## 3. Token Map (CSS custom properties to implement)

```css
:root {
  /* fonts */
  --mono-font: 'Departure Mono', ui-monospace, monospace;
  --serif-font: 'Source Serif 4', serif;

  /* type scale */
  --font-size-xs: 0.8125rem; --font-size-sm: 0.9375rem; --font-size-md: 1.0625rem;
  --font-size-lg: 1.25rem;   --font-size-xl: 1.375rem;  --font-size-2xl: 1.625rem;
  --font-size-3xl: 2.25rem;
  --text-ui: 0.9375rem; --text-meta: 0.9375rem; --text-body: 0.9375rem;
  --text-reading: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);
  --text-title: 1.25rem;
  --text-hero: clamp(1.25rem, 0.875rem + 1.5vw, 2.5rem);
  --leading-ui: 1.25; --leading-body: 1.6; --leading-tight: 1.15;

  /* light theme (default) */
  --color-text: #353431;
  --color-bg: #faf9f6;
  --color-muted: rgba(25,24,22,0.6);
  --frame-inline: 75px; --frame-block: 75px;
  --content-width: min(100%, 760px);
  --theme-transition: 900ms;
}
.theme-night {
  --color-text: #fff;
  --color-bg: #2e2d2b;
  --color-muted: rgba(240,240,240,0.6);
}
@media (max-width: 640px) {
  :root { --frame-inline: 24px; --frame-block: 20px; }
}
```

---

## 4. Implementation Notes
- Reuse the already-self-hosted `Departure Mono` woff2 at `public/fonts/departure-mono-regular.woff2` — **do not** re-fetch it.
- Add `Source Serif 4` (or `Lora`) as the serif (self-host or Google Fonts).
- Keep fonts **400 weight**, uppercase for all UI labels, letter-spacing `0`.
- Implement the **content-page light style** (dark `#353431` text on `#faf9f6`) as default; home canvas may use the dark starry-sky hero treatment.
- Drop all dotted backgrounds — plain surfaces only.
- Honour `prefers-reduced-motion` for the ~900ms theme transition.
