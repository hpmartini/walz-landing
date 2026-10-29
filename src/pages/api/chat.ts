import type { APIRoute } from 'astro';
import { createRateLimiter, getClientIP, isCrossOrigin } from '../../lib/rate-limit';

export const prerender = false;

// Configuration
const CONFIG = {
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 10,
  MAX_INPUT_CHARS: 500,
  MAX_OUTPUT_TOKENS: 512,
  GEMINI_MODEL: 'gemini-2.0-flash',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
};

const SYSTEM_PROMPT = `Du bist der freundliche virtuelle Assistent der Kanzlei Karsten Walz, einer Steuerberaterkanzlei in Schwalmstadt.

DEINE ROLLE:
- Beantworte allgemeine Fragen zu Steuerberatung, Buchhaltung und den Leistungen der Kanzlei
- Sei warm, professionell und hilfsbereit
- Verweise bei komplexen oder individuellen Fragen auf einen persönlichen Beratungstermin

WICHTIGE REGELN:
- Gib KEINE konkreten Steuerberatung oder rechtlich bindende Auskünfte
- Bei spezifischen Steuerfragen: Empfehle einen Termin mit der Kanzlei
- Bleib immer höflich und zuvorkommend
- Antworte auf Deutsch
- Halte Antworten prägnant (max 2-3 Absätze)

ÜBER DIE KANZLEI:
- Kanzlei Karsten Walz, Steuerberater
- Seit 2000 in Schwalmstadt, 13+ Mitarbeiter
- Leistungen: Existenzgründungsberatung, Coaching, Betriebswirtschaftliche Beratung, Finanzbuchhaltung, Jahresabschlüsse, Lohnbuchhaltung, Steuerberatung, Steuererklärungen
- Telefon: 06691 4271
- Adresse: Ziegenhainer Str. 3, 34613 Schwalmstadt
- Öffnungszeiten: Mo-Do 8-17 Uhr, Fr 8-13:30 Uhr

Bei Terminanfragen verweise auf die Kontaktseite oder die Telefonnummer.`;

const checkRateLimit = createRateLimiter(CONFIG.RATE_LIMIT_WINDOW_MS, CONFIG.RATE_LIMIT_MAX_REQUESTS);

function validateInput(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Nachricht ist erforderlich' };
  }
  
  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Nachricht darf nicht leer sein' };
  }
  
  if (trimmed.length > CONFIG.MAX_INPUT_CHARS) {
    return { valid: false, error: `Nachricht ist zu lang (max ${CONFIG.MAX_INPUT_CHARS} Zeichen)` };
  }
  
  const suspiciousPatterns = [
    /ignore.*previous.*instructions/i,
    /system.*prompt/i,
    /act.*as/i,
    /pretend.*to.*be/i,
    /forget.*everything/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Ungültige Anfrage' };
    }
  }
  
  return { valid: true };
}

async function callGemini(message: string): Promise<string> {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const url = `${CONFIG.GEMINI_API_URL}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS,
        temperature: 0.7,
        topP: 0.9,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }
  
  const data = await response.json();
  const candidate = data.candidates?.[0];
  
  if (!candidate?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini');
  }
  
  return candidate.content.parts[0].text;
}

export const POST: APIRoute = async ({ request }) => {
  if (isCrossOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Nicht erlaubt' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  const ip = getClientIP(request);
  const rateLimit = checkRateLimit(ip);
  
  const headers = {
    'Content-Type': 'application/json',
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
  };
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
      retryAfter: Math.ceil(rateLimit.resetIn / 1000),
    }), { status: 429, headers });
  }
  
  try {
    const body = await request.json();
    const { message } = body;
    
    const validation = validateInput(message);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), { status: 400, headers });
    }
    
    const response = await callGemini(message.trim());
    
    return new Response(JSON.stringify({
      response,
      remaining: rateLimit.remaining,
    }), { status: 200, headers });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({
      error: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
    }), { status: 500, headers });
  }
};
