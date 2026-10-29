---
name: Kanzlei Karsten Walz
description: Persönliche Steuerberatung in Schwalmstadt — warm mauve, soft cards, the door is always open.
colors:
  deep-mauve: "#815f5d"
  dusty-mauve: "#9e7e7c"
  rose-ash: "#b09796"
  text: "#666666"
  text-light: "#9f9f9f"
  bg: "#ffffff"
  bg-alt: "#f9f9f9"
  hairline: "#f3f4f6"
typography:
  display:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  lead:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  container: "1200px"
  gutter: "24px"
  card: "32px"
  card-lg: "40px"
  grid-gap: "24px"
  section: "80px"
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.deep-mauve}"
    textColor: "{colors.bg}"
    rounded: "{rounded.lg}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.dusty-mauve}"
    textColor: "{colors.bg}"
  button-on-mauve:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.deep-mauve}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-outline-on-mauve:
    backgroundColor: "transparent"
    textColor: "{colors.bg}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  card-service:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  card-stat:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.deep-mauve}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.card-lg}"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
---

# Design System: Kanzlei Karsten Walz

## Overview

**Creative North Star: "Die offene Kanzleitür"**

The site should feel like walking into a small-town Kanzlei where people look up and say hello. One warm mauve carries the whole brand, inherited unchanged from the legacy site kanzlei-karstenwalz.de. White pages, soft cards with rounded corners and quiet shadows, real team photos under a mauve veil. Nothing is loud or showy, and nothing is cold. Phone number, address and a "Kontakt" button are always close.

Density is relaxed: generous section padding, short paragraphs, grids of four or three cards at most. Craft goes into an invisible layer instead of decoration: fast scroll reveals, a cursor spotlight on cards, buttons that drift slightly toward the cursor, page cross-fades that keep the header still. This layer is the only place the design may grow. The client approved the look on 2026-06-12 and rejected an editorial redesign (square corners, editorial display type, chapter numbers, eyebrow labels). That rejection is binding.

**Key Characteristics:**
- One brand hue in three tones (Deep Mauve, Dusty Mauve, Rose Ash) on white and off-white.
- Open Sans only; section headings in the legacy style (uppercase, normal weight, mauve).
- Rounded cards (12–16px) with soft shadows that lift on hover.
- Photo heroes under a left-to-right mauve gradient with thin drifting circles.
- A short Rose Ash bar under every heading.
- Motion is polish, never a loading state; reduced motion turns it off completely.

## Colors

One warm, slightly dusty mauve family on white. No second accent exists, and none should be added.

### Primary
- **Deep Mauve** (`deep-mauve`): The brand. Section and card headings, links, primary buttons, footer and contact-section backgrounds, hero overlay gradient (95% → 30% opacity), focus outlines.
- **Dusty Mauve** (`dusty-mauve`): Hover state of anything Deep Mauve: primary buttons, chat launcher, "Mehr erfahren" links. Never used at rest.

### Secondary
- **Rose Ash** (`rose-ash`): Supporting tone, almost always at reduced opacity. Heading bars (solid), icons (solid), icon tiles (10% fill, 20% border), card borders (15% → 40% on hover), input borders (25%), hero badge dot, decorative hero circles (25–40% border), spotlight glow (13%).

### Neutral
- **Text Grey** (`text`): All body copy and inactive nav links.
- **Light Grey** (`text-light`): Lowest emphasis, e.g. the header phone number at rest.
- **White** (`bg`): Page and card background; text on mauve.
- **Off-White** (`bg-alt`): Alternating section background (Leistungen), chat quick-reply bar, Direktkontakt panel.
- **Hairline** (`hairline`): Header bottom border and mobile-menu divider.

### Named Rules
**The One Hue Rule.** Every brand moment is Deep Mauve or a tint of Rose Ash. If a new element seems to need blue, green or gold, it doesn't.

**The White-On-Mauve Rule.** On a mauve surface, text and buttons are white or white at reduced opacity (70–90%). Mauve text never sits on mauve.

## Typography

**Display Font:** Open Sans (sans-serif fallback), weights 400/600/700, self-hosted variable woff2 (`public/fonts/`, latin + latin-ext).
**Body Font:** Open Sans.

**Character:** One friendly, plain humanist sans. Hierarchy comes from case, weight and colour, not from a second typeface.

### Hierarchy
- **Display** (700, 2.25 → 3 → 3.75rem, line-height 1.25): Hero and page-hero h1 only, white and bold on the mauve photo overlay, uppercase via the legacy rule. Hero lines rise in on load.
- **Headline** (400, 1.875 → 2.25rem, uppercase, Deep Mauve): Section h2s inside `main`, in the legacy style. Always followed by a Rose Ash bar.
- **Title** (600, 1.25rem, uppercase via the base rule, Deep Mauve): Card and panel h3s. German compound words break with `hyphens-auto`.
- **Lead** (400, 1.125–1.25rem): Hero intro and section intros; white at 80–85% on mauve, Text Grey on white.
- **Body** (400, 1rem, line-height 1.7, Text Grey): Paragraphs, card descriptions; intro blocks capped at max-w-2xl (~42rem).
- **Label** (600, 0.75rem, letter-spacing 0.1em, uppercase): Small group labels, e.g. "Alle Leistungen" in the nav dropdown.

### Named Rules
**The Legacy Heading Rule.** Headings inside `main` are uppercase, weight 400, Deep Mauve. Exceptions: h1s on mauve heroes and the h2 in the mauve contact section stay uppercase but are white and bold, set by utility classes that override colour and weight. Footer headings stay outside the rule.

**The Phone-As-Headline Rule.** In the contact section the phone number is set as large as a headline (1.875 → 2.25rem, bold, white). Calling is the main action.

## Layout

Single centred container (max 1200px, 24px gutters). Sections stack with 80px vertical padding (96–112px on md+), alternating White and Off-White backgrounds, ending with a full-bleed Deep Mauve contact section and a Deep Mauve footer. Grids: services 1 → 2 (sm) → 4 (lg) columns with 24px gaps; stats 1 → 3 (md); About and Kontakt split 2 columns at md/lg with 40–48px gaps. Intros are centred over card grids and left-aligned in split layouts. Desktop nav appears at `lg` (1024px); the header phone number only at `xl` (1280px). Below `lg`, a burger opens a collapsing panel with a native `<details>` for Leistungen. A floating chat launcher (pill, bottom-right) is on every page.

## Elevation & Depth

Hybrid: surfaces sit flat-ish on white with a hairline Rose Ash border and a very soft shadow, then lift on hover. Depth is a response to interaction, never decoration. Mauve sections create depth through colour, not shadow.

### Shadow Vocabulary
- **Rest** (`shadow-sm`): Cards, form panel, About image.
- **Lift** (`shadow-lg` + `translateY(-4px)`): Service cards on hover. Stat cards use `shadow-md`.
- **Header elevation** (`0 12px 32px -20px rgb(129 95 93 / 0.4)`): The sticky header gets it only after the page scrolls.
- **Overlay** (`shadow-2xl`): The chat panel; the launcher pill uses `shadow-lg`.

### Named Rules
**The Earned Lift Rule.** A shadow grows only when the visitor's pointer is on the element. Resting cards never compete for attention.

## Shapes

Soft, friendly corners throughout. 8px for buttons and inputs, 12px for service cards, icon tiles and the nav dropdown, 16px for stat cards, forms, content panels and images. Fully round for the chat launcher, chips, the hero badge and status dots. Borders are 1px Rose Ash at 15–30% (2px white outlines on mauve buttons). Recurring motifs: the short horizontal Rose Ash bar under headings (4px tall, 64–112px wide, grows in from the left or centre), and large thin-stroked circles bleeding off the hero corners.

### Named Rules
**The No-Square-Corners Rule.** Nothing interactive or framed has a 0 radius. The client explicitly rolled back a square-cornered editorial version.

## Components

Freundlich & solide: soft corners, a gentle lift on hover, never flashy.

### Buttons
- **Shape:** gently rounded (8px), semibold label.
- **Primary (on white):** Deep Mauve fill, white text, 12px × 28px (header CTA: 10px × 24px). Hover: Dusty Mauve.
- **On mauve:** white fill with Deep Mauve text (hero main CTA, 16px × 32px), or a 2px white outline with white text that fills white on hover. A softer 50%-white outline is used for secondary contacts (E-Mail).
- **Motion:** primary CTAs carry `data-magnetic` (pull up to 7px toward the cursor); transitions 300ms; all hover scale is disabled under reduced motion.
- **Focus:** 2px Deep Mauve outline, 2px offset; white outline inside mauve sections and the footer.

### Cards / Containers
- **Service card:** white, 12px radius, 32px padding, Rose Ash border at 15%, `shadow-sm`. Contents: 56px icon tile (Rose Ash 10% fill, 12px radius, 1.5px-stroke line icon), uppercase semibold title, description, "Mehr erfahren" link with an arrow that nudges right. Hover: lift 4px, `shadow-lg`, border to 40%, cursor spotlight.
- **Stat card:** white, 16px radius, 40px padding, centred icon (Rose Ash), bold Deep Mauve value (counts up when numeric), Text Grey label.
- **Panels:** form and Direktkontakt panels use the same 16px radius and Rose Ash 15% border; Direktkontakt sits on Off-White.

### Inputs / Fields
- **Style:** white, 8px radius, 1px Rose Ash 25% border, 12px × 16px padding; labels above in Deep Mauve, 0.875rem, medium weight.
- **Focus:** border to full Rose Ash plus a 2px Rose Ash 20% ring.
- **Disabled:** grey-50 fill, not-allowed cursor (chat input).

### Chips
- **Style:** small pill (full radius), white, Rose Ash 25% border, 0.75rem text; hover tints Rose Ash 10%. Used for chat quick replies.

### Navigation
- **Header:** sticky, 95% white with backdrop blur, hairline bottom border, logo left. Links in Text Grey, medium weight, with an underline that grows from the left on hover; the active link is Deep Mauve with `aria-current`. Leistungen opens a 12px-radius dropdown card listing all services on hover/focus. Right side: phone (xl+) and the primary "Kontakt" button.
- **Mobile:** burger in Deep Mauve; the panel expands by animating grid rows; Leistungen nests in a native disclosure.

### Photo Hero (signature)
Full-bleed team photo (`header_Unterseite.jpg`) under a left-to-right Deep Mauve gradient (95% → 75% → 30%), two thin Rose Ash circles drifting off the corners, an optional pill badge ("Seit 2000 in Schwalmstadt"), white bold h1, Rose Ash bar, lead text, two CTAs. Subpages use the compact PageHero variant (title, bar, subtitle).

### Chat Launcher (signature)
Deep Mauve pill fixed bottom-right with a round Rose Ash icon well; it opens a 16px-radius panel with a Deep Mauve header bar, white message bubbles (12px radius) and quick-reply chips. It stays fixed during page transitions.

## Do's and Don'ts

### Do:
- **Do** use Deep Mauve for every brand moment and Dusty Mauve only for hover.
- **Do** put a Rose Ash bar under every section heading and animate it with `data-bar`.
- **Do** keep cards at 12–16px radius with a Rose Ash 15% border and `shadow-sm`, lifting on hover.
- **Do** use real team photos from `public/images/team/` for people and heroes.
- **Do** keep reveals fast (0.5s, 0.06s stagger, 20px travel, `power2.out`) and fully disabled under `prefers-reduced-motion`.
- **Do** keep the phone number and a Kontakt action visible on every page.

### Don't:
- **Don't** introduce eyebrow labels or chapter numbers above sections (client decision 2026-06-12).
- **Don't** use square corners, a separate display typeface, or an editorial magazine layout. That version was rolled back.
- **Don't** add a second accent colour or change the font.
- **Don't** let an animation delay content: no entrance replay on internal navigation, no slow fades.
- **Don't** present AI-generated imagery as photos of the Kanzlei.
