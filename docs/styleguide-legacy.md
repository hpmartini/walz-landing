# Legacy Styleguide — kanzlei-karstenwalz.de

Extracted on 2026-06-07 from the live WordPress/Divi site. This document is the
**source of truth** for the brand identity the new Astro landing page must
inherit.

Source artefacts (cached during extraction):
- HTML: `https://www.kanzlei-karstenwalz.de/`
- CSS: `https://www.kanzlei-karstenwalz.de/wp-content/et-cache/36/et-core-unified-deferred-36.min.css`
- Inline `<style>` blocks (9 blocks, ~132 KB) embedded in the HTML head

---

## Colors

| Token            | Hex        | Usage on legacy site                                       |
|------------------|------------|------------------------------------------------------------|
| `--brand`        | `#815f5d`  | Headings, links, active nav, footer headings, top header bg, accent borders |
| `--bg`           | `#ffffff`  | Body background, main header (over `rgba(255,255,255,0.8)` translucent on scroll) |
| `--bg-alt`       | `#f9f9f9`  | Footer background                                          |
| `--text`         | `#666666`  | Body copy, footer text                                     |
| `--text-strong`  | `#3e3e3e`  | High-emphasis body text                                    |
| `--border`       | `#cccccc`  | Fixed-header bottom border                                 |
| `--muted`        | `#9f9f9f`  | Disabled / very low emphasis                               |

No second accent color exists on the legacy site. `#815f5d` carries all
brand work alone.

## Typography

- **Font family:** `'Open Sans', Helvetica, Arial, sans-serif`
  (legacy uses self-hosted `OpenSans_eigenerServer`; we'll load via Google Fonts).
- **Body size:** 16 px, line-height ~1.7.
- **Heading sizes (legacy default):** h1 30 px / h2 26 / h3 22 / h4 18.
  On the new modern layout we keep our larger fluid heading sizes — but apply
  the legacy *style* rules below.
- **Heading style (iconic legacy detail):**
  - `text-transform: uppercase`
  - `font-weight: 400` (normal, NOT bold)
  - `color: #815f5d`
  - `font-style: normal`, `text-decoration: none`
- **Links:** color `#815f5d`. Underline animation may be kept from current site.

## Layout

- **Container:** legacy `max-width: 1280px`. New site currently uses `1200px`;
  we may keep `1200px` (no visible difference on landing).
- **Section padding:** legacy `64px 0` on desktop. We keep current generous
  vertical spacing (`py-20 md:py-28`).
- **Header:** translucent white on scroll-top, solid white when fixed,
  bottom border `1px solid #cccccc`.

## Buttons & CTAs

The legacy site has effectively no CTA buttons. The new site keeps modern
CTAs but recolors them:

- Primary CTA: mauve (`#815f5d`) background, white text, white-soft hover.
- Secondary CTA: outlined mauve border on white.

## Footer

- Background `#f9f9f9`.
- Heading color `#815f5d`.
- Link / text color `#666666`.

## Tone & feel

Traditional, formal, regional Steuerberater. Restrained color palette,
uppercase headings signal seriousness and continuity. The legacy site is
quiet — no big imagery, no animations. The new site keeps modern UX patterns
but adopts the legacy *palette and type* to preserve brand recognition.

## What we deliberately **don't** port

- All-white minimal layouts (no hero imagery).
- 30 px h1 sizes (too small for modern landing pages).
- Self-hosted Open Sans (we use Google Fonts).
- Divi-specific class soup.
