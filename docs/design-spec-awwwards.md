# Design-Spec — Awwwards-Upgrade walz-landing

**Richtung in einem Satz:** „Stille Souveränität" — die geerbte Markenidentität
(Mauve `#815f5d`, Open Sans, VERSALIEN-Überschriften in Schriftschnitt 400)
wird durch editoriale Typo-Skalierung, Papier/Nacht-Sektionsrhythmus und eine
zurückhaltende, kanzleigerechte Scroll-Choreographie auf Award-Niveau gehoben —
ohne die Identität zu ersetzen.

## Sakral (bleibt unangetastet)

- Palette: `#815f5d` als einzige Markenfarbe, `#b09796` Sekundär, Grautöne.
- Open Sans als einzige Schriftfamilie (Versalien-Headings, weight 400-Regel).
- Inhalte/Texte, Seitenstruktur, Logo, deutsche Tonalität.
- Foto-Hero mit Mauve-Verlauf.

## Hebel (wird elevatiert)

| Hebel | Entscheidung |
|:------|:-------------|
| Typo-Skala | Fluid `clamp()`-Display-Größen, **weight 300** für Display-Versalien, line-height ≈ 1 |
| Eyebrows | 11px, `tracking 0.22em`, Versalien, über jeder Section-Headline |
| Kapitelnummern | Ghost-Ziffern 01/02/03 (Leistungen/Kanzlei/Kontakt), eine einheitliche `clamp()`-Größe, ~8 % Deckkraft |
| Radius | **0 site-weit** (näher an der eckigen Legacy-Divi-Optik als die aktuellen rounded-2xl-Karten) |
| Struktur | Hairline-Borders (10–20 % Mauve) statt Schatten-Karten |
| Sektionsrhythmus | Papier (weiß/`#f9f9f9`) ↔ Nacht (`#2c2120`, tiefes Mauve-Braun) für die Kontakt-Sektion |
| Kontrast | Fließtext `#666` statt `#9f9f9f` (WCAG AA), Footer-Text auf `white/85` |

## Motion-Vokabular (eine Datei: `src/scripts/motion.ts`)

- ease `power3.out`, easeLong `power4.out`, duration `0.9s`, stagger `0.09s`, travel `28px`
- GSAP + ScrollTrigger + SplitText, Lenis (`lerp 0.12`) auf dem GSAP-Ticker
- Deklarative API: `data-reveal`, `data-reveal-group`, `data-reveal-delay`,
  `data-lines`, `data-split`, `data-clip`, `data-parallax`, `data-count`
- Pre-Paint-Hide via Inline-Skript (`html.fx-motion`) + CSS-Failsafe (1.4s/1.8s)
- Seiteneintritt: Opacity-Fade des `[data-page]`-Wrappers (0.5s, MPA-tauglich)
- Reduced Motion: dreifache Absicherung (Opt-in-Skript, JS-Early-Return, CSS)

## Signature-Moment

**Leistungen als „Flowing Menu"**: 8 große editoriale Zeilen (Nummer + Titel +
Pfeil, Hairlines). Hover lässt ein mauvefarbenes Band von der Cursor-Kante
einlaufen, darin eine endlos fließende Marquee aus Titel + Kurzbeschreibung.
Nur auf `(hover: hover)` ohne Reduced Motion; Touch erhält die voll gestylten
statischen Zeilen.

## Atmosphäre

Partikel-Canvas (2D, ≤26 Motes, DPR ≤2, offscreen pausiert) in der
Nacht-Kontakt-Sektion, eingefärbt in Sekundär-Mauve + Creme.

## Technik

GSAP 3.13 (ScrollTrigger/SplitText frei) + Lenis, Vanilla-TS in Astro-Scripts.
Kein React, kein WebGL. Statisches MPA bleibt statisch.
