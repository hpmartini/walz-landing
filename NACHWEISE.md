# Nachweise – Audit 2 (#12, Vertrag `briefings/2026-11-05-audit-2-umsetzung.md`)

Branch `feat/12-audit-2`. Messbasis: gebaute Site (`npm run build`, `dist/client`, lokal mit gzip über `npx serve@14`).
Vorher-Werte aus dem Build von `feat/10-optimierungen` (`review-assets/12/before/hero.json`).

| ID | Befehl / Artefakt | Ergebnis |
|:---|:------------------|:---------|
| AC-1 | `node scripts/review/hero.cjs http://localhost:4403 review-assets/12/after review-assets/12/before/hero.json` → `review-assets/12/hero-after.txt`, `after/hero.json` | PASS 12/12: CTA-Unterkanten ≤ Viewport-Höhe bei Scroll 0, Hero ≤ 100svh, Header + Hero = 100svh ±1 (411×770, 320×560, 360×640, 390×664). Vorher lagen die CTAs in allen 4 Viewports unter dem Falz. |
| AC-2 | wie AC-1 | PASS 8/8: kein Hero-Text abgeschnitten (scrollH/W, line-clamp, ellipsis, außerhalb Hero), kein horizontaler Überlauf |
| AC-3 | wie AC-1 | PASS 12/12: CTAs nebeneinander (top ±2), CTA-Block (Buttons + Hinweis) ≤ 48 px über Hero-Unterkante, Hinweis `#hero-cta-note` unter den Buttons, kleiner als der Subtitle, per `aria-describedby` verknüpft |
| AC-4 | wie AC-1 | PASS 4/4: Navbar → Titel ≤ 32 px, vorher 80 px |
| AC-5 | wie AC-1 (`info AC-5`-Zeilen) | PASS: Subtitle 13 px @320×560 < 18 px @411×770. Titel (24/32,3), Tag (12/14), Hinweis (12/13,9) und CTA (14/16) skalieren mit (`clamp(min, min(Xsvh, Yvw), max)`). Grund für den Subtitle unter 16 px auf kleinen Höhen: nur so passt der ungekürzte Text über die volle Höhe (AC-1/AC-2/AC-16); ab 411×770 sind es 18 px. |
| AC-6 | wie AC-1, Screenshots `review-assets/12/{before,after}/home-chromium-1440x900.png`, `…1280x720.png` | PASS 2/2: Hero ≤ 100svh (1280×720 vorher 793 px > 720). Layout sonst unverändert, nur das vertikale Padding skaliert mit `svh`. |
| AC-7 | `node scripts/review/check-dist.mjs` und `node scripts/review/e2e.cjs` gegen den Build → `review-assets/12/e2e-build.txt`; hero.cjs AC-7 | check-dist: alles PASS. e2e: Exit 0, Hero-Textabgleich (AC-4 aus #10) 1/1 ohne geänderte Erwartungstexte (`git diff feat/10-optimierungen -- scripts/review` ohne entfernte Zeilen). Titel und Tag wörtlich gleich (hero.cjs AC-7 6/6). |
| AC-8 | e2e (AC-10 aus #10) → `review-assets/12/e2e-build.txt` | PASS 37/37: axe-core ohne Verstöße, ohne JS und bei reduced motion Inhalte sichtbar, kein horizontaler Überlauf bei 320 px/640 px (200 % Zoom). |
| AC-9 | `node scripts/review/check-dist.mjs` (Block `#12 AC-9`) | PASS 3/3: About zeigt `src/assets/team/10-DSC07099.jpg` (Porträt Karsten Walz) über `astro:assets`, Alt-Text „Porträt von Karsten Walz, Steuerberater und Inhaber der Kanzlei“, width/height gesetzt. |
| AC-10 | `node scripts/review/e2e.cjs` (Block `#12 AC-10`) → `review-assets/12/e2e-build.txt` | PASS 8/8: Karte verlinkt Finanzbuchhaltung, Lohnbuchhaltung, Jahresabschlüsse; alle 3 per Tab erreichbar, alle 200, `/kontakt?anliegen=` belegt das passende Anliegen vor. |
| AC-11 | wie AC-1, Screenshots `review-assets/12/{before,after}/kontakt-*.png` | PASS 4/4: erstes Formularfeld in allen 4 Viewports höher als vorher (z. B. 390×664: vorher 785 px), bei 411×770 und 390×664 inkl. 48 px Feld im ersten Bildschirm. |
| AC-12 | offen: Production von walz-optimized steht noch auf `feat/10-optimierungen`; die Änderung von Production-Branch und Ignore-Step (`vercel api /v9/projects/prj_xfMFJZNag3P64VFSwoA0sNj85I8B`) hat der Auto-Mode-Klassifikator als Änderung an geteilter Ressource abgelehnt, braucht Freigabe des Nutzers. Baseline 93d6414: `review-assets/12/lh-baseline/`. | — |
| AC-13 | lokal indikativ: Lighthouse 13 mobil, Startseite, gzip-Server, vorher :4404 / nachher :4403 | Speed Index 0,87 s (< 3,8 s); ungenutztes JS 24 381 → 21 242 B (< 24 KiB, Lenis nur bei feinem Zeiger nachgeladen); renderblockierend 155 ms → kein Eintrag (Stylesheet inline); erzwungener Reflow: kein Eintrag. Messung gegen Production offen, Grund wie AC-12. |
| AC-14 | offen: Lauf-Vorgabe „kein PR, außer der Nutzer verlangt es“. Material liegt bereit: `review-assets/12/{before,after}/*.png`, `review-assets/12/e2e/`, diese Datei. | — |
| AC-15 | offen: Production-Branch/Ignore-Step, Grund wie AC-12. PR #11 unverändert belegt: `gh pr view 11 --json headRefOid,body,commits` gegen `review-assets/12/pr11-before.json` → headRefOid gleich, Body gleich, 16/16 Commits. | teilweise |
| AC-16 | hero.cjs AC-1/AC-2 PASS in allen Viewports ohne Textkürzung | nicht ausgelöst: kein Text gekürzt, keine Schwelle gelockert |

hero.cjs läuft zusätzlich in WebKit 390×664 (iOS-Safari-Engine): `PLAYWRIGHT_DIR=<playwright@1.51.1>/node_modules/playwright node scripts/review/hero.cjs …` → Exit 0, AC-1 15/15, AC-2 10/10, AC-3 15/15, AC-4 5/5, AC-11 5/5, AC-7 7/7.

## Unabhängiges Review

`review-assets/12/review.md` (mw:reviewer): blocker keine; major WebKit-Messung behoben, major fehlende Nachweise AC-12–15 = die `offen`-Zeilen oben; minors für den PR notiert.
