import type { APIRoute } from 'astro';
import services from '../data/services.json';
import { SITE, kanzlei, hoursText, faq } from '../data/kanzlei';

// llms.txt (llmstxt.org): a plain-markdown summary for AI search and assistants.
export const GET: APIRoute = () => {
  const body = `# ${kanzlei.name}

> ${kanzlei.description}

- Adresse: ${kanzlei.street}, ${kanzlei.postalCode} ${kanzlei.city}, ${kanzlei.region}, Deutschland
- Telefon: ${kanzlei.phone}
- E-Mail: ${kanzlei.email}
- Öffnungszeiten: ${hoursText}

## Leistungen

${services.map((s) => `- [${s.title}](${SITE}/leistungen/${s.slug}): ${s.shortDesc.replace(/\n/g, ' ')}`).join('\n')}

## Kanzlei

- [Über die Kanzlei](${SITE}/kanzlei)
- [Team](${SITE}/team)
- [Karriere](${SITE}/karriere)
- [Kontakt](${SITE}/kontakt)

## Häufige Fragen

${faq.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n')}

## Optional

- [Impressum](${SITE}/impressum)
- [Datenschutz](${SITE}/datenschutz)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
