import { TIER2_GUARD_AT } from "@/lib/aiModels";
import { readTier2Usage, writeTier2Usage, type Tier2UsageRow } from "@/lib/supabase";

export interface Tier2Reservation {
  count: number;
  /** True once today's Tier-2 usage has reached 85% of the 500 RPD cap. */
  constrained: boolean;
  /** True only on the request that crosses the threshold. */
  shouldAlert: boolean;
}

interface MemoryBucket {
  count: number;
  alerted: boolean;
}

const memory = new Map<string, MemoryBucket>();

export async function reserveTier2Slot(now: Date = new Date()): Promise<Tier2Reservation> {
  const day = now.toISOString().slice(0, 10);
  try {
    const persisted = await reservePersisted(day);
    if (persisted) {
      memory.set(day, { count: persisted.count, alerted: persisted.alerted });
      return persisted.reservation;
    }
  } catch (error) {
    console.error("[Quota] Persisted counter failed. Falling back to memory.", error);
  }
  return reserveMemory(day);
}

async function reservePersisted(
  day: string,
): Promise<{ reservation: Tier2Reservation; count: number; alerted: boolean } | null> {
  const current = await readTier2Usage(day);
  if (!current) return null;

  const count = persistedCount(current) + 1;
  const reservation = describe(count, current.alert_sent);
  const alerted = current.alert_sent || reservation.shouldAlert;
  const saved = await writeTier2Usage(day, count, alerted);
  if (!saved) return null;
  return { reservation, count, alerted };
}

function reserveMemory(day: string): Tier2Reservation {
  const bucket = memory.get(day) ?? { count: 0, alerted: false };
  const count = bucket.count + 1;
  const reservation = describe(count, bucket.alerted);
  memory.set(day, { count, alerted: bucket.alerted || reservation.shouldAlert });
  return reservation;
}

/**
 * `request_count` and `count` are the same counter under different schemas.
 * A missing column is ignored. When both are present, the higher value wins so a drifted column cannot under-count.
 */
function persistedCount(row: Tier2UsageRow): number {
  const requestCount = finite(row.request_count);
  const count = finite(row.count);
  if (requestCount == null && count == null) return 0;
  if (requestCount == null) return count ?? 0;
  if (count == null) return requestCount;
  return Math.max(requestCount, count);
}

function finite(value: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function describe(count: number, alerted: boolean): Tier2Reservation {
  const constrained = count >= TIER2_GUARD_AT;
  return { count, constrained, shouldAlert: constrained && !alerted };
}
