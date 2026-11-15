"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Per-user daily counter for AI concept generations.
 *
 * Authenticated users get a localStorage keyed by their email address.
 * The server also enforces the limit per-user via the database.
 * Unauthenticated visitors fall back to a generic device-level counter.
 */

const BASE_USAGE_KEY = "vector_ai_usage";
const USAGE_EVENT = "vector-ai-usage-changed";

export interface AiUsage {
  /** ISO date (YYYY-MM-DD) the count belongs to. */
  date: string;
  count: number;
}

const EMPTY_USAGE: AiUsage = { date: "", count: 0 };

/* ---------- module-level cache so getSnapshot returns a stable ref ---------- */

let cacheKey = "";
let cachedSnapshot: AiUsage = EMPTY_USAGE;

function invalidateCache() {
  cacheKey = "";
}

function readFromStorage(email?: string | null): AiUsage {
  const key = email ? `vector_ai_usage_${email}` : BASE_USAGE_KEY;
  if (key === cacheKey) return cachedSnapshot;

  const todayStr = new Date().toISOString().slice(0, 10);
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }

  if (!raw) {
    cachedSnapshot = { date: todayStr, count: 0 };
  } else {
    try {
      const parsed = JSON.parse(raw) as Partial<AiUsage>;
      const count = Number(parsed.count);
      cachedSnapshot = {
        date: parsed.date === todayStr ? todayStr : todayStr,
        count: Number.isFinite(count) && count > 0 ? count : 0,
      };
    } catch {
      cachedSnapshot = { date: todayStr, count: 0 };
    }
  }
  cacheKey = key;
  return cachedSnapshot;
}

/* ---------- public API ---------- */

function getServerSnapshot(): AiUsage {
  return EMPTY_USAGE;
}

function subscribeImpl(onChange: () => void): () => void {
  window.addEventListener(USAGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(USAGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Record one more generation and notify subscribers. */
export function bumpUsage(email?: string | null): AiUsage {
  const key = email ? `vector_ai_usage_${email}` : BASE_USAGE_KEY;
  const todayStr = new Date().toISOString().slice(0, 10);
  const current = readFromStorage(email);
  const next: AiUsage = {
    date: todayStr,
    count: (current.date === todayStr ? current.count : 0) + 1,
  };

  invalidateCache();
  cacheKey = key;
  cachedSnapshot = next;

  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(USAGE_EVENT));
  return next;
}

export function useAiUsage(email?: string | null): AiUsage {
  // getSnapshot must return the same object reference across repeated calls
  // during a render pass.  The module-level cache ensures that.
  const getSnapshotForEmail = useMemo(
    () => () => readFromStorage(email),
    [email]
  );

  // subscribe must also be a stable reference.
  const memoizedSubscribe = useCallback(subscribeImpl, []);

  return useSyncExternalStore(
    memoizedSubscribe,
    getSnapshotForEmail,
    getServerSnapshot
  );
}
