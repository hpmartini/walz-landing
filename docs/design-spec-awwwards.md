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
- Pre-Paint-Hide (`html.fx-motion`) + CSS-Failsafe (1.0s/1.4s)
- Seiteneintritt: reiner Opacity-Fade (0.35s)
- **Late-Boot-Guard:** Lädt das Motion-Skript langsamer als der Failsafe
  (Dev-Server, kalter Cache, langsames Netz), werden sichtbare Inhalte NIE
  erneut versteckt/animiert — Inhalt erscheint sofort statisch, nur
  Below-the-fold-Reveals animieren noch beim Scrollen. Verhindert das
  "erscheint → blinkt weg → animiert nochmal"-Muster.

## Tempo-Vorgabe (Kunde: "Animationen zu langsam")

Reveals müssen als Polish lesen, nie als Ladezustand:
duration **0.55s**, stagger **0.06s**, travel **20px**, Zeilen-Rise **0.75s**,
Clip **0.8s**, Hero-Delays gestaucht (0.2/0.3/0.4). Die ganze Hero steht in
< 1 Sekunde.

## Ausbaustufe 2 (2026-06-12): App-Shell-Navigation + Mikrointeraktionen

Alles weiterhin unsichtbare Schicht — Look-and-Feel unverändert:

- **Cross-Document View Transitions** (`@view-transition` in global.css):
  interne Navigationen cross-faden in 0.18s/0.24s; Header (`fx-header`) und
  Chat-Button (`fx-chat`) sind benannte Gruppen und stehen felsenfest wie
  eine App-Shell. Browser ohne Support navigieren normal (Progressive
  Enhancement), Reduced Motion deaktiviert die Transition.
- **Entrance nur beim Erstbesuch:** Das Inline-Head-Skript vergibt
  `fx-entrance` nur bei externem Referrer oder Reload. Interne Navigationen
  zeigen Inhalte ab dem ersten Frame (kein Pre-Paint-Hide, kein
  Reveal-Replay) — die View Transition trägt den Polish. Scroll-Reveals
  below the fold laufen weiterhin.
- **`data-bar`:** Trennbalken unter Überschriften wachsen per scaleX
  (0.7s, `data-bar="center"` für zentrierte Balken).
- **`data-drift`:** Deko-Kreise in Hero/PageHero driften gegen den Scroll
  (scrub) und atmen langsam (scale 1↔1.04, 7s sine).
- **`data-spotlight`:** Karten tragen ein mauve-getöntes Radial-Glow
  (13 % Secondary), das dem Cursor folgt — nur `(hover:hover) and
  (pointer:fine)`, CSS-Overlay, Ruhezustand unverändert.
- **`data-magnetic`:** Primär-CTAs (Hero, Kontakt-Sektion, Header) ziehen
  max. 7px zum Cursor (GSAP quickTo) und federn zurück; GSAP übernimmt den
  kompletten Transform (Markup hat dort kein hover:scale mehr), CSS behält
  Farb-/Schatten-Transitions.
- **`data-elevate`:** Sticky-Header bekommt seinen Schatten erst, wenn
  Inhalt darunter scrollt (>8px, via Lenis).
- **Mobile-Menü animiert** (grid-template-rows 0fr→1fr + Fade/Settle,
  `.fx-collapse` in global.css); geschlossen `visibility:hidden` = raus aus
  der Tab-Reihenfolge. Reduced Motion: schaltet hart ohne Transition.

## Beibehaltene unsichtbare Fixes

- WCAG: Fließtext `#666` statt `#9f9f9f`, Footer-Kleintext `white/85`
- Desktop-Navigation ab `lg` (Telefonnummer ab `xl`) gegen den 768/1024-Squeeze
- Chat-Dialog: Fokus-Falle, Scroll-Lock via Lenis, Fokus-Rückgabe, Live-Region
- `motion-reduce`-Guards auf allen Hover-Transforms; Reduced Motion =
  dreifache Absicherung (Inline-Skript, JS-Early-Return, CSS)
- Echte Facebook-URL im Footer, `min-w-0`/Hyphenation-Fix auf Leistungskarten
