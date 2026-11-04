# Review PR #10 (feat/10-optimierungen, origin/main...2b30866)

Ergebnis: **kein blocker, kein major im Code.** Live-Nachweise (AC-2, 3-live, 11, 12, 13) nicht prüfbar: Preview hinter Vercel-SSO, kein Share-Token; HEAD 2b30866 nicht gepusht, kein PR offen.

| AC | erfüllt? | Nachweis (Befehl, Ergebnis) |
|---|---|---|
| AC-1 | ja | `npm run build && node scripts/review/check-dist.mjs`: AC-1 53/53; grep `src/`: keine Zeiten/Telefon in Komponenten (nur `team.json` Mail) |
| AC-2 | Code ja, live offen | `vercel.json:6-10` Redirects; `check-preview.sh` nicht lauffähig (SSO, kein Token) |
| AC-3 | statisch ja, live offen | check-dist AC-3 20/20 (Host-Simulation, kein noindex-Meta, robots Allow); `curl -I` Preview nicht möglich |
| AC-4 | ja | check-dist AC-4 8/8; e2e lokal (astro dev): Kartenlink per Tab erreichbar |
| AC-5 | ja | e2e lokal AC-5 19/19 (alle 10 Werte, `<script>`, `foo`/`unbekannt`, `__proto__`, `constructor`) |
| AC-6 | ja (Zustellung offen) | e2e lokal AC-6 15/15; `check-api.sh http://localhost:4391`: gültig 503, ohne anliegen 400, unbekannt 400, fremde Origin 403 |
| AC-7 | ja | check-dist AC-7 850/850 (CTAs, Linkcheck); eigenes Skript: alle services.json-Texte wörtlich im Plan (0 Abweichungen) |
| AC-8 | ja | check-dist AC-8 86/86; eigenes Skript seo.ts vs. Plan-Tabellen Kap. 9/10: 17/17 |
| AC-9 | ja | check-dist AC-9 107/107; `check-schema.sh`: 7 Seiten 0 Fehler (validator.schema.org) |
| AC-10 | ja (lokal) | e2e lokal AC-10 38/38 (JS aus, reduced motion, 320/390/768/1440/640, Menü, Chat, axe 5 Seiten) |
| AC-11 | Code ja, live offen | `vercel.json:15-17`; nicht per curl geprüft |
| AC-12 | offen | Lighthouse gegen Preview nicht möglich (SSO) |
| AC-13 | offen | PR existiert nicht; Screenshots/GIF lokal erzeugbar (`/tmp/rev10-art`), aber nicht im PR |

## Funde

### blocker
keine

### major
keine im Diff. AC-2/3/11/12/13 bleiben ohne Live-Nachweis, bis Token vorliegt und `scripts/review/10.sh <token>` grün läuft; vorher nicht mergen.

### minor
- `vercel.json:6-22`: Redirects/Header stehen nicht in `.vercel/output/config.json` (lokaler Build); Wirkung hängt am Merge durch Vercel beim Deploy. Nur Live-curl belegt AC-2/3/11.
- `astro.config.mjs:14`: `**.vercel.app` vertraut jedem vercel.app-Host als Forwarded-Host; nicht ausnutzbar (Vercel setzt X-Forwarded-Host selbst, Origin-Check bleibt), enger wäre `walz-landing-*-hpm-devs-projects.vercel.app`.
- `vercel.json:19`: Apex `kanzlei-karstenwalz.de` (ohne www) bekommt noindex; ok nur, wenn Apex auf www weiterleitet.
- `src/pages/kontakt.astro:1190`: Feldfehler zeigen per `aria-describedby` auf die gemeinsame Status-Region, nicht auf feldspezifischen Text; erfüllt AC formal.
- `src/pages/kontakt.astro:1159` (Diff) / Vorbelegung nur per JS; ohne JS bleibt Auswahl leer, Fehler-Redirect (`api/kontakt.ts:75`) verliert Eingaben (vorbestehend).
- `src/data/services.json` finanzbuchhaltung FAQ „Kann ich Belege digital bereitstellen": Plan hängt `[Nach Bestätigung konkrete Systeme ergänzen]` an; Antwort übernommen, Vermerk weggelassen. Vertretbar (Vermerk betrifft Ergänzung), Karsten-Freigabeliste nennen.
- `src/pages/api/kontakt.ts:26`: E-Mail-Regex lässt `a,b@c.de` durch → `reply_to` mit Komma (vorbestehend, kein Header-Injection da kein Whitespace).
- e2e prüft AC-4 nur Erreichbarkeit eines Kartenlinks, nicht Aktivierung aller Karten/Buttons; Chat „geschlossen nicht fokussierbar" ungetestet.
- `src/data/team.json:14`: Mail hartkodiert außerhalb `kanzlei.ts`.

### nit
- `[slug].astro`: „Passende Leistung:" eigener Mikrotext.

## Nicht geprüft
- Live: Redirect-Tabelle, X-Robots-Tag, Cache-Header, Lighthouse-Median (SSO-Preview ohne Token; HEAD nicht gepusht).
- E2E lief gegen `astro dev`, nicht Preview.
- Echte Mailzustellung (kein Resend-Key).
