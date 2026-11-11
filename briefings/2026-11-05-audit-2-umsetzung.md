# Briefing: Mobiler Hero und offene Audit-Punkte (Audit 2, walz-optimized)

## The Job
Ergebnis: Besuchern auf dem Smartphone im ersten Bildschirm zeigen, wer die Kanzlei ist, und sie mit einem Tipp zur Anfrage führen; Unternehmern alle Wege direkt verlinken, auf `/kontakt` das Formular früher zeigen und die Seite mobil schneller laden. Problem: Auf Android verdrängt der Fließtext jeden CTA aus dem ersten Bildschirm. Vermutete Lösung (Session entscheidet): Hero als Flex-Spalte in `svh`, Typografie per `clamp()` mit Höhenanteil.

Die Startseite von walz-landing (Astro 5, Tailwind) hat auf Smartphones einen Hero, der genau eine Bildschirmhöhe einnimmt. Dazu gehören:
- wenig Abstand zwischen Navbar und Hero-Titel;
- CTA-Buttons nebeneinander, am unteren Rand der Section fixiert;
- Texte, die mit der verfügbaren Höhe skalieren; zumindest die Einleitung (Subtitle), möglichst alle Texte.

Außerdem sind die Audit-Punkte umgesetzt, die keine Kanzlei-Freigabe brauchen:
- Bei „Lernen Sie Ihre Ansprechpartner kennen“ (`src/components/About.astro`) steht statt des Stempelmotivs ein echtes Foto aus `src/assets/team`, mit passendem Alt-Text.
- Die Anliegen-Karte „Unternehmen und Selbstständige“ (`src/components/Anliegen.astro`) verlinkt alle genannten Wege: Buchhaltung, Lohn, Jahresabschluss.
- Auf der Kontaktseite ist der große Bildbereich (`PageHero`) gekürzt, sodass das Formular früher sichtbar ist.
- Die Lighthouse-Hinweise sind bearbeitet, soweit es ohne neue Inhalte geht: Speed Index mobil 3,8 s, renderblockierende Ressourcen, 24 KiB ungenutztes JS, erzwungener Reflow.

## Why
Ich (Hape, Martini Labs) baue die optimierte Kanzlei-Website für Karsten Walz und teste sie extern per A/B gegen die alte Seite über https://walz-optimized.vercel.app. Auf Android wirkt der Hero überladen: Titel über 4 Zeilen, langer Fließtext, der Haupt-CTA rutscht bei 320–360 px weit unter den ersten Bildschirm. Der erste Bildschirm entscheidet, ob ein Besucher anfragt. Grundlage ist das Audit `audit/Website Audit Kanzlei Walz.docx` im Haupt-Checkout (Stand 5.11.2026, gegen walz-optimized).

## Guardrails
- Hero-Titel „Ihr Steuerberater in Schwalmstadt“ und der Tag-Text bleiben wörtlich. Gestaltung und Größe dürfen sich ändern.
- Die Leistungskarten (`Services.astro`) bleiben, wie sie sind, ebenso die Reihenfolge der Startseiten-Sections.
- Keine neuen Aussagen, die die Kanzlei bestätigen muss: Honorar, Kosten des Erstgesprächs, Rückmeldefristen, Terminformate, Qualifikationen, Mandantenstimmen, Kanzleiwechsel, Zusammenarbeit in 3 Schritten. Diese Punkte gehören zu Karsten.
- `noindex` auf Nicht-Produktiv-Hosts (`vercel.json`) bleibt, weil walz-optimized ein Duplikat der Kanzlei-Domain ist. Domain, Canonical und Search Console bleiben außen vor, weil der Zugang zur Domain fehlt.
- Höhe über `svh`/`dvh` lösen und nicht über feste Pixelwerte, damit die Lösung auf Android (Navbar oben, Browserleiste unten) und iOS gleich funktioniert. Feature-Toggle Chat (`src/data/features.ts`) bleibt aus.
- `prefers-reduced-motion`, „ohne JavaScript nutzbar“ und die Barrierefreiheit aus #10 (AC-10) bleiben erhalten.
- Arbeit auf neuem Branch `feat/12-audit-2` auf Basis von `feat/10-optimierungen`. Das Vercel-Projekt `walz-optimized` bekommt diesen Branch als Production-Branch (Ignore-Step anpassen). PR #11 bleibt unverändert.
- Referenzgerät ist Hapes Android-Screenshot mit Chrome und schwebender Adressleiste unten. Der sichtbare Bereich zwischen Systemleiste und Browserleiste ist etwa 411×770 CSS-px, davon nimmt die Navbar etwa 70 px ein. Für den Hero bleiben etwa 700 px. Auf dem Screenshot ist kein einziger CTA sichtbar, der Fließtext füllt den Bildschirm bis zur Browserleiste.
- Test-Viewports: 411×770 (Referenz), 320×560, 360×640 und 390×664 (iOS Safari).
- Annahme: Der CTA-Hinweis („Sie schildern uns kurz …“) bleibt per `aria-describedby` am Button und steht klein unter den Buttons.
- Annahme: Auch auf dem Desktop ist der Hero höchstens eine Bildschirmhöhe hoch, das Layout dort bleibt sonst gleich.

## Done means
Test-Viewports, wo nicht anders genannt: 411×770 (Referenz Android), 320×560, 360×640, 390×664 (iOS Safari). Messungen laufen per Playwright gegen den gebauten Stand (`astro preview`) und gegen walz-optimized.

| ID | Bedingung | Nachweis |
| --- | --- | --- |
| AC-1 | In allen 4 Test-Viewports liegt der Hero samt beider CTAs im ersten Bildschirm: Unterkante beider CTA-Buttons ≤ Viewport-Höhe bei Scroll 0, Hero-Höhe ≤ 100svh. | Neues Prüfskript unter `scripts/review/` misst `getBoundingClientRect()` von Hero und CTAs, PASS/FAIL je Viewport |
| AC-2 | In allen 4 Viewports ist kein Text abgeschnitten (kein Hero-Element mit `scrollHeight > clientHeight` oder `scrollWidth > clientWidth`, kein `line-clamp`/`text-overflow` auf Hero-Texten) und es gibt keinen horizontalen Überlauf (`documentElement.scrollWidth ≤ innerWidth`). | Dasselbe Prüfskript |
| AC-3 | In allen 4 Viewports stehen beide CTAs nebeneinander (gleiche `top` ±2 px) am unteren Rand der Section: Abstand CTA-Block-Unterkante zu Hero-Unterkante ≤ 48 px. Der CTA-Hinweis („Sie schildern uns kurz …“) steht klein unter den Buttons und hängt per `aria-describedby` am Hauptbutton. | Prüfskript; Screenshot je Viewport in `review-assets/`, im PR unter `## Screenshots` (vorher/nachher) |
| AC-4 | Abstand Navbar-Unterkante → Oberkante Hero-Titel ist in allen 4 Viewports kleiner als vorher und ≤ 32 px. | Prüfskript; Vorher-Werte von `feat/10-optimierungen` im PR |
| AC-5 | Der Subtitle skaliert mit der verfügbaren Höhe: Schriftgröße bei 320×560 < bei 411×770. Titel, Tag und Hinweis skalieren möglichst mit; wo nicht, steht der Grund im PR. | Prüfskript liest `getComputedStyle().fontSize` je Viewport |
| AC-6 | Desktop (1440×900, 1280×720): Hero ≤ 100svh, Layout sonst wie vorher. | Prüfskript plus Vorher/Nachher-Screenshots |
| AC-7 | `scripts/review/e2e.cjs` und `scripts/review/check-dist.mjs` bestehen. Der Hero-Textabgleich (AC-4 aus #10) ist grün, ohne Änderung an seinen Erwartungstexten. Titel „Ihr Steuerberater in Schwalmstadt“ und Tag-Text wörtlich unverändert. | Ausgabe beider Skripte im PR; `git diff feat/10-optimierungen -- scripts/review` ohne geänderte Erwartungstexte |
| AC-8 | AC-10 aus #10 bleibt erfüllt: Mit JS aus und bei `prefers-reduced-motion: reduce` sind Hero-Inhalte sichtbar (kein `opacity:0`); kein horizontales Scrollen bei 320 px und 200 % Zoom; axe-core ohne Verstöße auf den 4 Messseiten; Kontrast ≥ 4,5:1 bzw. 3:1. | Bestehende Playwright/axe-Prüfungen in `e2e.cjs` |
| AC-9 | „Lernen Sie Ihre Ansprechpartner kennen“ (`About.astro`) zeigt statt Stempelmotiv ein Foto aus `src/assets/team` über `astro:assets`, mit beschreibendem, nicht leerem Alt-Text und gesetzter Breite/Höhe (kein CLS). | Prüfung im gebauten HTML (`check-dist.mjs` erweitern): `<img>` aus `team/` mit Alt-Text; Screenshot |
| AC-10 | Die Karte „Unternehmen und Selbstständige“ (`Anliegen.astro`) verlinkt Buchhaltung, Lohn und Jahresabschluss; jeder Link liefert 200 bzw. belegt auf `/kontakt` das passende Anliegen vor und ist per Tab erreichbar. | e2e: Links auslesen, aufrufen, Vorbelegung prüfen; Tastaturablauf |
| AC-11 | `/kontakt`: `PageHero` ist gekürzt; die Oberkante des ersten Formularfelds liegt in allen 4 Viewports höher als vorher und bei 411×770 und 390×664 im ersten Bildschirm. | Prüfskript mit Vorher/Nachher-Werten; Screenshot |
| AC-12 | Lighthouse über `scripts/review/lighthouse.sh` gegen walz-optimized (Production = `feat/12-audit-2`), 3 Läufe, Median, 4 Messseiten: mobil ≥98, Desktop ≥99, A11y 100, BP 100; LCP, TBT und CLS je Seite und Formfaktor nicht schlechter als die Baseline von 93d6414. | `lighthouse.sh`-Ausgabe neu und Baseline; Mediantabelle mit Delta im PR, JSON-Berichte in `review-assets/` |
| AC-13 | Lighthouse-Hinweise bearbeitet (Startseite, mobil, Median): Speed Index < 3,8 s; „ungenutztes JS“ < 24 KiB; „renderblockierende Ressourcen“ und „erzwungener Reflow“ ohne Eintrag oder jeder verbleibende Eintrag im PR begründet. | Audits `speed-index`, `unused-javascript`, `render-blocking-insight`, `forced-reflow-insight` aus denselben JSONs, Vorher/Nachher-Tabelle im PR |
| AC-14 | PR von `feat/12-audit-2` mit `## Screenshots` (vorher/nachher, 4 Viewports + Desktop + `/kontakt`), `## Nachweise` je AC-ID und Abschnitt „Fragen an Karsten“ mit allen ausgeklammerten Punkten aus den Guardrails. | PR-Body |
| AC-15 | walz-optimized deployt `feat/12-audit-2` als Production (Ignore-Step angepasst); PR #11 bleibt unverändert (kein neuer Commit, Body gleich). | Vercel-Deployment-Liste: Production-Deployment mit SHA von `feat/12-audit-2`; `gh pr view 11 --json commits,body` vorher/nachher gleich |
| AC-16 | Bekommt ein Viewport den Hero ohne Textkürzung nicht in eine Bildschirmhöhe, stoppt die Session und legt Optionen vor, statt Text zu kürzen oder AC-1/AC-2 zu lockern. | Rückfrage im Chat, kein Commit mit gekürztem Text |

## Ambition
- Altitude: Kürzere mobile Fassung des Subtitles statt Stauchen. Das ist eine Textänderung → nur als Frage an Karsten, nicht im Scope.
- Depth: Echte Viewport-Geometrie in Chromium und WebKit (`svh`-Verhalten), Lighthouse-JSON statt Score-Bild, Waterfall und Performance-Profil der Startseite. Stretch: mobil 100, Speed Index ≤ 3,0 s.
- Crew: tut, was ein Barrierefreiheitsprüfer tut: neues `clamp()` bei 200 % Zoom und 320 px prüfen, Fließtext nicht unter 16 px (sonst im PR begründen). Tut, was ein Performance-Ingenieur tut: Quelle des erzwungenen Reflows im Profil benennen, bevor etwas geändert wird.

## Prüfung
langlebig · unabhängig · Kundenwebsite im A/B-Test mit echten Besuchern; Änderungen wirken auf Anfragen und Barrierefreiheit.

## First on approval
Issue anlegen, Branch `feat/12-audit-2` von `feat/10-optimierungen` erstellen, Vorher-Screenshots und Vorher-Messwerte (AC-1 bis AC-6, AC-11) in den 4 Viewports plus Desktop aufnehmen, Lighthouse-Baseline von 93d6414 messen.

## Annahmen
- `ui: on`: Screenshots und ein GIF des Hero-Ablaufs sind Pflicht im PR (bestätigt 2026-11-05)
- Baseline 93d6414 über eine Vercel-Preview dieses Commits, sonst Redeploy als Preview (bestätigt 2026-11-05)
- „Wenig Abstand“ = Navbar→Titel ≤ 32 px; „am unteren Rand“ = CTA-Block ≤ 48 px über Hero-Unterkante (bestätigt 2026-11-05)
- „Bearbeitet“ = Speed Index < 3,8 s, ungenutztes JS < 24 KiB (bestätigt 2026-11-05)
- About-Foto: Session wählt aus `src/assets/team`; Alt-Text nennt nur Namen, die im Projekt belegt sind (bestätigt 2026-11-05)
- Anliegen-Links: bestehende Leistungsseiten, wo vorhanden, sonst `/kontakt?anliegen=buchhaltung|lohn|jahresabschluss` (bestätigt 2026-11-05)
- Desktop-Prüfgrößen 1440×900 und 1280×720 (bestätigt 2026-11-05)
- CTA-Hinweis klein unter den Buttons, per `aria-describedby` am Button (aus Briefing, bestätigt 2026-11-05)
- Desktop-Hero höchstens eine Bildschirmhöhe, sonst gleich (aus Briefing, bestätigt 2026-11-05)
