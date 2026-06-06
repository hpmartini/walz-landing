# PRD — Port legacy styleguide onto new landing page

Status: Draft → Architecture Review
Date: 2026-06-07
Owner: hpm@martini-labs.de
Source styleguide: [`docs/styleguide-legacy.md`](../styleguide-legacy.md)

## Problem

The new Astro landing page (`walz-landing`) ships a modern but **brand-foreign**
visual identity: deep navy (`#1B3A5F`) + warm gold (`#C4A35A`), Inter font,
mixed-case bold headings. The legacy site at `kanzlei-karstenwalz.de` —
which is what every existing client of Kanzlei Karsten Walz has known for
years — uses a muted mauve `#815f5d`, Open Sans, uppercase headings.

Returning clients should immediately recognize the new site as the same
brand. Today, they don't.

## Goals

1. Replace the new site's color palette and typography with the legacy
   palette and typography, captured in `docs/styleguide-legacy.md`.
2. Preserve all modern UX upgrades (hero photography, CTAs, animations,
   responsive layout, German hyphenation, scroll reveals, smooth scroll).
3. Centralize the styleguide in **one** Tailwind 4 `@theme` block so that
   future palette tweaks are a single-file change (DRY).
4. No component-level color hardcoding. Every component reads from theme tokens.

## Non-goals

- Re-arranging layout, sections, or content.
- Adding or removing pages.
- Touching the chat widget logic, contact form logic, or `/api/chat` endpoint.
- Building any new feature.
- Setting up a test framework (separate `tech-debt` issue if needed).

## User stories

- **As a returning client** of Kanzlei Karsten Walz, when I open the new
  site I instantly recognize the brand from the mauve palette and uppercase
  headings I've seen for years.
- **As a new visitor**, I see a modern, calm, trustworthy professional
  services site that feels Steuerberater-formal but is easy to read on
  mobile and desktop.
- **As the maintainer**, when I want to tweak a brand color, I edit one
  CSS variable in `global.css` and every page updates.

## Functional requirements

| #  | Requirement                                                                                   |
|----|-----------------------------------------------------------------------------------------------|
| F1 | `src/styles/global.css` `@theme` block defines: `--color-primary: #815f5d` and a matching set of secondary/text/bg tokens taken from `docs/styleguide-legacy.md`. |
| F2 | `src/layouts/Layout.astro` loads Google Fonts **Open Sans** (weights 400, 600, 700) instead of Inter. `--font-sans` is updated to Open Sans. |
| F3 | A CSS rule in `global.css` applies `text-transform: uppercase`, `font-weight: 400`, and `color: var(--color-primary)` to `h1, h2, h3, h4, h5, h6`. Components do not override these. |
| F4 | Every component file under `src/components/**` uses theme tokens (`bg-primary`, `text-primary`, etc.) — no new hex literals. Existing hex literals that conflict with the legacy palette are migrated to tokens. |
| F5 | Buttons (primary + secondary) recolor automatically via tokens. Hover states keep current micro-interaction (`hover:brightness-105`, `hover:scale-105`). |
| F6 | Hero gradient overlays (`from-primary/95 via-primary/75 to-primary/30`) still read clearly over photos with mauve `#815f5d` — verified visually. If muddy, opacity is tuned. |
| F7 | Existing `.reveal`, `.a-underline`, `.hyphens-auto`, `prefers-reduced-motion` rules continue to work unchanged. |
| F8 | `astro build` succeeds with zero new warnings.                                                |

## Non-functional requirements

- **DRY:** styleguide values live in exactly one place (`@theme` block).
- **KISS:** the change is "swap tokens + add one heading rule + swap font
  link". No new abstraction layers, no design system package, no CSS-in-JS.
- **YAGNI:** no dark mode, no theme switcher, no design tokens JSON export.
- **Accessibility:** mauve `#815f5d` on white = contrast ratio ~5.2:1 (WCAG AA ok for normal text and large UI). Mauve on `#f9f9f9` ≈ 4.9:1 (still AA for normal). White on mauve background ≥ 5.2:1. No regressions vs current site.
- **Performance:** Google Fonts request swap; no net-new runtime dependencies.
- **Browser support:** unchanged (modern evergreen + Safari ≥17 fallback rule already present).

## Open questions

| #  | Question                                                                                  | Owner | Default |
|----|-------------------------------------------------------------------------------------------|-------|---------|
| Q1 | Keep `--color-secondary: #C4A35A` (gold) as a soft accent, or drop it entirely?           | hpm   | Keep at low-emphasis usage only; drop in Phase 5 if first visual review shows clash |
| Q2 | Hero overlay opacity may need tuning from `0.95/0.75/0.30` → tbd after first visual check. | impl  | Try unchanged first; tune in Phase 5 if muddy |
| Q3 | Logo recoloring — out of scope for this PR; tracked as follow-up if needed.               | hpm   | Out of scope |

## Acceptance criteria

- [x] `docs/styleguide-legacy.md` exists, committed, merged on `main` (done in PR #3).
- [ ] `src/styles/global.css` `@theme` block contains the legacy palette.
- [ ] Open Sans loaded, Inter no longer referenced.
- [ ] `h1`–`h6` are uppercase, normal weight, mauve.
- [ ] No `#1B3A5F`, `#2B6CB0`, `#FAFAF8`, `#F0EDE8` literals remain in `src/`.
- [ ] No new hex literals introduced outside `global.css`.
- [ ] `npm run build` exits 0.
- [ ] Manual browser check (home, leistungen, kanzlei, kontakt, team, datenschutz, impressum, karriere, leistungen/[slug]) — every page renders in the new palette, no broken layouts.
- [ ] Hero CTAs still visible against mauve background.
- [ ] Mobile menu still works.

## Architecture Verdict

**Status:** Approved with mandatory fixes (2026-06-07)
**Reviewer:** architect sub-agent (`feature-dev:code-architect`)

### Verdict
APPROVE with three bundled fixes that must ship in the same PR.

### Q1 resolution — secondary token
**Replace** `--color-secondary: #C4A35A` (gold) with `--color-secondary: #b09796` (muted mauve tint, ~25% lighter than primary). Rationale: `secondary` is used exclusively for low-emphasis structural elements (divider bars, card borders, icon tints, dropdown labels, hover underlines) — none requires gold's visual energy. The legacy styleguide explicitly states a single brand color carries everything; a vibrant gold against muted mauve would clash. A mauve tint keeps every existing use legible while the page reads as a single-palette mauve brand.

### Refined implementation kernel
1. Update `src/styles/global.css` `@theme` block to:
   - `--color-primary: #815f5d`
   - `--color-primary-light: #9e7e7c` *(needed for existing hover states across 9 CTAs)*
   - `--color-secondary: #b09796`
   - `--color-text: #666666`
   - `--color-text-light: #9f9f9f`
   - `--color-bg: #ffffff`
   - `--color-bg-alt: #f9f9f9`
   - `--font-sans: 'Open Sans', sans-serif`

2. Add h1–h6 rule scoped to `main`:
   ```css
   main h1, main h2, main h3, main h4, main h5, main h6 {
     text-transform: uppercase;
     font-weight: 400;
     color: var(--color-primary);
   }
   ```
   (Excludes footer h3s, which stay `text-white` via inheritance from `bg-primary text-white` footer.)

3. Change `a-underline::after` background from `var(--color-secondary)` to `var(--color-primary)` — mauve tint secondary at low opacity wouldn't be visible on white.

4. Delete three decorative `rgba(196,163,90,…)` radial-gradient `<div>`s — one in each of `Hero.astro:16`, `PageHero.astro:20`, `Contact.astro:6`. These embed gold hex inside arbitrary Tailwind classes and would otherwise survive the theme swap.

5. Refactor two `bg-secondary text-primary` buttons to keep mauve/white contrast:
   - `Hero.astro:41` (primary CTA) → `bg-white text-primary`
   - `ChatWidget.astro:97` (submit) → `bg-primary text-white`

6. Swap Google Fonts URL in `Layout.astro` from Inter to `Open+Sans:wght@400;600;700` with `display=swap`.

### Additional acceptance criterion
- [ ] No `rgba(196,163,90` literals remain in `src/`. *(Existing AC only checked for the navy hex strings.)*

### Findings (8 total, all addressed above)
1. **[blocker]** Three hardcoded `rgba(196,163,90,…)` radial gradients in `Hero.astro:16`, `PageHero.astro:20`, `Contact.astro:6` — bypass `@theme` entirely. → Delete the decorative divs.
2. **[major]** `hover:bg-primary-light` used on 9 CTAs across 6 files; PRD doesn't define mauve equivalent. → Add `--color-primary-light: #9e7e7c`.
3. **[major]** Global `h1–h6` rule conflicts with hero overlays — Tailwind utility specificity saves us in heroes, but footer h3s (no `text-white`) would render mauve-on-mauve. → Scope rule to `main`.
4. **[major]** Footer h3s in `Footer.astro:56,73,108` carry no text color class; rely on inherited white. → Solved by `main`-scoped h1–h6 rule.
5. **[minor]** `Hero.astro:41` CTA is `bg-secondary text-primary` → mauve/mauve post-swap. → `bg-white text-primary`.
6. **[minor]** `ChatWidget.astro:97` submit button same issue. → `bg-primary text-white`.
7. **[minor]** `a-underline::after` uses `var(--color-secondary)` → invisible at low opacity in mauve tint. → Use `var(--color-primary)`.
8. **[nit]** `kontakt.astro:89` has `style="border:0"` on iframe — unrelated, harmless.
