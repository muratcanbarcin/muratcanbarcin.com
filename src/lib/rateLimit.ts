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
 */
export function createSlidingWindowLimiter({ limit, windowMs }: SlidingWindowOptions) {
  const buckets = new Map<string, number[]>();

  return {
    consume(key: string, now = Date.now()): RateLimitDecision {
      const fresh = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

      if (fresh.length >= limit) {
        buckets.set(key, fresh);
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
      buckets.set(key, fresh);
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

/** First forwarded address wins; falls back to the direct peer header, then a shared unknown bucket. */
export function readClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const forwardedAddress = forwarded?.split(",")[0]?.trim();
  if (forwardedAddress) return forwardedAddress;

  const realAddress = request.headers.get("x-real-ip")?.trim();
  return realAddress || "unknown";
}
