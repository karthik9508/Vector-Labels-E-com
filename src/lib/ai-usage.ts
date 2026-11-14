"use client";

import { useSyncExternalStore } from "react";

/**
 * Per-device daily counter for AI concept generations.
 *
 * Stored in `localStorage` and read through `useSyncExternalStore`, so the
 * component does not have to copy storage into state inside an effect.
 * This is a courtesy limit, not a security boundary — it can be cleared by
 * the visitor, and the server does not enforce it.
 */

const USAGE_KEY = "vector_ai_usage";
const USAGE_EVENT = "vector-ai-usage-changed";

export interface AiUsage {
  /** ISO date (YYYY-MM-DD) the count belongs to. */
  date: string;
  count: number;
}

const EMPTY_USAGE: AiUsage = { date: "", count: 0 };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parse(raw: string | null): AiUsage {
  if (!raw) return { date: today(), count: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<AiUsage>;
    if (parsed.date !== today()) return { date: today(), count: 0 };
    const count = Number(parsed.count);
    return { date: parsed.date, count: Number.isFinite(count) && count > 0 ? count : 0 };
  } catch {
    return { date: today(), count: 0 };
  }
}

let cachedRaw: string | null | undefined;
let cachedUsage: AiUsage = EMPTY_USAGE;

function getSnapshot(): AiUsage {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(USAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUsage = parse(raw);
  }
  return cachedUsage;
}

function getServerSnapshot(): AiUsage {
  return EMPTY_USAGE;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(USAGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(USAGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Record one more generation and notify subscribers. */
export function bumpUsage(): AiUsage {
  const current = parse(typeof window === "undefined" ? null : window.localStorage.getItem(USAGE_KEY));
  const next: AiUsage = {
    date: today(),
    count: (current.date === today() ? current.count : 0) + 1,
  };
  try {
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures — the UI still increments for this session.
  }
  window.dispatchEvent(new Event(USAGE_EVENT));
  return next;
}

export function useAiUsage(): AiUsage {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
