import type { Locale } from '@/lib/i18n/routing';
import type { LocalizedText } from './types';

export function resolveLocalized(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.pt ?? '';
}
