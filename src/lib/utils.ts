import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safely coerce unknown to a finite number
export function safeNumber(value: unknown, fallback = 0): number {
  const n =
    typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Safely coerce unknown to string
export function safeString(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  try {
    return String(value);
  } catch {
    return fallback;
  }
}

// Safely coerce to array
export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

// Format integer-like counts with locale, coerce NaN/undefined -> 0
export function formatCount(value: unknown, locale = "en-IN"): string {
  return safeNumber(value, 0).toLocaleString(locale);
}

// Format decimal numbers with fixed digits and locale; safe against NaN/undefined
export function formatDecimal(
  value: unknown,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  locale = "en-IN"
): string {
  const n = safeNumber(value, 0);
  return n.toLocaleString(locale, options);
}
