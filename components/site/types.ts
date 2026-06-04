import type { Locale } from '@/lib/i18n/routing';
import type { SiteContent } from '@/server/content/types';
export interface SectionProps { content: SiteContent; locale: Locale; }
