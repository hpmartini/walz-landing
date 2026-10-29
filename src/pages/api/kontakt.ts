import type { APIRoute } from 'astro';
import { createRateLimiter, getClientIP, isCrossOrigin } from '../../lib/rate-limit';

export const prerender = false;

const CONFIG = {
  RATE_LIMIT_WINDOW_MS: 10 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 5,
  MAX: { name: 120, phone: 40, email: 200, message: 5000 },
  RESEND_API_URL: 'https://api.resend.com/emails',
  DEFAULT_TO: 'info@kanzlei-karstenwalz.de',
};

const checkRateLimit = createRateLimiter(CONFIG.RATE_LIMIT_WINDOW_MS, CONFIG.RATE_LIMIT_MAX_REQUESTS);

type Fields = { name: string; phone: string; email: string; message: string };

function readFields(form: FormData): Fields {
  const get = (key: string) => String(form.get(key) ?? '').trim();
  return { name: get('name'), phone: get('phone'), email: get('email'), message: get('message') };
}

function validate(f: Fields): string | null {
  if (!f.name || !f.email || !f.message) return 'Bitte füllen Sie Name, E-Mail und Nachricht aus.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Bitte prüfen Sie Ihre E-Mail-Adresse.';
  for (const key of Object.keys(CONFIG.MAX) as (keyof Fields)[]) {
    if (f[key].length > CONFIG.MAX[key]) return 'Ihre Eingabe ist zu lang. Bitte kürzen Sie die Nachricht.';
  }
  return null;
}

async function sendMail(f: Fields): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.CONTACT_FROM;
  if (!apiKey || !from) throw new Error('Mail provider not configured');

  const text = [
    `Name: ${f.name}`,
    `E-Mail: ${f.email}`,
    `Telefon: ${f.phone || '–'}`,
    '',
    f.message,
  ].join('\n');

  const response = await fetch(CONFIG.RESEND_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: import.meta.env.CONTACT_TO || CONFIG.DEFAULT_TO,
      reply_to: f.email,
      subject: `Anfrage über die Website: ${f.name}`,
      text,
    }),
  });

  if (!response.ok) {
    // Status only: the body may echo personal data from the form.
    throw new Error(`Resend API error: ${response.status}`);
  }
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = (status: number, error?: string) =>
    wantsJson
      ? new Response(JSON.stringify(error ? { error } : { ok: true }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        })
      : redirect(`/kontakt?status=${error ? 'fehler' : 'gesendet'}`, 303);

  if (isCrossOrigin(request)) return reply(403, 'Nicht erlaubt.');

  if (!checkRateLimit(getClientIP(request)).allowed) {
    return reply(429, 'Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, 'Ungültige Anfrage.');
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots don't retry.
  if (String(form.get('website') ?? '') !== '') return reply(200);

  const fields = readFields(form);
  const error = validate(fields);
  if (error) return reply(400, error);

  try {
    await sendMail(fields);
    return reply(200);
  } catch (err) {
    console.error('Contact form error:', err instanceof Error ? err.message : err);
    return reply(503, 'Die Nachricht konnte gerade nicht gesendet werden.');
  }
};
