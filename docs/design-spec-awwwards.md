# Design-Spec — Motion-Upgrade walz-landing

**Verbindliche Vorgabe des Kunden (2026-06-12):** Das bestehende UX-Konzept und
Look-and-Feel bleiben UNVERÄNDERT — Karten-Layouts, abgerundete Ecken, Schatten,
Original-Typografie und Buttons bleiben exakt wie gehabt. Keine Eyebrow-Labels
("Leistungen", "Kanzlei", "Kontakt") und keine Kapitelnummern auf der
Landingpage. Ein früherer editorialer Umbau (Radius 0, Versalien-Display-Typo,
Flowing-Menu) wurde auf Kundenwunsch zurückgenommen.

Das Upgrade beschränkt sich auf eine **unsichtbare Schicht**: Motion, Polish
und Barrierefreiheit über dem unveränderten Design.

## Was die Motion-Schicht liefert

- GSAP + ScrollTrigger + Lenis (lerp 0.12) auf dem GSAP-Ticker
- Deklarative API: `data-reveal`, `data-reveal-group`, `data-reveal-delay`,
  `data-lines` (Hero-Headline, autorisierte Zeilen), `data-clip` (Bild-Wipe),
  `data-parallax` (Hintergrundbilder), `data-count` (Zähler), `data-particles`
  (dezente Partikel in der Kontakt-Sektion auf Original-Mauve)
- Pre-Paint-Hide (`html.fx-motion`) + CSS-Failsafe (1.4s/1.8s)
- Seiteneintritt: reiner Opacity-Fade (0.35s)

## Tempo-Vorgabe (Kunde: "Animationen zu langsam")

Reveals müssen als Polish lesen, nie als Ladezustand:
duration **0.55s**, stagger **0.06s**, travel **20px**, Zeilen-Rise **0.75s**,
Clip **0.8s**, Hero-Delays gestaucht (0.2/0.3/0.4). Die ganze Hero steht in
< 1 Sekunde.

## Beibehaltene unsichtbare Fixes

- WCAG: Fließtext `#666` statt `#9f9f9f`, Footer-Kleintext `white/85`
- Desktop-Navigation ab `lg` (Telefonnummer ab `xl`) gegen den 768/1024-Squeeze
- Chat-Dialog: Fokus-Falle, Scroll-Lock via Lenis, Fokus-Rückgabe, Live-Region
- `motion-reduce`-Guards auf allen Hover-Transforms; Reduced Motion =
  dreifache Absicherung (Inline-Skript, JS-Early-Return, CSS)
- Echte Facebook-URL im Footer, `min-w-0`/Hyphenation-Fix auf Leistungskarten
