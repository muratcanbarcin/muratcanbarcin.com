export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

interface SlidingWindowOptions {
  limit: number;
  windowMs: number;
}

/**
 * In-memory sliding window. Each key keeps only the timestamps that still fall inside the window,
 * so a burst cannot borrow quota from requests that have already expired.
 * The map is capped so a flood of distinct keys cannot grow without bound.
 */
export function createSlidingWindowLimiter({ limit, windowMs }: SlidingWindowOptions) {
  const buckets = new Map<string, number[]>();
  const maxBuckets = 10_000;

  const store = (key: string, timestamps: number[]) => {
    if (!buckets.has(key) && buckets.size >= maxBuckets) {
      const oldest = buckets.keys().next().value;
      if (oldest !== undefined) buckets.delete(oldest);
    }
    buckets.set(key, timestamps);
  };

  return {
    consume(key: string, now = Date.now()): RateLimitDecision {
      const fresh = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

      if (fresh.length >= limit) {
        store(key, fresh);
        const oldest = fresh[0] ?? now;
        const retryAfterMs = windowMs - (now - oldest);
        return {
          allowed: false,
          limit,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
        };
      }

      fresh.push(now);
      store(key, fresh);
      return {
        allowed: true,
        limit,
        remaining: limit - fresh.length,
        retryAfterSeconds: 0,
      };
    },
  };
}

/** Shared process-local limiter for the public chat route: 8 requests per minute per address. */
export const chatRateLimiter = createSlidingWindowLimiter({ limit: 8, windowMs: 60_000 });

/** Resume requests are rare by nature: 3 submissions per 10 minutes per address. */
export const resumeRequestRateLimiter = createSlidingWindowLimiter({ limit: 3, windowMs: 600_000 });

/** Contact inquiries: 3 submissions per 10 minutes per address. */
export const contactInquiryRateLimiter = createSlidingWindowLimiter({ limit: 3, windowMs: 600_000 });

/** Makas App Store support tickets: 5 submissions per 10 minutes per address. */
export const makasSupportRateLimiter = createSlidingWindowLimiter({ limit: 5, windowMs: 600_000 });

const ADDRESS_LIMIT = 128;

/** Platform client IP first. The left-most `x-forwarded-for` hop is client-supplied and spoofable. */
export function readClientAddress(request: Request): string {
  return (
    readHop(request.headers.get("x-vercel-forwarded-for")) ??
    readHop(request.headers.get("x-real-ip")) ??
    readHop(request.headers.get("x-forwarded-for")) ??
    "unknown"
  );
}

function readHop(header: string | null): string | null {
  const hop = header?.split(",")[0]?.trim() ?? "";
  if (!hop || hop.length > ADDRESS_LIMIT) return null;
  return hop;
}
