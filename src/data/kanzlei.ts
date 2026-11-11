// Single source for the business facts that JSON-LD, llms.txt and the FAQ repeat.
import services from './services.json';

export const SITE = 'https://www.kanzlei-karstenwalz.de';

export const kanzlei = {
  name: 'Kanzlei Karsten Walz',
  description: 'Steuerberaterkanzlei in Schwalmstadt: Steuerberatung, Steuererklärungen, Buchhaltung, Jahresabschlüsse, Lohnbuchhaltung, Existenzgründungs- und Nachfolgeberatung.',
  street: 'Ziegenhainer Str. 3',
  postalCode: '34613',
  city: 'Schwalmstadt',
  region: 'Hessen',
  // OpenStreetMap building match for Ziegenhainer Str. 3 (checked 2026-11-05).
  geo: { latitude: 50.91244, longitude: 9.25263 },
  // Last content revision of the page texts; bump when texts change (schema dateModified).
  updated: '2026-11-05',
  phone: '06691 4271',
  phoneIntl: '+49 6691 4271',
  phoneHref: 'tel:+4966914271',
  email: 'info@kanzlei-karstenwalz.de',
  // Official profiles (schema sameAs and footer icons); Karsten confirms they are current.
  profiles: {
    facebook: 'https://www.facebook.com/Kanzlei.Karsten.Walz.Steuerberater/',
    linkedin: 'https://www.linkedin.com/in/karsten-walz-b74a02111/',
    instagram: 'https://www.instagram.com/kanzlei_karsten_walz',
  },
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], label: 'Mo – Do', slots: [['08:00', '12:30'], ['13:30', '17:00']] },
    { days: ['Friday'], label: 'Fr', slots: [['08:00', '13:30']] },
  ],
};

export const hoursText = kanzlei.hours
  .map((h) => `${h.label} ${h.slots.map(([a, b]) => `${a}–${b}`).join(' und ')} Uhr`)
  .join(', ');

export const faq = [
  {
    q: 'Wo befindet sich die Kanzlei Karsten Walz?',
    a: `In der ${kanzlei.street}, ${kanzlei.postalCode} ${kanzlei.city} (Hessen).`,
  },
  {
    q: 'Wann ist die Kanzlei erreichbar?',
    a: `Unsere Öffnungszeiten: ${hoursText}. Telefon ${kanzlei.phone}, E-Mail ${kanzlei.email}.`,
  },
  {
    q: 'Welche Leistungen bietet die Kanzlei an?',
    a: `${services.map((s) => s.title).join(', ')}.`,
  },
  {
    q: 'Für wen erstellen Sie Steuererklärungen?',
    a: 'Für Privatpersonen, Vereine und Unternehmen – von der Einkommen- und Umsatzsteuer über Gewerbe- und Körperschaftsteuer bis zur Erbschaft- und Schenkungsteuer.',
  },
  {
    q: 'Begleiten Sie auch Existenzgründungen?',
    a: 'Ja, die Existenzgründungsberatung ist ein Schwerpunkt der Kanzlei: Geschäftskonzept, Businessplan und Finanzplanung, Fördermittel und Finanzierung, Wahl der Rechtsform sowie Behördengänge und Anmeldungen.',
  },
  {
    q: 'Wie vereinbare ich einen Termin?',
    a: `Rufen Sie uns an (${kanzlei.phone}), schreiben Sie an ${kanzlei.email} oder nutzen Sie das Anfrageformular auf der Kontaktseite – wir melden uns zeitnah zurück.`,
  },
];
