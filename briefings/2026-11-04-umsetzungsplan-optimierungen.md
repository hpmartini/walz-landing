# Briefing: Umsetzungsplan Kanzleiwebsite (SEO, ASO, Nutzerführung, Conversion, Performance)

## The Job
Alle Teile des Umsetzungsplans `docs/umsetzungsplan-2026-11-04.md` (Kopie des Issue-Anhangs, Kapitel 1–13), die im Code umsetzbar sind, sind in walz-landing umgesetzt. Ein neuer Besucher erkennt auf der Startseite Zielgruppe, Standort, Angebot und nächsten Schritt. Er findet über drei Anliegen-Karten die passende Leistung. Er stellt über `/kontakt?anliegen=…` eine vorbelegte Anfrage, die fehlerrobust ist. Suchmaschinen und Suchagenten bekommen je Seite eigene Metadaten, konsistente Stammdaten aus einer Quelle und permanente Weiterleitungen von den alten WordPress-URLs. Die Texte stammen wörtlich aus dem Plan. Lighthouse- und Barrierefreiheitswerte bleiben auf dem heutigen Niveau oder steigen.

## Why
Martini Labs setzt den Relaunch für die Kanzlei Karsten Walz (Schwalmstadt) um. Der Plan schließt Relaunch-Lücken vor dem Domainwechsel von WordPress auf diese Astro-Seite: Rankings dürfen nicht durch tote alte URLs verloren gehen. Die Seite soll konkrete Auswahlfragen beantworten und den Anfrageweg zu qualifizierten Anfragen führen. Karsten gibt die Texte danach fachlich frei. Der PR ist deshalb die Vorlage, die er prüft, kein Livegang.

## Guardrails
- Quelle der Texte, Titel, Descriptions und Formularwerte ist der Plan, wörtlich. Eigene Formulierungen nur für Mikrotexte, die der Plan offenlässt. Grund: Karsten gibt Plantexte frei, keine neuen.
- Sätze, die der Plan als „bedingt“ oder mit `[…]`-Freigabevermerk markiert, kommen nicht auf die Seite. Gleiches gilt für Namen von Ansprechpartnern, Softwaremarken und Antwortfristen. Grund: unbestätigte Aussagen sind laut Plan Fehler.
- FAQ nur dort, wo der Plan Frage und Antwort liefert (Kapitel 4, 5, 6). Die Fragen ohne Antwort aus Kapitel 7 und 8 entfallen; die neuen Leistungstexte und CTAs kommen trotzdem. FAQ-Schema nur aus sichtbaren FAQ.
- Stammdaten (Adresse, Telefon, E-Mail, Öffnungszeiten, Profile) liegen in `src/data/kanzlei.ts` als einziger Quelle. Header, Footer, Kontakt, FAQ, JSON-LD und `llms.txt` lesen daraus, auch der heute hartkodierte Footer (`Footer.astro:140`).
- Bestehende Bausteine nutzen: `Layout.astro` (Title, Description, Schema), `services.json` und `[slug].astro`, `api/kontakt.ts` (Resend, Rate-Limit), `motion.ts` und `prefersReducedMotion`. Kein neues Framework, keine neue Abhängigkeit ohne Not.
- Der Anliegen-Parameter ist eine Eingabe aus dem Netz. Er wird auf eine feste Liste abgebildet, unbekannte Werte werden verworfen. Der Server validiert erneut. Nichts davon wird ungeprüft als HTML ausgegeben.
- Out of scope, weil außerhalb des Repos oder abhängig von Kanzlei-Freigabe: Google-Unternehmensprofil, Search-Console-Export, echte Team- und Kanzleifotos, Nutzertests, ASO-Benchmark nach Launch, Analysewerkzeug mit Einwilligung (Kapitel 14), Freigaben aus Kapitel 16, Domainumstellung selbst.
- Hapes uncommittete Änderungen im Haupt-Checkout (`ChatWidget.astro`, `Header.astro`, `global.css`, `DESIGN.md`) gehören nicht in diesen PR. Gearbeitet wird im Worktree auf `feat/10-optimierungen`.
- Subagenten: höchstens 4 parallel, z. B. für Leistungsseiten-Texte und Messungen.

## Done means
| ID | Bedingung | Nachweis |
| --- | --- | --- |
| AC-1 | Freitagsschluss ist an jeder Ausgabestelle 13:30 Uhr (Footer, Kontakt, FAQ, JSON-LD, llms.txt). Alle Ausgaben stammen aus `kanzlei.ts`. Die Startseite nennt keine Mitarbeiterzahl mehr, sondern „Ein eingespieltes Team“. | Skript über `dist/` nach `npm run build`: kein `13:00`, kein `14 Mitarbeiter`; `grep` zeigt keine hartkodierten Zeiten in Komponenten |
| AC-2 | Jede der 9 Legacy-URLs (`/`, `/leistungen/`, `/datenschutzerklaerung/`, `/kontakt/`, `/kanzlei/`, `/cookie-richtlinie-eu/`, `/impressum/`, `/karriere/`, `/team/`), jeweils mit und ohne Slash, endet mit höchstens einem permanenten Weiterleitungsschritt (301/308) auf einer 200-Seite mit passendem Inhalt. `/cookie-richtlinie-eu` führt auf `/datenschutz`. | `curl` gegen die Vercel-Preview des PR-Branches; Tabelle URL → Status → Ziel → Status im PR |
| AC-3 | Ein Nicht-Produktions-Host liefert `X-Robots-Tag: noindex`. Die Produktionsdomain `www.kanzlei-karstenwalz.de` liefert es nicht und hat kein `noindex`-Meta. Die Entscheidung hängt am Host, nicht nur an `VERCEL_ENV`. robots.txt erlaubt das Crawlen. | `curl -I` auf Preview zeigt den Header; Test oder Skript simuliert den Produktions-Host (Host-Header), dort fehlt er |
| AC-4 | Startseite: H1, Absatz, Hauptbutton „Erstgespräch anfragen“ → `/kontakt?anliegen=erstgespraech`, Zweitbutton „Passende Leistung finden“ → existierender Anker `#leistungen`. Die Zeile unter dem Hauptbutton, drei Anliegen-Karten mit den Plan-Links und der Block „Lernen Sie Ihre Ansprechpartner kennen“ mit Button entsprechen wörtlich Kapitel 2. | Textabgleich-Skript gegen gebautes HTML; Playwright: Karten und Buttons per Tab erreichbar und aktivierbar |
| AC-5 | Kontakt: H1, Einleitung, Labels, Platzhalter, Hinweise und Statustexte entsprechen Kapitel 3 wörtlich. Das Feld „Ihr Anliegen“ hat genau die 7 Optionen. Die Werte `erstgespraech`, `gruendung`, `nachfolge`, `buchhaltung`, `lohn`, `jahresabschluss`, `steuererklaerung`, `coaching`, `bwl` und `steuerberatung` werden vorbelegt; unbekannte Werte und HTML-Payloads verworfen. | Playwright über `/kontakt?anliegen=<wert>` für jeden Wert plus `anliegen=<script>` und `anliegen=foo`: Auswahl korrekt bzw. leer, keine DOM-Injektion |
| AC-6 | Formularverhalten: Erfolgstext erst nach 2xx der API. Bei Fehler bleiben die Eingaben erhalten, der Fehlertext mit bedienbarem `mailto:` und `tel:` erscheint, erneuter Versuch geht. Doppeltes Absenden erzeugt genau einen Request. Die Status-Region nutzt ARIA (`role=status` bzw. `aria-live`). Feldfehler sind per `aria-describedby` zugeordnet, Fokus springt aufs erste fehlerhafte Feld. Der Server lehnt ein fehlendes oder unbekanntes Anliegen mit 400 ab. | Playwright mit gemockter `/api/kontakt` (500, 2xx, langsam plus Doppelklick); echter POST gegen `astro preview` ohne Resend-Key für 400-Validierung; echte Zustellung: `Nachweis: offen, weil Testpostfach und Resend-Key in der Session fehlen` |
| AC-7 | Alle 9 Leistungsseiten tragen H1, Einstieg und CTA mit Ziel `/kontakt?anliegen=…` laut Kapitel 4–8. Gründung, Nachfolge und Finanzbuchhaltung haben zusätzlich alle H2-Abschnitte und die FAQ aus dem Plan sowie die genannten internen Links. Bestehende Leistungslisten bleiben erhalten. | Textabgleich-Skript je Seite; Linkcheck: alle internen Links liefern 200 |
| AC-8 | Jede der 17 Seiten aus Kapitel 9 und 10 liefert exakt den Plan-Title und die Plan-Description im ausgelieferten HTML, ohne zusätzlich angehängten Kanzleinamen und ohne Keywordliste. Canonical, `og:url` und Sitemap nutzen dieselbe Ziel-URL. | Skript: `dist/`-HTML gegen die Tabellen aus Kapitel 9 und 10 parsen, 17/17 Treffer; Sitemap-URLs = Canonicals |
| AC-9 | JSON-LD: `AccountingService` behält die stabile `@id` und erhält `sameAs` mit den 3 Profilen aus Kapitel 11. Öffnungszeiten kommen aus `kanzlei.ts`. Jeder `Service` verweist per `provider` auf die `@id`. `BreadcrumbList` passt zur sichtbaren Navigation. Es gibt kein `FAQPage` ohne sichtbare FAQ und keine Bewertungssterne. `llms.txt` stimmt mit den Stammdaten überein. | Skript: JSON-LD aller Seiten parsen und gegen `kanzlei.ts` und sichtbaren Text prüfen; Schema-Validator (validator.schema.org) ohne Fehler |
| AC-10 | Robustheit und Barrierefreiheit: Mit deaktiviertem JS und bei `prefers-reduced-motion: reduce` sind alle Kerninhalte sichtbar (keine Elemente mit `opacity:0`), und Kontaktwege funktionieren. Ohne horizontales Scrollen bei 320 CSS-Pixeln und 200 % Zoom. Menü mit `aria-expanded`. Chatdialog: Fokus beim Öffnen, Escape schließt, Fokus kehrt zurück, geschlossen nicht fokussierbar. Honeypot `aria-hidden` und `tabindex=-1`. Kontrast mindestens 4,5:1 für normalen Text, mindestens 3:1 für großen Text und Bediengrafik. | Playwright: JS aus, reduced motion, Viewport 320/390/768/1440, Tastaturablauf; axe-core ohne Verstöße auf den 4 Messseiten |
| AC-11 | Cache: Dateien unter `/_astro/*` senden `public, max-age=31536000, immutable`. HTML, API, robots.txt und Sitemap bleiben ohne Langzeit-Cache. Unversionierte Fonts werden versioniert oder bleiben kurz gecacht. | `curl -I` auf der Vercel-Preview für je eine Datei jeder Klasse |
| AC-12 | Performance: Lighthouse, je 3 Kaltstarts auf Start, `/leistungen/existenzgruendung`, `/kontakt` und `/team`. Median mobil ≥98, Desktop ≥99, 100 als Stretch-Ziel. LCP ≤2,5 s, CLS ≤0,1, TBT möglichst ≤100 ms. A11y, Best Practices und SEO je 100. Keine neue Layoutverschiebung, kein funktionaler Rückschritt für einen Punktgewinn. | Lighthouse-CLI gegen die Vercel-Preview, JSON-Berichte und Mediantabelle im PR |
| AC-13 | Sichtbarer Endzustand belegt. | `## Screenshots` im PR: Startseite, Kontakt mit Vorbelegung und Fehlerzustand, eine Schwerpunktseite, mobil 390 px und Desktop 1440 px; GIF des Wegs Startseite → Karte → Leistung → CTA → vorbelegtes Formular |

Stopp-Regel: weiterarbeiten bis alle AC belegt oder als `offen, weil …` begründet sind. Abbruch nur bei fehlendem Zugriff auf die Vercel-Preview oder bei einem Widerspruch im Plan, der sichtbares Verhalten ändert (dann `mw board ask`). Rückmeldung: PR mit `## Review-Anleitung`, `## Nachweise` (eine Zeile je AC) und `## Screenshots`; dazu die Liste der Textstellen, die Karsten freigeben muss.

## Ambition
- Altitude: Kapitel 14 (Ereignismessung) und ASO-Benchmark machen Wirkung erst messbar. Vorschlag für ein Folge-Issue nach Wahl des Analysewerkzeugs, kein Scope hier.
- Depth: Lighthouse-CLI mit Median aus 3 Läufen statt Einzellauf, axe-core plus manueller Tastaturablauf, Legacy-Sitemap als Rohdaten für Weiterleitungen, Rich-Results- bzw. Schema-Validator. Ziel 100/100 Lighthouse auf allen 4 Seiten.
- Crew: SEO-Migration (jede Legacy-URL inklusive Slash-Variante durchspielen); Sicherheitsprüfung (Anliegen-Parameter und Formular-API mit Payloads, XSS, Header-Injection in der Mail); Accessibility-Prüfung (Tastatur, Screenreader-Semantik); Lektorat (Plantexte buchstabengetreu, keine Füllsätze).

## Prüfung
langlebig · unabhängig · Produktiv-Website des Kunden mit Formular-Eingaben aus dem Netz, Mailversand und SEO-Migration.

## First on approval
Worktree `.claude/worktrees/issue-10` (Branch `feat/10-optimierungen`) betreten und `docs/umsetzungsplan-2026-11-04.md` gegen den Code-Stand abgleichen. Mit Kapitel 1 beginnen: Stammdaten zentralisieren, Footer auf `kanzlei.ts` umstellen.

## Annahmen
- Freitag 13:30 Uhr ist richtig. Er steht in `kanzlei.ts`, Kontakt und Schema; nur der Footer weicht ab. Karsten bestätigt (vorgeschlagen).
- Plantexte gehen jetzt in den PR. Karstens Freigabe erfolgt vor dem Merge bzw. Livegang, nicht vor der Umsetzung (vorgeschlagen).
- Das Kanzleifoto bleibt bis zur Lieferung echter Fotos das bisherige Motiv (vorgeschlagen).
- Die 3 `sameAs`-Profile werden übernommen; ihre Aktualität bestätigt Karsten (vorgeschlagen).
- Weiterleitungsquelle ist die Yoast-Sitemap der Live-WordPress-Seite (9 URLs). Ein Search-Console-Export fehlt (vorgeschlagen).
- Kapitel 14 (Analyse-Events) kommt nicht hinein, weil Werkzeug und Einwilligung nicht entschieden sind (vorgeschlagen).
- `ui: on` für diesen Auftrag (vorgeschlagen).
