"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { QuoteRequest } from "@/lib/pricing";

/**
 * Cart storage and helpers.
 *
 * Before this module every component parsed `localStorage.vector_cart` by
 * hand, which is why the navbar badge went stale after an "Add to cart" and
 * why one page could store a different shape than another.
 *
 * The cart is an external store, so components subscribe through
 * `useSyncExternalStore` instead of copying it into component state inside an
 * effect (which caused a second render on every page load).
 */

export const CART_STORAGE_KEY = "vector_cart";
export const CART_EVENT = "vector-cart-changed";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  specs: string;
  quantity: number;
  unitPrice: number;
  total: number;
  swatch?: { background: string; text: string };
  pricingRequest?: QuoteRequest;
  /** AI-generated concept image URL (when the item came from the AI studio). */
  conceptImageUrl?: string;
  /** Stable concept reference from the AI generation response. */
  conceptId?: string;
  createdAt: string;
}

/** Shape written by older versions of the site. */
interface LegacyCartItem {
  product?: string;
  specs?: string;
  price?: number;
  quantity?: number;
}

const EMPTY_ITEMS: CartItem[] = [];

export function createCartItem(input: Omit<CartItem, "id" | "total" | "createdAt">): CartItem {
  const quantity = Math.max(1, Math.round(input.quantity));
  const unitPrice = Number.isFinite(input.unitPrice) ? input.unitPrice : 0;
  return {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `ci_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    quantity,
    unitPrice,
    total: Math.round(unitPrice * quantity),
    createdAt: new Date().toISOString(),
  };
}

function normalise(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<CartItem> & LegacyCartItem;

  // Legacy entries stored `product` / `specs` / `price` with no quantity.
  if (!candidate.id) {
    const price = Number(candidate.price) || 0;
    const quantity = Math.max(1, Number(candidate.quantity) || 1);
    return {
      id: `legacy_${Math.random().toString(36).slice(2, 9)}`,
      slug: "",
      title: candidate.product || "Custom label batch",
      specs: candidate.specs || "",
      quantity,
      unitPrice: price,
      total: Math.round(price * quantity),
      createdAt: new Date().toISOString(),
    };
  }

  const quantity = Math.max(1, Number(candidate.quantity) || 1);
  const unitPrice = Number(candidate.unitPrice ?? candidate.price) || 0;
  return {
    id: candidate.id,
    slug: candidate.slug ?? "",
    title: candidate.title || candidate.product || "Custom label batch",
    specs: candidate.specs ?? "",
    quantity,
    unitPrice,
    total: Math.round(unitPrice * quantity),
    swatch: candidate.swatch,
    pricingRequest: candidate.pricingRequest,
    createdAt: candidate.createdAt ?? new Date().toISOString(),
  };
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY_ITEMS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ITEMS;
    return parsed
      .map(normalise)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return EMPTY_ITEMS;
  }
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_ITEMS;
  try {
    return parseCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return EMPTY_ITEMS;
  }
}

function emit(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_EVENT));
}

export function writeCart(items: CartItem[]): CartItem[] {
  if (typeof window === "undefined") return items;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked (private mode) — the UI still shows the item.
  }
  emit();
  return items;
}

export function addToCart(item: CartItem): CartItem[] {
  return writeCart([...readCart(), item]);
}

export function removeFromCart(id: string): CartItem[] {
  return writeCart(readCart().filter((item) => item.id !== id));
}

/** Change an item's quantity, keeping unitPrice × quantity in sync. */
export function updateQuantity(id: string, quantity: number): CartItem[] {
  const next = Math.max(1, Math.round(quantity) || 1);
  return writeCart(
    readCart().map((item) =>
      item.id === id
        ? { ...item, quantity: next, total: Math.round(item.unitPrice * next) }
        : item
    )
  );
}

export function clearCart(): CartItem[] {
  return writeCart([]);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

/* ------------------------------------------------------------------ */
/* External store                                                      */
/* ------------------------------------------------------------------ */

// `useSyncExternalStore` requires a stable snapshot for unchanged storage,
// so the parsed array is memoised against the raw JSON string.
let cachedRaw: string | null | undefined;
let cachedItems: CartItem[] = EMPTY_ITEMS;

function getSnapshot(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parseCart(raw);
  }
  return cachedItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CART_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CART_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noopSubscribe = () => () => {};
const isHydrated = () => true;
const isNotHydrated = () => false;

/**
 * Subscribe a component to the cart. Every mounted consumer stays in sync,
 * including across tabs.
 */
export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // `false` during SSR and hydration, `true` afterwards — lets pages avoid
  // flashing an "empty cart" state before storage has been read.
  const ready = useSyncExternalStore(noopSubscribe, isHydrated, isNotHydrated);

  const add = useCallback((item: CartItem) => addToCart(item), []);
  const remove = useCallback((id: string) => removeFromCart(id), []);
  const setQuantity = useCallback((id: string, quantity: number) => updateQuantity(id, quantity), []);
  const clear = useCallback(() => clearCart(), []);

  return {
    items,
    ready,
    add,
    remove,
    setQuantity,
    clear,
    count: cartCount(items),
    total: cartTotal(items),
  };
}
