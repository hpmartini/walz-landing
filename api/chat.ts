import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuration
const CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10, // 10 requests per minute per IP
  
  // Token limits
  MAX_INPUT_CHARS: 500, // Max user message length
  MAX_OUTPUT_TOKENS: 512, // Max response tokens
  
  // Daily quota per IP (optional, not persistent across cold starts)
  DAILY_QUOTA: 50,
  
  // Gemini API
  GEMINI_MODEL: 'gemini-2.0-flash',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
};

// System prompt for tax consultant assistant
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

// Get client IP
function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

// Rate limiting check
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + CONFIG.RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: CONFIG.RATE_LIMIT_MAX_REQUESTS - 1, resetIn: CONFIG.RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: CONFIG.RATE_LIMIT_MAX_REQUESTS - record.count, resetIn: record.resetTime - now };
}

// Input validation
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
  
  // Basic injection prevention
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

// Call Gemini API
async function callGemini(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const url = `${CONFIG.GEMINI_API_URL}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
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
  
  // Extract text from response
  const candidate = data.candidates?.[0];
  if (!candidate?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini');
  }
  
  return candidate.content.parts[0].text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const ip = getClientIP(req);
  
  // Rate limit check
  const rateLimit = checkRateLimit(ip);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetIn / 1000).toString());
  
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
      retryAfter: Math.ceil(rateLimit.resetIn / 1000),
    });
  }
  
  try {
    const { message } = req.body;
    
    // Validate input
    const validation = validateInput(message);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Call Gemini
    const response = await callGemini(message.trim());
    
    return res.status(200).json({
      response,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    return res.status(500).json({
      error: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
    });
  }
}
