# Konkreter Umsetzungsplan für die Kanzleiwebsite

Kanzlei Karsten Walz

**SEO  ASO  Nutzerführung  Conversion  Performance**

Arbeitsstand 4. November 2026  |  Verantwortlich für die Umsetzung Martini Labs

Die Website hat eine sehr gute technische Basis. Die nächsten Schritte schließen Relaunch-Lücken, beantworten konkrete Auswahlfragen und machen den Anfrageweg messbar. Dieses Dokument enthält Einbauorte, direkt nutzbare Texte, technische Änderungen und überprüfbare Abnahmekriterien.

### Ziele und Grenzen der Scores

| Bereich | Ausgangswert | Abnahmeziel |
| --- | --- | --- |
| Lighthouse mobil / Desktop | Performance 98 / 100 | 100 anstreben; stabil ≥98 mobil, ≥99 Desktop |
| Automatische Basisprüfungen | A11y, Best Practices, SEO je 100 | 100 halten und manuelle Prüfungen bestehen |
| Agentisches Browsing | 3 von 3 Prüfungen | Bestandene Prüfungen halten; ASO separat messen |
| Inhalt und Conversion | Fachliche Bewertung 60–80 von 100 | Rubrik in Kapitel 16 vollständig erfüllen |
| Geschäftliche Wirkung | Ausgangsmessung offen | Qualifizierte Anfragen je Herkunft erfassen |

Ein Lighthouse-Wert ist ein Labortest einer einzelnen Seite. Schwankungen gehören zur Messung. Fachliche Bewertungen besitzen keinen allgemeingültigen Maximalwert; eine höhere Conversion wird anhand realer Anfragen geprüft. Garantien für Rankings oder KI-Empfehlungen lassen sich daraus nicht ableiten.

### Reihenfolge der Umsetzung

1. Daten und Launch absichern. 2. Startseite und Kontakt verbessern. 3. Drei Leistungsseiten ausbauen. 4. Weitere Leistungen, Metadaten und Profile schärfen. 5. Tests ausführen und nach dem Launch nachsteuern.

**Freigaberegel** Alle Website-Texte sind konkrete Vorschläge. Karsten bestätigt Leistungsumfang, Mandatsaufnahme, Arbeitsweise und Zuständigkeiten vor Veröffentlichung. Aussagen mit dem Zusatz „bedingt“ gelten erst nach dieser Bestätigung.

## 1 Daten und Relaunch absichern

**P0  Verantwortlich** Entwicklung und Kanzlei  |  Budget 3–6 Stunden plus Freigabe

### Eine Quelle für Kanzleidaten anlegen

Adresse, Telefon, E-Mail, Öffnungszeiten, Mitarbeiterzahl und Profil-URLs in einem zentralen Datenobjekt pflegen. Header, Footer, Kontakt, FAQ, Schema und llms.txt daraus erzeugen. Die aktuell widersprüchliche Freitagsschlusszeit mit Karsten klären: Kontakt und Schema nennen 13:30 Uhr, der Footer 13:00 Uhr. Den bestätigten Wert überall ausgeben.

Die Startseite nennt 14 Mitarbeiter; die Teamseite führt aktuell 17 Personen auf. Definition und aktuellen Stand bestätigen: Mitarbeiter, Inhaber, Auszubildende und Teilzeitkräfte konsistent zählen. Bis zur Freigabe den Zähler durch „Ein eingespieltes Team“ ersetzen.

### Weiterleitungen und Domain

Alle alten URLs aus der bisherigen Sitemap und Search Console exportieren. Pro URL das inhaltlich passende Ziel festlegen. Bestehende Pfade möglichst erhalten. Slash-Varianten auf eine bevorzugte Variante vereinheitlichen. Inhalte der bisherigen Cookie-Seite prüfen und entweder erhalten oder auf eine inhaltlich entsprechende Informationsseite führen.

Beispiel vercel.json – in bestehende Konfiguration integrieren

```json
{
  "redirects": [
    {"source": "/datenschutzerklaerung",
     "destination": "/datenschutz", "permanent": true},
    {"source": "/datenschutzerklaerung/",
     "destination": "/datenschutz", "permanent": true}
  ]
}
```

Vercel verwendet für permanent üblicherweise 308. Entscheidend sind ein permanenter Status, das passende Ziel und höchstens ein Weiterleitungsschritt. Die konkrete Kombination mit der Slash-Konfiguration testen.

### Vorschau und Produktion trennen

Produktionsdomain bleibt https://www.kanzlei-karstenwalz.de. Für echte Vorschau-Hosts X-Robots-Tag: noindex setzen und Crawling für die Erkennung dieses Headers zulassen. Die Indexierungsfreigabe an den Host koppeln; die Vercel-Produktions-URL kann trotz Preview-Inhalt VERCEL_ENV=production haben. Nach Launch die Alias-Domain auf die Hauptdomain weiterleiten oder zuverlässig auf noindex halten.

**Abnahme** Alte Datenschutz-URL führt permanent zum Ziel; Produktionsseiten liefern 200 ohne noindex; Canonical und Sitemap verwenden dieselben Ziel-URLs. Logo und og-image.jpg funktionieren unter der Kanzleidomain. Ein Test aller alten URLs dokumentiert Ziel, Status und Inhalt.

## 2 Startseite konkret überarbeiten

**P1  Ort** /  |  Ziel Auswahl erleichtern und Erwartungen an die Anfrage klären

### Hero und erste Handlungsaufforderung

**H1 ersetzen durch** Steuerberatung in Schwalmstadt für Unternehmen und Privatpersonen

**Absatz darunter** Ob Sie ein Unternehmen gründen, laufende steuerliche Aufgaben abgeben oder Ihre private Steuererklärung erstellen lassen möchten: Die Kanzlei Karsten Walz unterstützt Sie bei Ihren nächsten Schritten. Lernen Sie unsere Leistungen und die Menschen dahinter kennen.

**Hauptbutton** Erstgespräch anfragen

**Zweiter Button** Passende Leistung finden

**Kleine Zeile unter dem Hauptbutton** Sie schildern uns kurz Ihr Anliegen. Anschließend klären wir gemeinsam, ob und wie wir Sie unterstützen können.

Hauptbutton führt zu /kontakt?anliegen=erstgespraech. Zweiter Button springt zu einem echten Anker #leistungen. Überflüssige Doppelnavigation vermeiden.

### Direkt nach dem Hero drei Anliegen anbieten

| Karte | Text | Link |
| --- | --- | --- |
| Unternehmen und Selbstständige | Buchhaltung, Lohn und Jahresabschluss: Finden Sie die passende Unterstützung für Ihren Betrieb. | /leistungen/finanzbuchhaltung |
| Gründung und Nachfolge | Eine Gründung vorbereiten oder die Unternehmensübergabe planen: Klären Sie die nächsten Schritte. | /leistungen/existenzgruendung und /leistungen/nachfolgeberatung |
| Privatpersonen und Vereine | Steuererklärungen und individuelle Fragen: Erfahren Sie, wobei wir Sie unterstützen. | /leistungen/steuererklaerungen |

### Vertrauen durch konkrete Informationen

**Überschrift im Kanzleibereich** Lernen Sie Ihre Ansprechpartner kennen

**Absatz** Karsten Walz ist seit 2000 als selbstständiger Steuerberater tätig. Auf unserer Teamseite finden Sie die Ansprechpartner und ihre fachlichen Aufgabenbereiche. So können Sie sich vor dem ersten Gespräch ein Bild von der Kanzlei machen.

**Button** Team und Aufgabenbereiche ansehen

Ein echtes Team- oder Kanzleifoto anstelle des erneut verwendeten Stempelmotivs einsetzen. Motiv, Nutzungsrechte und Einwilligungen klären; Bild responsive und komprimiert ausliefern.

**Abnahme** Ein neuer Besucher erkennt Zielgruppe, Standort, Angebot und nächsten Schritt. Der Hauptbutton benennt eine Anfrage. Alle Karten und Sprungziele sind auf Mobilgeräten und per Tastatur erreichbar.

## 3 Kontakt und Anfrageweg fertigstellen

**P1  Ort** /kontakt  |  Budget 2–4 Stunden plus kontrollierter Zustellungstest

**H1** Erstgespräch oder Rückruf anfragen

**Einleitung** Beschreiben Sie kurz, wobei Sie Unterstützung suchen. Wir prüfen Ihr Anliegen und melden uns, um die nächsten Schritte mit Ihnen abzustimmen.

**Überschrift über dem Formular** Worum geht es bei Ihrer Anfrage

### Formularfelder und Vorbelegung

Name und E-Mail als Pflichtfelder behalten; Telefon bleibt optional. Das Auswahlfeld „Ihr Anliegen“ ergänzen: Gründung, Nachfolge, laufende Buchhaltung, Lohnabrechnung, Jahresabschluss, Steuererklärung, andere Frage. Bestehende URL-Parameter anliegen=… auf diese feste Auswahlliste abbilden; unbekannte Werte verwerfen. Keine fremden Parameter ungeprüft als HTML ausgeben.

**Label Nachricht** Ihr Anliegen in wenigen Sätzen

**Platzhalter** Zum Beispiel: Ich plane eine Gründung in Schwalmstadt und suche Unterstützung bei der Rechtsformwahl und Finanzplanung.

**Hinweis unter Nachricht** Für die erste Anfrage genügt eine kurze Beschreibung. Bescheide, Steuerunterlagen und andere vertrauliche Dokumente besprechen wir anschließend über einen geeigneten Übermittlungsweg.

**Button** Anfrage senden

**Hinweis unter dem Button** Ihre Angaben verwenden wir zur Bearbeitung Ihrer Anfrage. Einzelheiten finden Sie in unserer Datenschutzerklärung.

### Status und Fehlermeldungen

**Ladezustand** Anfrage wird gesendet …

**Erfolg bei bestätigter Serverannahme** Vielen Dank. Ihre Anfrage wurde übermittelt. Wir melden uns, um Ihr Anliegen und die nächsten Schritte zu besprechen.

**Pflichtfeldfehler** Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse und Ihr Anliegen ein.

**Technischer Fehler** Ihre Anfrage konnte gerade nicht übermittelt werden. Ihre Eingaben bleiben erhalten. Versuchen Sie es erneut oder schreiben Sie an info@kanzlei-karstenwalz.de.

E-Mail-Link und Telefonnummer im Fehlertext bedienbar halten. Erfolg erst nach erfolgreicher API-Antwort anzeigen. Formular nach Fehler erhalten; doppeltes Absenden verhindern. Serverseitig erneut validieren und Versandfehler protokollieren. ARIA-Status und Feldfehler zuordnen; Fokus bei Fehlern sinnvoll führen.

**Bedingte Ergänzung nach verbindlicher Freigabe** Wir melden uns in der Regel innerhalb von zwei Werktagen. [Nur übernehmen, wenn die Kanzlei dies organisatorisch zusagt; sonst den allgemeinen Text verwenden.]

**Abnahme** Ein kontrollierter Test landet im vorgesehenen Testpostfach. Antwortadresse, Sonderzeichen, mobile Tastatur, Pflichtfelder, Fehlerfall und erneuter Versuch funktionieren. Formularerfolg und Mailzustellung getrennt dokumentieren.

## 4 Gründungsberatung als erste Schwerpunktseite

**P1  Ort** /leistungen/existenzgruendung  |  Alle folgenden Textblöcke fachlich freigeben

**H1** Existenzgründungsberatung in Schwalmstadt

**Einstieg** Sie möchten sich selbstständig machen und Ihre Gründung strukturiert vorbereiten? Wir unterstützen Sie dabei, Ihr Vorhaben wirtschaftlich und steuerlich einzuordnen. Gemeinsam klären wir, welche Entscheidungen vor dem Start anstehen und welche Unterlagen Sie dafür benötigen.

**H2 Für wen die Beratung gedacht ist** Die Beratung richtet sich an Menschen, die eine Geschäftsidee konkretisieren oder den Schritt in die Selbstständigkeit vorbereiten. Auch wenn Sie bereits erste Planungen erstellt haben, können wir die offenen wirtschaftlichen und steuerlichen Fragen mit Ihnen besprechen.

**H2 Wobei wir Sie unterstützen** Wir begleiten Sie bei der Entwicklung Ihres Geschäftskonzepts sowie bei Businessplan und Finanzplanung. Dazu gehören Fragen zur Rechtsform, zur Finanzierung und zu möglichen Fördermitteln. Welche Aufgaben wir konkret übernehmen, legen wir passend zu Ihrem Vorhaben fest. Unterstützung bei Anmeldungen und Behördengängen besprechen wir im Rahmen der Gründungsvorbereitung.

**H2 So bereiten Sie das Erstgespräch vor** Beschreiben Sie Ihre Geschäftsidee, den geplanten Start und Ihre bisherigen Schritte. Wenn vorhanden, bringen Sie Ihren Businessplan, eine erste Finanzplanung und Ihre offenen Fragen mit. Auch ein früher Planungsstand eignet sich, um gemeinsam die nächsten Aufgaben festzulegen.

**H2 Wie geht es anschließend weiter** Im ersten Gespräch besprechen wir Ihr Vorhaben und den gewünschten Beratungsumfang. Darauf aufbauend stimmen wir die nächsten Schritte, Zuständigkeiten und die Vergütung mit Ihnen ab.

**FAQ Wann sollte ich einen Steuerberater einbeziehen** Ein Gespräch bietet sich bereits während der Planung an, insbesondere wenn Sie Fragen zu Rechtsform, Finanzierung oder den steuerlichen Aufgaben nach der Gründung haben.

**FAQ Muss mein Businessplan bereits fertig sein** Sie können sich auch mit einem ersten Konzept an uns wenden. Teilen Sie uns bei Ihrer Anfrage mit, wie weit Ihre Planung ist und wobei Sie Unterstützung wünschen.

**FAQ Was kostet die Beratung** Die Vergütung hängt vom vereinbarten Leistungsumfang ab. Fragen zur Abrechnung klären wir vor der Beauftragung der jeweiligen Beratungsleistung.

**Abschluss und Button** Besprechen wir die nächsten Schritte für Ihre Gründung.  |  Gründungsberatung anfragen

Buttonziel /kontakt?anliegen=gruendung. Im Haupttext „laufende Buchhaltung“ auf /leistungen/finanzbuchhaltung verlinken. Fachlichen Ansprechpartner nur nach Freigabe mit Name und Team-Link ergänzen. FAQ-Antworten und Schema aus derselben Datenquelle erzeugen.

**Abnahme** Die Seite beantwortet Eignung, Unterstützung, Vorbereitung, Ablauf und Abrechnung. Karsten bestätigt den beschriebenen Prozess und Umfang; alle Aussagen entsprechen dem tatsächlichen Angebot.

## 5 Nachfolgeberatung konkret beschreiben

**P1  Ort** /leistungen/nachfolgeberatung  |  Prozess und Umfang durch Karsten bestätigen

**H1** Unternehmensnachfolge in Schwalmstadt vorbereiten

**Einstieg** Sie möchten die Übergabe Ihres Unternehmens vorbereiten und die steuerlichen und wirtschaftlichen Fragen frühzeitig klären? Wir unterstützen Sie dabei, Ihre Ausgangslage zu strukturieren und die nächsten Schritte für die Nachfolge zu planen.

**H2 Für wen die Beratung geeignet ist** Die Beratung richtet sich an Unternehmerinnen und Unternehmer, die über eine Übergabe innerhalb der Familie oder an andere Nachfolger nachdenken. Teilen Sie uns mit, welche Ziele Sie verfolgen, welcher Zeitraum vorgesehen ist und welche Überlegungen bereits bestehen.

**H2 Welche Fragen wir gemeinsam klären** Im Mittelpunkt stehen die wirtschaftliche Situation Ihres Unternehmens, die steuerlichen Auswirkungen möglicher Schritte und Ihre persönlichen Ziele für die Übergabe. Wir besprechen, welche Informationen für die weitere Planung erforderlich sind und welche Beratungsleistungen zu Ihrem Vorhaben passen.

**H2 So bereiten Sie das erste Gespräch vor** Hilfreich sind eine kurze Beschreibung des Unternehmens, der gewünschten Nachfolgelösung und des geplanten Zeitrahmens. Bereits vorhandene Jahresabschlüsse, Auswertungen oder Planungen können wir nach Abstimmung einbeziehen. Welche Unterlagen wir tatsächlich benötigen, klären wir vorab mit Ihnen.

**H2 Aus Überlegungen werden nächste Schritte** Zunächst besprechen wir Ihre Ziele und den aktuellen Stand. Anschließend vereinbaren wir den Beratungsumfang und die nächsten Aufgaben. Soweit weitere fachliche Beteiligte erforderlich sind, stimmen wir die Schnittstellen im Rahmen des vereinbarten Auftrags ab.

**FAQ Ist eine Beratung auch ohne feststehenden Nachfolger sinnvoll** Ja, eine frühe Bestandsaufnahme kann helfen, offene Fragen zu ordnen. Welche konkreten Leistungen sinnvoll sind, hängt von Ihrer Ausgangslage und Ihren Zielen ab.

**FAQ Übernehmen Sie auch die rechtliche Vertragsgestaltung** Im Erstgespräch klären wir den steuerlichen und wirtschaftlichen Beratungsumfang. Für zusätzliche rechtliche Aufgaben stimmen wir mit Ihnen ab, welche weiteren Fachleute erforderlich sind. [Berufsrechtliche Abgrenzung vor Veröffentlichung freigeben.]

**FAQ Welche Kosten entstehen** Wir besprechen die Vergütung auf Basis der vereinbarten Beratungsleistungen. Teilen Sie uns zunächst mit, welche Fragen und Planungsschritte bei Ihnen anstehen.

**Abschluss und Button** Klären Sie die offenen Fragen Ihrer Unternehmensübergabe.  |  Nachfolgeberatung anfragen

Buttonziel /kontakt?anliegen=nachfolge. Verwandte Leistungen „betriebswirtschaftliche Beratung“ und „Jahresabschlüsse“ im Kontext verlinken. Aussagen zu Bewertung, Käufersuche, Notarleistungen oder Spezialzertifizierungen erst ergänzen, wenn diese Leistungen und Nachweise bestätigt sind.

**Abnahme** Interessenten erkennen, welche Unterstützung angeboten wird und welche Angaben sie für die Anfrage benötigen. Die Seite vermeidet Ergebnisversprechen wie garantierte Steuerersparnisse.

## 6 Finanzbuchhaltung als laufende Leistung

**P1  Ort** /leistungen/finanzbuchhaltung  |  Digitale Abläufe erst nach Bestätigung benennen

**H1** Finanzbuchhaltung für Unternehmen in Schwalmstadt

**Einstieg** Sie möchten Ihre laufende Buchhaltung verlässlich organisieren und wirtschaftliche Entwicklungen besser überblicken? Wir unterstützen Unternehmen und Selbstständige bei der Finanzbuchhaltung. Den Leistungsumfang und die Zusammenarbeit stimmen wir auf Ihren Betrieb ab.

**H2 Was wir gemeinsam organisieren** Wir besprechen, welche Buchhaltungsaufgaben Sie abgeben möchten, wie Sie Ihre Belege bereitstellen und welche Auswertungen Sie benötigen. Auf dieser Grundlage vereinbaren wir Zuständigkeiten, Unterlagen und wiederkehrende Abläufe.

**H2 Belege und Rückfragen klar abstimmen** Damit die Zusammenarbeit im Alltag funktioniert, klären wir den Weg Ihrer Unterlagen und die Ansprechpartner für Rückfragen. Welche digitalen Übermittlungswege und Anwendungen wir dafür einsetzen, erfahren Sie im Gespräch.

**H2 Einstieg in die Zusammenarbeit** Nennen Sie uns bei Ihrer Anfrage die Art Ihres Unternehmens und die Aufgaben, bei denen Sie Unterstützung suchen. Wir besprechen Ihren bisherigen Ablauf, den gewünschten Start und die Unterlagen für eine mögliche Übernahme.

**H2 Buchhaltung und weitere Aufgaben verbinden** Wenn Sie zusätzlich Unterstützung beim Jahresabschluss oder bei der Lohnbuchhaltung benötigen, können wir die Aufgaben im Zusammenhang besprechen. So lassen sich Zuständigkeiten und Übergaben frühzeitig abstimmen.

**FAQ Kann ich Belege digital bereitstellen** Die geeigneten Übermittlungswege stimmen wir mit Ihnen ab. Beschreiben Sie uns bei Ihrer Anfrage, welche Anwendungen und Abläufe Sie bereits nutzen. [Nach Bestätigung konkrete Systeme und Wege ergänzen.]

**FAQ Kann ich von einer anderen Kanzlei wechseln** Sprechen Sie uns auf Ihren gewünschten Wechselzeitpunkt an. Wir prüfen die mögliche Übernahme und stimmen mit Ihnen ab, welche Informationen und Unterlagen erforderlich sind.

**FAQ Wovon hängt die Vergütung ab** Die Vergütung richtet sich nach den vereinbarten Leistungen und den maßgeblichen Abrechnungsgrundlagen. Den konkreten Umfang und die Abrechnung klären wir vor der Beauftragung.

**Abschluss und Button** Besprechen wir, welche Buchhaltungsaufgaben Sie abgeben möchten.  |  Buchhaltung anfragen

Buttonziel /kontakt?anliegen=buchhaltung. „Jahresabschluss“ und „Lohnbuchhaltung“ auf die passenden Detailseiten verlinken. Nach Freigabe einen konkreten digitalen Ablauf ergänzen: tatsächlicher Belegweg, Ansprechpartner, Takt und Rückfragenkanal. Softwaremarken nur nennen, wenn die Kanzlei sie tatsächlich anbietet.

**Abnahme** Die Seite beschreibt einen nachvollziehbaren Einstieg. Sie enthält bestätigte Angaben zum Arbeitsprozess und verspricht weder bestimmte Einsparungen noch einen unbelegten Automatisierungsgrad.

## 7 Weitere Leistungsseiten überarbeiten

Die folgenden Blöcke ersetzen die allgemeinen Einstiege und ergänzen die bestehenden Leistungslisten. Je Seite anschließend zwei bis drei tatsächlich häufige Fragen, den passenden Ansprechpartner und einen eindeutigen Anfragebutton ergänzen. Fachliche Freigabe durch die Kanzlei einholen.

### Coaching

**H1** Unternehmerisches Coaching in Schwalmstadt

**Text** Sie möchten eine unternehmerische Entscheidung vorbereiten oder Ihre nächsten Entwicklungsschritte ordnen? Im Coaching besprechen wir Ihre Ziele, die aktuelle Situation und die Fragen, die Sie weiterbringen möchten. Gemeinsam strukturieren wir Handlungsoptionen und vereinbaren die nächsten Schritte. Schildern Sie uns bei Ihrer Anfrage, welches Thema Sie bearbeiten möchten und was Sie sich von der Begleitung wünschen.

**FAQ und CTA** Welche Themen eignen sich für das Coaching? Wie wird der Umfang vereinbart?  |  Coaching anfragen  |  /kontakt?anliegen=coaching

### Betriebswirtschaftliche Beratung

**H1** Betriebswirtschaftliche Beratung in Schwalmstadt

**Text** Sie möchten wirtschaftliche Entscheidungen auf eine nachvollziehbare Grundlage stellen? Wir besprechen mit Ihnen die betriebswirtschaftlichen Fragen Ihres Unternehmens und die verfügbaren Zahlen. Je nach Auftrag unterstützen wir Sie bei der Einordnung Ihrer Situation und bei der Vorbereitung weiterer Planungsschritte. Bringen Sie Ihre konkrete Fragestellung und vorhandene Auswertungen mit. Den erforderlichen Umfang und die nächsten Aufgaben stimmen wir gemeinsam ab.

**FAQ und CTA** Welche Auswertungen sind für das Erstgespräch hilfreich? Welche Planungsfragen begleiten Sie?  |  Betriebswirtschaftliche Beratung anfragen  |  /kontakt?anliegen=bwl

### Jahresabschlüsse

**H1** Jahresabschlüsse für Unternehmen in Schwalmstadt

**Text** Der Jahresabschluss führt die wirtschaftlichen Ergebnisse Ihres Unternehmens zusammen und erfüllt die für Ihr Unternehmen geltenden Anforderungen. Wir unterstützen Sie bei der Erstellung und besprechen den vereinbarten Leistungsumfang. Für die Vorbereitung klären wir, welche Unterlagen vorliegen, welche Informationen ergänzt werden müssen und wie die Abstimmung mit Ihrer laufenden Buchhaltung erfolgt. Nennen Sie bei Ihrer Anfrage die Rechtsform und das betreffende Geschäftsjahr.

**FAQ und CTA** Welche Unterlagen benötigen Sie? Wie läuft die Abstimmung mit der Buchhaltung ab?  |  Jahresabschluss anfragen  |  /kontakt?anliegen=jahresabschluss

**Abnahme** Jede Seite beschreibt ein eigenes Anliegen. Die Kanzlei beantwortet die hier genannten FAQ-Fragen schriftlich; anschließend Antworten sichtbar veröffentlichen. Die vorhandenen Leistungslisten bleiben fachlich geprüft erhalten.

## 8 Lohnberatung und Steuerleistungen schärfen

### Lohnbuchhaltung

**H1** Lohnbuchhaltung für Arbeitgeber in Schwalmstadt

**Text** Sie möchten die Lohn- und Gehaltsabrechnung Ihres Betriebs abgeben oder Ihre bisherigen Abläufe neu organisieren? Wir besprechen mit Ihnen den erforderlichen Leistungsumfang und die Zusammenarbeit. Dazu stimmen wir ab, welche Angaben und Änderungen Sie bereitstellen, wer Rückfragen klärt und welche Termine für Ihren Betrieb gelten. Teilen Sie uns bei Ihrer Anfrage die ungefähre Mitarbeiterzahl und den gewünschten Start mit.

**FAQ und CTA** Welche Angaben brauchen Sie für die Übernahme? Wie teile ich Änderungen bei Mitarbeitern mit?  |  Lohnbuchhaltung anfragen  |  /kontakt?anliegen=lohn

### Steuerberatung

**H1** Steuerliche Fragen in Schwalmstadt klären

**Text** Eine unternehmerische oder private Entscheidung wirft steuerliche Fragen auf? Beschreiben Sie uns Ihre Ausgangslage und die Entscheidung, die Sie vorbereiten möchten. Wir klären, welche Informationen erforderlich sind und welcher Beratungsumfang zu Ihrem Anliegen passt. So erhalten Sie eine nachvollziehbare Grundlage für die weiteren Schritte. Die Beratung und Vergütung stimmen wir vor der Beauftragung mit Ihnen ab.

**FAQ und CTA** Welche Angaben sind für die erste Anfrage hilfreich? Wer bearbeitet mein Thema?  |  Steuerberatung anfragen  |  /kontakt?anliegen=steuerberatung

### Steuererklärungen

**H1** Steuererklärungen in Schwalmstadt erstellen lassen

**Text** Wir erstellen Steuererklärungen für Privatpersonen, Vereine und Unternehmen. Teilen Sie uns mit, um welche Erklärung und welches Jahr es geht. Anschließend klären wir den Leistungsumfang und die erforderlichen Unterlagen. Unser Angebot umfasst die auf dieser Seite aufgeführten Erklärungsarten; besondere Sachverhalte besprechen wir im Einzelfall mit Ihnen.

**Absatz unter der bestehenden Liste** Welche Nachweise erforderlich sind, hängt von Ihrer persönlichen oder betrieblichen Situation ab. Für die erste Anfrage genügt eine kurze Beschreibung. Den sicheren Weg für die Übermittlung Ihrer Unterlagen stimmen wir anschließend ab.

**FAQ und CTA** Übernehmen Sie meine Erklärungsart? Welche Unterlagen soll ich vorbereiten? Wie wird die Vergütung geklärt?  |  Steuererklärung anfragen  |  /kontakt?anliegen=steuererklaerung

Je FAQ eine kurze direkte Antwort der Kanzlei einholen und einbauen. Allgemeine steuerliche Fristen, Sparversprechen und pauschale Pflichtangaben vermeiden. Fachliche Aktualisierungen mit Prüfer und Datum dokumentieren, wenn inhaltliche Steuerhinweise hinzukommen.

**Abnahme** Alle neun Leistungen besitzen eigene verständliche Einstiege, konkrete Vorbereitungshinweise und einen zur Anfrage passenden CTA. Inhaltliche Überschneidungen werden durch Verlinkung statt durch kopierte Absätze gelöst.

## 9 Seitentitel und Beschreibungen setzen

Pro Seite genau einen individuellen Title und eine Beschreibung ausgeben. Canonical, og:url und Sitemap konsistent halten. Titel dienen der Orientierung; Suchmaschinen können andere Ausschnitte wählen. Die folgenden Angaben ersetzen die derzeitigen allgemeinen Metadaten.

| Pfad | Title | Meta Description |
| --- | --- | --- |
| / | Steuerberater in Schwalmstadt \| Kanzlei Karsten Walz | Steuerberatung für Unternehmen, Selbstständige, Privatpersonen und Vereine in Schwalmstadt. Leistungen kennenlernen und Erstgespräch anfragen. |
| /leistungen | Steuerberatung und Leistungen \| Karsten Walz Schwalmstadt | Von Gründung und Nachfolge bis zu Buchhaltung, Jahresabschluss und Steuererklärung: Finden Sie die passende Leistung der Kanzlei Karsten Walz. |
| /leistungen/existenzgruendung | Existenzgründungsberatung Schwalmstadt \| Karsten Walz | Gründung vorbereiten: Geschäftskonzept, Businessplan, Finanzplanung und Rechtsform besprechen. Existenzgründungsberatung in Schwalmstadt anfragen. |
| /leistungen/nachfolgeberatung | Unternehmensnachfolge Schwalmstadt \| Karsten Walz | Unternehmensübergabe vorbereiten und steuerliche sowie wirtschaftliche Fragen ordnen. Nachfolgeberatung in Schwalmstadt kennenlernen. |
| /leistungen/finanzbuchhaltung | Finanzbuchhaltung in Schwalmstadt \| Karsten Walz | Buchhaltung für Unternehmen und Selbstständige in Schwalmstadt. Leistungsumfang, Belegwege und Einstieg in die Zusammenarbeit besprechen. |
| /leistungen/lohnbuchhaltung | Lohnbuchhaltung in Schwalmstadt \| Karsten Walz | Unterstützung bei der Lohn- und Gehaltsabrechnung Ihres Betriebs. Leistungen und Zusammenarbeit in Schwalmstadt kennenlernen und anfragen. |
| /leistungen/jahresabschluesse | Jahresabschluss in Schwalmstadt \| Karsten Walz | Jahresabschluss für Ihr Unternehmen vorbereiten. Unterlagen, Leistungsumfang und Abstimmung mit der Buchhaltung bei Karsten Walz in Schwalmstadt klären. |
| /leistungen/steuerberatung | Steuerberatung in Schwalmstadt \| Karsten Walz | Steuerliche Fragen zu privaten und unternehmerischen Entscheidungen besprechen. Anliegen schildern und Beratung in Schwalmstadt anfragen. |
| /leistungen/steuererklaerungen | Steuererklärung in Schwalmstadt \| Karsten Walz | Steuererklärungen für Privatpersonen, Vereine und Unternehmen. Erklärungsarten kennenlernen und Unterstützung in Schwalmstadt anfragen. |

**Abnahme** Title und Description stehen im ausgelieferten HTML. Eine Stichprobe mit und ohne JavaScript zeigt dieselben Kerninformationen. Keine automatisch angehängte lange Keywordliste.

## 10 Metadaten und Kanzleiinformationen ergänzen

| Pfad | Title | Meta Description |
| --- | --- | --- |
| /leistungen/coaching | Unternehmerisches Coaching \| Karsten Walz Schwalmstadt | Unternehmerische Ziele und Entscheidungen strukturiert besprechen. Coaching-Angebot der Kanzlei Karsten Walz in Schwalmstadt kennenlernen. |
| /leistungen/betriebswirtschaftliche-beratung | BWL Beratung in Schwalmstadt \| Karsten Walz | Wirtschaftliche Fragen und Unternehmenszahlen einordnen. Betriebswirtschaftliche Beratung der Kanzlei Karsten Walz in Schwalmstadt anfragen. |
| /kanzlei | Über die Kanzlei \| Karsten Walz Steuerberater Schwalmstadt | Lernen Sie die Kanzlei Karsten Walz in Schwalmstadt kennen: Ansprechpartner, fachliche Aufgaben und Einstieg in die Zusammenarbeit. |
| /team | Team und Ansprechpartner \| Kanzlei Karsten Walz | Ihre Ansprechpartner bei der Kanzlei Karsten Walz in Schwalmstadt. Lernen Sie Qualifikationen und Aufgabenbereiche unseres Teams kennen. |
| /karriere | Karriere in Schwalmstadt \| Kanzlei Karsten Walz | Arbeiten bei der Kanzlei Karsten Walz in Schwalmstadt. Team und Arbeitsumfeld kennenlernen und Kontakt zu Ihren beruflichen Möglichkeiten aufnehmen. |
| /kontakt | Erstgespräch anfragen \| Karsten Walz Schwalmstadt | Anfrage an die Kanzlei Karsten Walz: Kontaktformular, Telefon, E-Mail, Adresse und Öffnungszeiten in Schwalmstadt. Schildern Sie uns Ihr Anliegen. |
| /impressum | Impressum \| Kanzlei Karsten Walz | Anbieterinformationen und berufsrechtliche Angaben der Kanzlei Karsten Walz in Schwalmstadt. |
| /datenschutz | Datenschutz \| Kanzlei Karsten Walz | Informationen zum Datenschutz bei der Nutzung der Website und der Kontaktaufnahme mit der Kanzlei Karsten Walz. |

### Kanzleiseite und Team

**Zusatz auf /kanzlei** Sie möchten wissen, ob wir der passende Ansprechpartner für Ihr Anliegen sind? Sehen Sie sich unsere Leistungen an oder schildern Sie uns Ihre Frage. Vor einer Beauftragung klären wir mit Ihnen den gewünschten Umfang und die nächsten Schritte.

Auf /team Qualifikationen und Zuständigkeiten aktuell halten. Auf den drei Schwerpunktseiten den tatsächlich zuständigen Ansprechpartner mit Foto und Link zum Team nennen. Name und Aufgabe sachlich benennen; Spezialistenstatus nur bei belastbarer Grundlage verwenden.

**Abnahme** Die Kanzlei bestätigt Berufsbezeichnungen und Zuständigkeiten. Impressum und Datenschutz vor Launch auf tatsächlichen Betrieb, Formulardienst, Hosting, Chat und eingesetzte Messwerkzeuge abstimmen lassen. Die Metadaten ersetzen diese fachliche Prüfung nicht.

## 11 ASO und lokale Sichtbarkeit ausbauen

**P1  Ziel** Suchagenten sollen die Kanzlei identifizieren, ihre Eignung beurteilen und den Anfrageweg zuverlässig nennen können.

### Strukturierte Daten sinnvoll erweitern

AccountingService mit stabiler @id behalten. Bestätigte offizielle Profile über sameAs verknüpfen. Standortangaben und Öffnungszeiten aus dem zentralen Datenobjekt erzeugen. Service jeweils mit provider auf dieselbe Kanzlei verweisen lassen. BreadcrumbList passend zur sichtbaren Navigation ergänzen. WebSite und WebPage können die Zuordnung vervollständigen; der Nutzen liegt in konsistenten Entitäten, nicht in der Menge der Typen.

Beispiel zusätzlicher Angaben im bestehenden Kanzleiknoten

```text
"sameAs": [
 "https://www.facebook.com/Kanzlei.Karsten.Walz.Steuerberater/",
 "https://www.linkedin.com/in/karsten-walz-b74a02111/",
 "https://www.instagram.com/kanzlei_karsten_walz"
]
Profilzuordnung und Aktualität vor Übernahme bestätigen.
```

FAQ-Daten nur aus tatsächlich sichtbaren Fragen und Antworten erzeugen. Bewertungen, Auszeichnungen und Leistungsversprechen nur mit überprüfbarer Grundlage veröffentlichen. Aus eigener Kanzleibewertung keine Rich-Result-Sterne ableiten.

### Google Unternehmensprofil bearbeiten

Inhaberschaft, tatsächlichen Unternehmensnamen, Adresse, Telefonnummer, Hauptkategorie, Zusatzkategorien, Leistungen und Öffnungszeiten prüfen. Sonderöffnungszeiten pflegen. Aktuelle echte Fotos ergänzen. Verlinkte Website nach Launch prüfen. Bestehende Branchenverzeichnisse auf dieselben Stammdaten abgleichen.

**Beschreibungsvorschlag** Die Kanzlei Karsten Walz in Schwalmstadt unterstützt Unternehmen, Selbstständige, Privatpersonen und Vereine bei steuerlichen und wirtschaftlichen Fragen. Zu den Leistungen gehören Steuererklärungen, Finanzbuchhaltung, Lohnbuchhaltung und Jahresabschlüsse sowie Existenzgründungsberatung, Nachfolgeberatung und unternehmerisches Coaching. Schildern Sie uns Ihr Anliegen telefonisch oder über das Kontaktformular, damit wir die mögliche Zusammenarbeit besprechen können.

### Nachweise und Erreichbarkeit

Karsten bestätigt, welche digitalen Belegwege, Gesprächstermine und Zielgruppen tatsächlich angeboten werden. Diese Informationen sichtbar auf den passenden Seiten einbauen. Googlebot und gewünschte Suchcrawler in robots.txt und Hosting-Regeln zulassen; Trainingseinstellungen getrennt entscheiden. llms.txt aus denselben Daten aktualisieren, jedoch den HTML-Inhalt als maßgebliche Quelle behandeln.

**Abnahme** Schema und sichtbarer Text stimmen überein. Testagenten können Adresse, Leistungen, Kontakt und Erstgespräch korrekt belegen. Aussagen über digitale Abläufe oder Mandatsaufnahme entsprechen freigegebenen Informationen.

## 12 Gestaltung und Zugänglichkeit verbessern

### Konkrete Gestaltungsschritte

Das Stempelbild im Hero kann als Gestaltungselement bleiben. Für den Kanzleibereich ein authentisches Foto verwenden. Bei schmalen Ansichten den Bildausschnitt so wählen, dass der Text vollständig lesbar bleibt. Überschriften sollen durch responsive Typografie umbrechen; insbesondere lange Leistungsnamen bei 320 CSS-Pixeln prüfen.

Die Hauptaktion pro Bereich sichtbar priorisieren. Telefon, E-Mail, Formular und Chat behalten klare Rollen: Formular für konkrete Anfragen, Telefon für direkten Kontakt, Chat für Orientierung. Mobil prüfen, ob der schwebende Chatbutton Absenden, Fehlermeldungen oder andere Bedienelemente überdeckt.

### Bewegung und Inhalte

Scroll-Reveals dürfen die Erfassung von Texten und Links nicht verhindern. Mit deaktiviertem JavaScript prüfen, ob alle Kerninhalte sichtbar und alle Kontaktwege bedienbar bleiben. Animationen bei prefers-reduced-motion reduzieren oder vollständig überspringen. Die Darstellung muss auch dann vollständig sein, wenn ein Observer oder Animationsskript ausfällt.

Prinzip für progressive Animation

```css
/* Standardzustand bleibt sichtbar. */
.reveal { opacity: 1; transform: none; }
/* Verbergen erst nach erfolgreicher JS-Initialisierung. */
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1 !important; transform: none !important; }
}
```

### Manuelle Barrierefreiheit abnehmen

Alle Wege nur mit Tab, Umschalt+Tab, Enter und Escape bedienen. Fokus sichtbar halten. Menüzustand über aria-expanded ausgeben. Chatdialog bei Öffnung fokussieren, Escape unterstützen und Fokus beim Schließen zurückgeben. Geschlossene Bereiche aus Tastatur- und Screenreader-Navigation entfernen. Honeypot-Feld vor assistiven Technologien verbergen.

Formularlabels, Feldfehler, Statusmeldungen, 200-Prozent-Zoom und Umbruch bei 320 CSS-Pixeln prüfen. Sinntragende Bilder erhalten passenden Alternativtext; rein dekorative Bilder alt="". Kontrast für normalen Text mindestens 4,5:1, für großen Text und wichtige Bediengrafik mindestens 3:1 prüfen. Reale Safari- und Screenreader-Tests ergänzen den automatischen Score.

**Abnahme** Alle Kernaufgaben funktionieren per Tastatur und auf einem echten iPhone. Reduzierte Bewegung und Skriptausfall lassen die Kerninhalte erreichbar. Lighthouse A11y bleibt 100; die manuelle Prüfliste ist ebenfalls bestanden.

## 13 Performance gezielt abrunden

Die Startseite erreicht im gemessenen Lauf 98 mobil und 100 Desktop. Mobil: FCP 1,3 s, LCP 1,4 s, TBT 0 ms, CLS 0 und Speed Index 3,9 s. Die folgenden Arbeiten dienen der Stabilität und Wiederbesuchsleistung; sie sind nach den geschäftlich wichtigeren Inhaltsaufgaben einzuplanen.

### P2 Browsercache für versionierte Dateien

Die geprüften CSS-, JavaScript- und Bilddateien tragen Hashes im Pfad, senden jedoch max-age=0, must-revalidate. Ausschließlich Dateien mit verlässlich wechselndem Hash bei Inhaltsänderung langfristig cachen. Die konkrete Hosting-Konfiguration prüfen; Dateien ohne Versionierung wie /fonts/open-sans-latin.woff2 erst umbenennen oder über den Asset-Build versionieren.

Beispiel vercel.json – nur für unveränderliche Build-Assets

```json
{
 "headers": [{
  "source": "/_astro/:path*",
  "headers": [{"key": "Cache-Control",
   "value": "public, max-age=31536000, immutable"}]
 }]
}
```

HTML, API, robots.txt und Sitemap separat behandeln.

### P2 Animationen und JavaScript

Lighthouse meldet etwa 23–24 KiB ungenutztes JavaScript, erzwungene Layoutberechnungen und nicht kompositierte Animationen. Mit einem Performance-Trace die verursachenden Elemente bestimmen. Animationen vorzugsweise über transform und opacity ausführen. DOM-Messungen vor Schreibzugriffen bündeln; Layout-Abfragen in Scroll-Schleifen reduzieren. Chat und große optionale Module erst bei Bedarf laden, sofern dies die Erreichbarkeit erhält.

### P2 Renderblockierung und Bildpriorität

Mobil zeigt der Bericht rund 300 ms geschätztes Potenzial bei renderblockierenden Ressourcen. Stylesheet und Font-Ladekette im Wasserfall prüfen. Bestehende lokale WOFF2-Schrift, responsive Bilder und fetchpriority=high am Hero erhalten. Critical CSS nur einführen, wenn eine Wiederholungsmessung einen echten Gewinn zeigt und weder Darstellung noch Cacheverhalten verschlechtert werden.

Das Hero-Bild mit passender Mobilauflösung testen; keine pauschale Formatumstellung erzwingen. Die geprüfte 640-Pixel-Variante liegt bei rund 12 KB, die 1280-Pixel-Variante bei rund 33 KB. Bildqualität und tatsächlich geladene Auflösung zusammen bewerten.

**Abnahme** Je drei Kaltstarts auf vier repräsentativen Seiten messen. Median mobil ≥98 und Desktop ≥99; 100 ist das Stretch-Ziel. LCP im Labor ≤2,5 s, CLS ≤0,1 und TBT möglichst ≤100 ms. INP später aus Nutzermessung bewerten. Ein Punktgewinn rechtfertigt keine funktionale Verschlechterung.

## 14 Messung und Nutzertests einrichten

### Ereignisse und Geschäftsergebnis

| Ereignis | Auslöser | Wertung |
| --- | --- | --- |
| contact_cta_click | Klick auf Hauptaktion; Quellseite und Anliegen | Kontaktabsicht |
| form_start | Erste echte Eingabe; pro Besuch deduplizieren | Begonnene Anfrage |
| form_submit_success | API bestätigt Annahme | Übermittelte Anfrage |
| form_submit_error | API- oder Verbindungsfehler | Technisches Hindernis |
| phone_click / email_click | Klick auf tel: oder mailto: | Kontaktabsicht, kein Abschluss |
| qualified_inquiry | Kanzlei bewertet eingegangene Anfrage | Primäre geschäftliche Zielgröße |
| new_mandate | Tatsächliche Beauftragung | Nachgelagertes Ergebnis |

Freitext, Name, E-Mail und Steuerdaten bleiben außerhalb der Webanalyse. Herkunftskanal, Einstiegsseite und festes Anliegen reichen für die Auswertung. Analysewerkzeug und gegebenenfalls Einwilligung vor Einbindung abstimmen. Testzugriffe und Spam kennzeichnen.

Formularabschlussquote = erfolgreiche Anfragen / Formularstarts

```text
Qualifizierte Anfragerate = qualifizierte Anfragen / relevante Besuche
Mandatsquote = neue Mandate / qualifizierte Anfragen
Quellen und Betrachtungszeitraum je Auswertung konstant halten.
```

### Fünf Nutzertests durchführen

Zwei Unternehmer, einen Gründer, eine Privatperson und eine Person mit geringer Webroutine einbeziehen. Je 15–20 Minuten, auf deren üblichen Geräten. Ohne Vorführung diese Aufgaben stellen: „Finde heraus, ob die Kanzlei zu deinem Anliegen passt.“ „Welche Informationen brauchst du für die Anfrage?“ „Bereite eine Anfrage vor.“ Absenden ausschließlich an ein Testpostfach.

Erfassen: Aufgabenerfolg, Zeit bis zur richtigen Leistung, Rückfragen, Fehlwege und Verständnis des nächsten Schritts. Ziel: alle fünf erreichen den passenden Anfrageweg; mindestens vier können Angebot und nächsten Schritt korrekt erklären. Einzelne Schwierigkeiten durch konkrete Änderungen beheben und erneut prüfen.

### Nach dem Launch

Erste 6–8 Wochen als Ausgangsphase nach Herkunft und Gerät auswerten. Bei wenig Traffic qualitative Tests priorisieren. A/B-Tests erst mit ausreichender Stichprobe und vorab festgelegter Hauptmetrik beginnen. Eine Änderung pro Hypothese; Umfang und Laufzeit anhand des gemessenen Ausgangswerts planen.

**Abnahme** Ein kompletter Testweg ist von Quelle über Formular bis Testpostfach nachvollziehbar. Kontaktklicks und qualifizierte Anfragen bleiben getrennt. Ein wöchentlicher Kurzbericht nennt Fallzahlen, Fehler und nächste Verbesserung.

## 15 Funktion und agentische Suche testen

| Test | Durchführung | Bestanden wenn |
| --- | --- | --- |
| Geräte und Darstellung | iPhone Safari, Android Chrome, Desktop Chrome und Firefox; 320/390/768/1440 CSS-Pixel | Inhalte lesbar; Menü, CTA und Formular vollständig bedienbar |
| Formular | Gültige Testdaten, leere Pflichtfelder, ungültige Mail, langer Text, Serverfehler, doppelter Klick | Klare Fehler; Eingaben bleiben erhalten; genau eine gültige Zustellung |
| Tastatur und Assistenz | Tabreihenfolge, Menü, Chat, Fokus, VoiceOver oder NVDA | Aufgaben ohne Zeiger möglich; Status und Dialoge verständlich |
| Indexierung und Migration | Alte URL-Liste, Statuscodes, Canonicals, Sitemap, Produktionsheader | Passende permanente Ziele; wichtige neue URLs 200 und indexierbar |
| Robustheit | JS aus, reduzierte Bewegung, langsames Netz, Rücknavigation | Kerninhalte und Kontaktwege bleiben verfügbar |
| Leistung | Drei Läufe je Seite; Start, Gründung, Kontakt, Team | Median im Zielbereich; keine neue Layoutverschiebung |

### ASO Benchmark mit festen Suchaufgaben

Erst nach Launch und überprüfter Indexierung bewerten. Zwölf Suchaufgaben in ChatGPT-Suche, Google-KI-Suche und einem weiteren relevanten Suchsystem testen. Je drei frische Sitzungen pro System, Ort und Wortlaut festhalten. Suchfunktionen aktiv verwenden. Datum, System, Antwort, Nennung, verlinkte Quelle und Sachfehler dokumentieren. Das sind 108 Beobachtungen pro Messrunde; Unterschiede bleiben explorativ.

Suchaufgaben: 1. Steuerberater in Schwalmstadt für eine Gründung finden. 2. Kanzlei für laufende Buchhaltung vergleichen. 3. Unterstützung bei Unternehmensnachfolge suchen. 4. Steuererklärung als Privatperson anfragen. 5. Ansprechpartner der Kanzlei nennen. 6. Öffnungszeiten am Freitag bestimmen. 7. Weg zum Erstgespräch erklären. 8. Benötigte Gründungsunterlagen nennen. 9. Digitale Belegwege recherchieren. 10. Mandatsaufnahme prüfen. 11. Lohnbuchhaltung für einen kleinen Betrieb suchen. 12. Websitequellen für die angebotenen Leistungen belegen.

**Bewertung** Stammdaten müssen in allen aus der Website belegbaren Antworten korrekt sein. Unbestätigte Aussagen werden als Fehler erfasst. Nennungs- und Quellenquote dokumentieren und monatlich vergleichen; keine garantierte Sichtbarkeit ableiten. Aufgaben 9 und 10 erst als beantwortbar werten, wenn bestätigte Informationen veröffentlicht sind.

## 16 Abnahme und Freigabe

### Fachliche Qualitätsrubrik

Die bisherigen Einschätzungen für Gestaltung, Inhalt, ASO und Conversion waren Expertenurteile. Für die Umsetzung ersetzt diese Rubrik eine scheinpräzise Gesamtnote. Pro Kriterium 0 Punkte für offen, 1 für teilweise, 2 für vollständig geprüft vergeben. Je Bereich sind 10 Punkte erreichbar; das ist eine Projektabnahme, keine Ranking- oder Umsatzgarantie.

| Bereich | Fünf Kriterien mit jeweils zwei Punkten |
| --- | --- |
| Inhalt und SEO | Passender Suchzweck; konkrete Leistung; verständlicher Ablauf; fachlich bestätigte Antworten; passende interne Links und Metadaten |
| ASO | Eindeutige Identität; konsistente Stammdaten; belegbare Eignungsmerkmale; erreichbare Quellen; eindeutiger Anfrageweg |
| Conversion | Klares Anliegen; nachvollziehbarer Nutzen; passende Vertrauensbelege; erwartungskonformer CTA; gemessener funktionsfähiger Anfrageweg |
| Gestaltung und Usability | Lesbarkeit mobil; klare Hierarchie; konsistente Komponenten; passende reale Bilder; bestandene Aufgaben- und Tastaturtests |

### Release Checkliste

Freigabe Kanzlei: Öffnungszeiten und Mitarbeiterzahl bestätigt; Leistungstexte und Zuständigkeiten geprüft; Antwortprozess vereinbart; echte Fotos freigegeben; Impressum und Datenschutz auf den Betrieb abgestimmt.

Freigabe Entwicklung: Produktionsdomain und Vorschau getrennt; alte URLs geprüft; Canonicals und Sitemap korrekt; Schema und sichtbare Daten konsistent; Formularzustellung und Fehlerfälle getestet; aktuelle Lighthouse-Läufe archiviert; mobile und manuelle Zugänglichkeit bestanden.

Freigabe Messung: Ereignisse geprüft; Testzugriffe markiert; qualifizierte Anfrage definiert; Verantwortlicher in der Kanzlei benannt; erster Auswertungstermin nach 2 Wochen, Inhaltsprüfung nach 6–8 Wochen vereinbart.

### Messgrundlage und Quellen

Öffentlicher Website- und HTML-Abgleich vom 4. November 2026. Technische Messung der Startseite: Lighthouse 13.6.0, mobiler Kaltstart mit langsamer 4G-Simulation. Es liegen bislang keine ausreichenden Felddaten für diese Vorschau vor. Alle späteren Prüfergebnisse mit Datum und Deployment dokumentieren.

PageSpeed-Bericht: https://pagespeed.web.dev/analysis/https-walz-landing-vercel-app/15vblir6ni?form_factor=mobile

Core Web Vitals: https://web.dev/articles/vitals

Lighthouse-Scoring: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

Google KI-Suche: https://developers.google.com/search/docs/appearance/ai-features

Lokale Rankings: https://support.google.com/business/answer/7091

Migration: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
