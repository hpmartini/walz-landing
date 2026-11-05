# Unabhängiges Review #12 (mw:reviewer, nur Vertrag + Diff, Stand a84e134)

Ergebnis: **blocker keine**. AC-1 bis AC-11 erfüllt (eigene Läufe des Reviewers: build, hero.cjs, check-dist, e2e). AC-12 bis AC-15 hier nicht prüfbar, AC-16 nicht ausgelöst.

## Funde und Umgang

| Stufe | Fund | Umgang |
|:--|:--|:--|
| major | WebKit 390×664 (iOS-svh) nie gemessen, hero.cjs Exit 1 | behoben: `PLAYWRIGHT_DIR` in `scripts/review/hero.cjs` (Playwright 1.51 mit WebKit 2140 aus dem Cache). Lauf jetzt Exit 0, WebKit 390×664 alle Checks ok (`review-assets/12/hero-after.txt`) |
| major | Nachweise AC-12/13/14/15 fehlen | in `NACHWEISE.md` als `offen` mit Grund geführt (Vercel-Änderung braucht Freigabe; kein PR laut Lauf-Vorgabe); AC-13 lokal indikativ gemessen |
| minor | Subtitle 13 px, Tag/Hinweis 12 px bei 320×560 | Begründung in `NACHWEISE.md` (AC-5); gehört in den PR |
| minor | Bei echten 160 CSS-px (320 px @ 200 % Zoom) laufen die CTAs über | schon vorher vorhanden (Tag-`nowrap`, Leistungskarten); der Vertrag prüft 200 % über 640 px, dort grün. Für den PR notiert |
| minor | Desktop-Hero ohne Deckel, 1024×600 > 100svh | AC-6 nennt 1440×900 und 1280×720, beide PASS; für den PR notiert |
| minor | Desktop nicht ganz „wie vorher“ (Padding in svh, Hinweis unter beiden Buttons) | bewusst; für den PR notiert |
| minor | `--header-h: 53px` an den Header gekoppelt | hero.cjs mit before.json fängt Abweichung ab (Kommentar in `global.css`) |
| minor | `inlineStylesheets: 'always'`: CSS nicht seitenübergreifend gecacht | bewusster Tausch gegen renderblockierende Anfrage (AC-13); für den PR notiert |
| nit | `fx.ts`: `.catch(() => {})` ohne Log | belassen: natives Scrollen bleibt, Kommentar sagt es |

## Bericht (wörtlich gekürzt)

AC-1 bis AC-11 ja (AC-1/2 zunächst nur Chromium), AC-12 bis AC-15 nicht prüfbar, AC-16 n/a. Guardrails: Services.astro, Reihenfolge index.astro, features.ts, vercel.json unverändert; keine neuen Aussagen über die Kanzlei (Alt-Text durch team.json belegt); Höhe über `calc(100svh - var(--header-h))`.
