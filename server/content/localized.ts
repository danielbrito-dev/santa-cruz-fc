import type { Locale } from '@/lib/i18n/routing';
import type { LocalizedText } from './types';

/**
 * Resolves a localized string for the active locale.
 * Uses `??` (not `||`) deliberately: an explicit empty string `""` is a valid,
 * intentional translation and is returned as-is — it does NOT fall back to `pt`.
 * Fallback to `pt` happens only when the locale key is missing/undefined.
 * UI callers should guard against empty strings (e.g. omit the element).
 */
export function resolveLocalized(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.pt ?? '';
}
