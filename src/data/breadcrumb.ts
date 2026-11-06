import services from './services.json';

// Breadcrumb mirrors the visible navigation: Startseite > section > service.
// Shared by the JSON-LD (Layout) and the visible trail (PageHero) so both stay identical.
const LABELS: Record<string, string> = {
  leistungen: 'Leistungen', kanzlei: 'Kanzlei', team: 'Team', karriere: 'Karriere',
  kontakt: 'Kontakt', impressum: 'Impressum', datenschutz: 'Datenschutz',
  ...Object.fromEntries(services.map((s) => [s.slug, s.title])),
};

/** Trail for a path without trailing slash, or null for the home page and unknown paths (404). */
export const crumbsFor = (path: string) => {
  const segments = path.split('/').filter(Boolean);
  if (!segments.length || !segments.every((seg) => LABELS[seg])) return null;
  return [{ name: 'Startseite', path: '/' }, ...segments.map((seg, i) => ({
    name: LABELS[seg], path: `/${segments.slice(0, i + 1).join('/')}`,
  }))];
};
