// shortcut: in-memory per serverless instance, resets on cold start; move to Vercel KV/Upstash if abuse shows up.

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

export function createRateLimiter(windowMs: number, maxRequests: number) {
  const store = new Map<string, { count: number; resetTime: number }>();

  return function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
    }

    record.count++;
    return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now };
  };
}

// Browsers send Origin on cross-site POSTs; reject those. Requests without Origin (curl, same-origin GET) pass.
export function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}
