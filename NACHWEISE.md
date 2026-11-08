# Nachweise – Audit 2 (#12, Vertrag `briefings/2026-11-05-audit-2-umsetzung.md`)

Branch `feat/12-audit-2`, Stand `05b1f1e`. Geprüft über den echten Pfad: Production-Deployment
**https://walz-optimized-v2.vercel.app** (Vercel-Projekt `walz-optimized-v2`, `prj_dJEggvDnoge7zWApBNkmKx6dQdBs`,
Production-Branch `feat/12-audit-2`, Ignore-Step `[ "$VERCEL_GIT_COMMIT_REF" != "feat/12-audit-2" ]`, auf Wunsch des Nutzers
neu angelegt statt `walz-optimized` umzustellen). Vorher-Werte aus dem Build von `feat/10-optimierungen`
(`review-assets/12/before/hero.json`), Lighthouse-Baseline gegen das 93d6414-Deployment
`walz-optimized-95zusdpci-hpm-devs-projects.vercel.app`.

| ID | Befehl / Artefakt | Ergebnis |
|:---|:------------------|:---------|
| AC-1 | `PLAYWRIGHT_DIR=<playwright@1.51.1> node scripts/review/hero.cjs https://walz-optimized-v2.vercel.app review-assets/12/v2 review-assets/12/before/hero.json` → `review-assets/12/hero-v2.txt` | PASS 15/15 (4 Chromium-Viewports + WebKit 390×664): CTA-Unterkanten ≤ Viewport-Höhe bei Scroll 0, Hero ≤ 100svh, Header + Hero = 100svh ±1. Vorher lagen die CTAs in allen Viewports unter dem Falz. |
| AC-2 | wie AC-1 | PASS 10/10: kein Hero-Text abgeschnitten (scrollH/W, line-clamp, ellipsis, außerhalb Hero), kein horizontaler Überlauf |
| AC-3 | wie AC-1 | PASS 15/15: CTAs nebeneinander (top ±2), CTA-Block (Buttons + Hinweis) 16 px über Hero-Unterkante, Hinweis `#hero-cta-note` unter den Buttons, kleiner als der Subtitle, per `aria-describedby` verknüpft |
| AC-4 | wie AC-1 | PASS 5/5: Navbar → Titel 16 px, vorher 80 px |
| AC-5 | wie AC-1 (`info AC-5`-Zeilen) | PASS: Subtitle 13 px @320×560 < 18 px @411×770. Titel (24/32,3), Tag (12/14), Hinweis (12/13,9), CTA (14/16) skalieren mit (`clamp(min, min(Xsvh, Yvw), max)`). Grund für den Subtitle unter 16 px auf kleinen Höhen: nur so passt der ungekürzte Text in eine Bildschirmhöhe (AC-1/AC-2/AC-16); ab 411×770 sind es 18 px. |
| AC-6 | wie AC-1, Screenshots `review-assets/12/{before,v2}/home-chromium-1440x900.png`, `…1280x720.png` | PASS 2/2: Hero ≤ 100svh (1280×720 vorher 793 px > 720). Layout sonst gleich, nur das vertikale Padding skaliert mit `svh`. |
| AC-7 | `node scripts/review/check-dist.mjs` → `review-assets/12/check-dist.txt`; `node scripts/review/e2e.cjs https://walz-optimized-v2.vercel.app "" review-assets/12/e2e-v2` → `review-assets/12/e2e-v2.txt` | check-dist alles PASS; e2e Exit 0; Hero-Textabgleich (AC-4 aus #10) 1/1 ohne geänderte Erwartungstexte (`git diff feat/10-optimierungen -- scripts/review` ohne entfernte Zeilen). Titel und Tag wörtlich gleich (hero.cjs AC-7 7/7). |
| AC-8 | e2e (AC-10 aus #10) → `review-assets/12/e2e-v2.txt` | PASS 37/37: axe-core ohne Verstöße, ohne JS und bei reduced motion Inhalte sichtbar, kein horizontaler Überlauf bei 320 px / 640 px (200 % Zoom). |
| AC-9 | `node scripts/review/check-dist.mjs` (Block `#12 AC-9`) | PASS 3/3: About zeigt `src/assets/team/10-DSC07099.jpg` (Porträt Karsten Walz) über `astro:assets`, Alt-Text „Porträt von Karsten Walz, Steuerberater und Inhaber der Kanzlei“, width/height gesetzt. |
| AC-10 | e2e (Block `#12 AC-10`) → `review-assets/12/e2e-v2.txt` | PASS 8/8: Karte verlinkt Finanzbuchhaltung, Lohnbuchhaltung, Jahresabschlüsse; alle 3 per Tab erreichbar, alle 200, `/kontakt?anliegen=` belegt das passende Anliegen vor. |
| AC-11 | wie AC-1, Screenshots `review-assets/12/{before,v2}/kontakt-*.png` | PASS 5/5: erstes Formularfeld überall höher als vorher (390×664: 601 statt 785 px, 411×770: 573 statt 757), bei 411×770 und 390×664 inkl. 48 px Feld im ersten Bildschirm (WebKit 600 px). |
| AC-12 | `scripts/review/lighthouse.sh <url> "" <dir>` je Baseline und v2, zwei Paare: `review-assets/12/lh-baseline{,-2}.txt`, `lh-v2{,-2}.txt`, JSON in den gleichnamigen Ordnern; Delta `node scripts/review/lh-delta.cjs` → `lh-delta-1.md`, `lh-delta-2.md` | Schwellen PASS 8/8 in beiden Läufen: Performance 100 mobil und Desktop, A11y 100, BP 100, keine SEO-Fehler. Delta „nicht schlechter als Baseline“ **nicht erfüllt**: je Paar 5 von 24 Medianen höher (Paar 1: `/` mobil LCP +15 ms, TBT +32 ms; `/team` mobil LCP +26, TBT +11; `/team` Desktop LCP +13. Paar 2: `/` mobil TBT +7; `/` Desktop LCP +25; Existenzgründung mobil LCP +80, TBT +42; `/team` Desktop LCP +1). Die betroffenen Seiten wechseln zwischen den Läufen, CLS ist überall 0,000. Abwechselnde Einzelläufe Startseite mobil (Baseline/v2 im Wechsel): TBT-Median 26 vs. 2 ms, LCP 1429 vs. 1424 ms. Eine echte Verschlechterung (CLS 0,002 Desktop-Startseite durch den Font-Wechsel) ist mit `05b1f1e` behoben. Schwelle nicht gelockert. |
| AC-13 | `lh-delta-1.md`, `lh-delta-2.md` (Startseite mobil, Median, Audits `speed-index`, `unused-javascript`, `render-blocking-insight`, `forced-reflow-insight`) | PASS: Speed Index 1166 / 1032 ms (< 3,8 s); ungenutztes JS 24 880 → 21 691 B (< 24 KiB, Lenis nur bei feinem Zeiger); renderblockierend 1 → 0 Einträge (Stylesheet inline); erzwungener Reflow 0 Einträge. |
| AC-14 | offen: Lauf-Vorgabe „kein PR, außer der Nutzer verlangt es“. Material liegt bereit: Screenshots `review-assets/12/{before,v2}/`, GIF/Screenshots `review-assets/12/e2e-v2/`, Delta-Tabellen `lh-delta-*.md`, diese Datei. | — |
| AC-15 | `vercel api /v13/deployments/walz-optimized-v2.vercel.app`; `gh pr view 11 --json headRefOid,body,commits` gegen `review-assets/12/pr11-before.json` | Production-Deployment `walz-optimized-v2-258usq06g…` mit target production, Branch `feat/12-audit-2`, SHA `05b1f1e`. Abweichung: Projekt `walz-optimized-v2` statt `walz-optimized` (Nutzerwunsch); `walz-optimized` unverändert auf `feat/10-optimierungen`. PR #11 unverändert: headRefOid gleich, Body gleich, 16 Commits. |
| AC-16 | hero.cjs AC-1/AC-2 PASS in allen Viewports ohne Textkürzung | nicht ausgelöst: kein Text gekürzt, keine Schwelle gelockert |

## Offene Kriterien

AC-12 offen: Lighthouse-Schwellen erfüllt, aber „LCP/TBT/CLS nicht schlechter als Baseline“ hält bei 3 Läufen mit Median nicht stabil. Die Abweichungen liegen im Messrauschen (wechselnde Seiten, ≤ 80 ms LCP, ≤ 42 ms TBT), sind aber nicht null. Lockern, mehr Läufe oder Toleranz entscheidet der Nutzer.
AC-14 offen: Lauf-Vorgabe „kein PR, außer der Nutzer verlangt es“.

## Hinweise zu v2

- Env-Variablen nicht übernommen: `RESEND_API_KEY` ist bei `walz-optimized` als sensitive gespeichert und nicht auslesbar. Auf v2 antwortet `/api/kontakt` deshalb mit 503 und dem Fehlertext mit Telefon- und Mail-Link (e2e prüft genau diesen Pfad); Testanfragen erreichen die Kanzlei nicht.
- Vercel-Schutz wie bei `walz-optimized`: nur Previews geschützt, Production öffentlich; `X-Robots-Tag: noindex` aus `vercel.json` aktiv.

## Nachtrag: Hero-Entscheidung des Inhabers

Der Nutzer hat die kompakte Hero-Fassung aus Audit 3 verworfen: freigegebener Titel mit Box-Span, alter Subtitel, Stempel-Foto der
Altseite, Hero füllt den Viewport. CTA-Hinweis und Adresszeile sind entfallen. `hero.cjs` und `check-dist.mjs` prüfen deshalb diese
Fassung; die Zeilen AC-1 bis AC-7 oben beschreiben den Stand `05b1f1e`. Neu: H1 und Box strukturell, Subtitel vollständig, Kontrast
mit Abdeckung jedes Textlaufs, kurze Fenster 1024×640, 1024×600, 844×390 (Review Codex).

## Unabhängiges Review

`review-assets/12/review.md` (mw:reviewer, Stand a84e134): blocker keine; major WebKit-Messung behoben; major „fehlende Nachweise AC-12–15“ jetzt mit v2 belegt (AC-12 Delta und AC-14 offen, siehe oben); minors für den PR notiert. Nach dem Review geändert: Font-Fallback (`src/styles/global.css`) und das neue Delta-Skript `scripts/review/lh-delta.cjs`.
