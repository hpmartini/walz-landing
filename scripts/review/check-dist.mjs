#!/usr/bin/env node
// Static acceptance checks for issue #10 against the built site (dist/client).
// Usage: npm run build && node scripts/review/check-dist.mjs [distDir]
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] ?? 'dist/client';
const SITE = 'https://www.kanzlei-karstenwalz.de';
const src = (f) => readFileSync(f, 'utf8');

// Read the SEO table straight from source so the check cannot drift from it.
const seoSrc = src('src/data/seo.ts');
const SEO = Object.fromEntries([...seoSrc.matchAll(/'([^']+)': \{\s*title: '([^']+)',\s*description: '([^']+)'/g)].map((m) => [m[1], { title: m[2], description: m[3] }]));
const SERVICES = JSON.parse(src('src/data/services.json'));
const ANLIEGEN = { existenzgruendung: 'gruendung', nachfolgeberatung: 'nachfolge', finanzbuchhaltung: 'buchhaltung', lohnbuchhaltung: 'lohn', jahresabschluesse: 'jahresabschluss', steuererklaerungen: 'steuererklaerung', coaching: 'coaching', 'betriebswirtschaftliche-beratung': 'bwl', steuerberatung: 'steuerberatung' };

let failures = 0;
const results = {};
const check = (ac, ok, msg) => {
  (results[ac] ??= []).push(ok);
  if (!ok) { failures++; console.log(`FAIL ${ac}: ${msg}`); }
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const page = (path) => {
  const f = path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html');
  return existsSync(f) ? src(f) : null;
};
const attr = (html, re) => { const m = html.match(re); return m ? decode(m[1]) : null; };
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap((m) => JSON.parse(m[1])['@graph'] ?? []);
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/­|&shy;/g, '')).replace(/\s+/g, ' ');

const paths = Object.keys(SEO);
check('AC-8', paths.length === 17, `SEO table has ${paths.length} paths, expected 17`);
const sitemap = src(join(DIST, 'sitemap.xml'));

for (const path of paths) {
  const html = page(path);
  if (!html) { check('AC-8', false, `${path} not built`); continue; }
  const url = path === '/' ? `${SITE}/` : `${SITE}${path}`;
  const t = attr(html, /<title>(.*?)<\/title>/s);
  check('AC-8', t === SEO[path].title, `${path} title "${t}"`);
  check('AC-8', attr(html, /<meta name="description" content="([^"]*)"/) === SEO[path].description, `${path} description`);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  check('AC-8', canonical === url, `${path} canonical ${canonical}`);
  check('AC-8', attr(html, /<meta property="og:url" content="([^"]*)"/) === canonical, `${path} og:url != canonical`);
  check('AC-8', sitemap.includes(`<loc>${url}</loc>`), `${path} missing in sitemap as ${url}`);

  // AC-1: hours everywhere from kanzlei.ts (Friday 13:30), no head count.
  const body = text(html);
  check('AC-1', !/13:00 Uhr/.test(body), `${path} shows 13:00`);
  check('AC-1', !/14 Mitarbeiter/.test(body), `${path} shows 14 Mitarbeiter`);
  if (/Öffnungszeiten/.test(body) && /Fr /.test(body)) check('AC-1', /Fr 08:00 – 13:30 Uhr/.test(body), `${path} Friday hours`);

  // AC-9: structured data.
  const graph = jsonLd(html);
  const biz = graph.find((n) => n['@type'] === 'AccountingService');
  check('AC-9', biz?.['@id'] === `${SITE}/#kanzlei`, `${path} business @id`);
  check('AC-9', biz?.sameAs?.length === 3, `${path} sameAs`);
  check('AC-9', biz?.openingHoursSpecification?.some((o) => o.dayOfWeek.includes('Friday') && o.closes === '13:30'), `${path} Friday closes`);
  check('AC-9', !JSON.stringify(graph).includes('aggregateRating') && !JSON.stringify(graph).includes('"Review"'), `${path} rating markup`);
  const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList');
  if (path !== '/') check('AC-9', crumbs?.itemListElement?.at(-1)?.item === url, `${path} breadcrumb`);
  for (const faqPage of graph.filter((n) => n['@type'] === 'FAQPage')) {
    for (const q of faqPage.mainEntity) check('AC-9', body.includes(q.name) && body.includes(q.acceptedAnswer.text), `${path} FAQPage question not visible: ${q.name}`);
  }
  for (const svc of graph.filter((n) => n['@type'] === 'Service')) check('AC-9', svc.provider?.['@id'] === `${SITE}/#kanzlei`, `${path} service provider`);
}

// AC-1: Trust stat text; no hard-coded contact data outside kanzlei.ts in the HTML sources.
check('AC-1', text(page('/')).includes('Ein eingespieltes Team'), 'home lacks "Ein eingespieltes Team"');

// AC-4: home hero and anchor.
const home = page('/');
check('AC-4', text(home).includes('Steuerberatung in Schwalmstadt für Unternehmen und Privatpersonen'), 'hero H1');
check('AC-4', home.includes('href="/kontakt?anliegen=erstgespraech"') && /Erstgespräch anfragen/.test(home), 'hero CTA');
check('AC-4', home.includes('href="#leistungen"') && home.includes('id="leistungen"'), '#leistungen anchor');
for (const href of ['/leistungen/finanzbuchhaltung', '/leistungen/existenzgruendung', '/leistungen/nachfolgeberatung', '/leistungen/steuererklaerungen', '/team']) check('AC-4', home.includes(`href="${href}"`), `home link ${href}`);

// AC-7: every service page has H1 and the anliegen CTA; internal links resolve.
for (const s of SERVICES) {
  const html = page(`/leistungen/${s.slug}`);
  check('AC-7', /<h1[\s>]/.test(html), `${s.slug} H1`);
  check('AC-7', html.includes(`href="/kontakt?anliegen=${ANLIEGEN[s.slug]}"`), `${s.slug} CTA anliegen=${ANLIEGEN[s.slug]}`);
}
for (const path of [...paths, '/404.html']) {
  const html = path === '/404.html' ? src(join(DIST, '404.html')) : page(path);
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
    if (href.startsWith('/_astro') || /\.(svg|ico|png|jpg|woff2|xml|txt)$/.test(href)) continue;
    check('AC-7', !!page(href.replace(/\/$/, '') || '/'), `broken internal link ${href} on ${path}`);
  }
}

// AC-3: robots allows crawling.
const robots = src(join(DIST, 'robots.txt'));
check('AC-3', /User-agent: \*\s*\nAllow: \//.test(robots), 'robots.txt does not allow crawling');

for (const [ac, list] of Object.entries(results)) console.log(`${list.every(Boolean) ? 'PASS' : 'FAIL'} ${ac} (${list.filter(Boolean).length}/${list.length} checks)`);
process.exit(failures ? 1 : 0);
