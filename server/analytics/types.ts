import { z } from 'zod';

export type DeviceKind = 'mobile' | 'desktop' | 'tablet';
export type EventType = 'page_view' | 'page_time' | 'cta_click' | 'news_view';

/** Evento recebido do navegador — validado em /api/track. */
export const trackEventSchema = z.object({
  type: z.enum(['page_view', 'page_time', 'cta_click', 'news_view']),
  path: z.string().max(512),
  sessionId: z.string().max(64),
  visitorId: z.string().max(64),
  title: z.string().max(300).optional(),
  referrer: z.string().max(1024).optional(),
  locale: z.string().max(8).optional(),
  durationMs: z.number().int().nonnegative().max(86_400_000).optional(),
  id: z.string().max(120).optional(), // cta id
  label: z.string().max(160).optional(), // cta label legível
  slug: z.string().max(200).optional(), // news slug
});
export type TrackEvent = z.infer<typeof trackEventSchema>;

/** Evento persistido (enriquecido no servidor). */
export interface StoredEvent extends TrackEvent {
  ts: number; // hora de recebimento (servidor)
  device: DeviceKind;
  source?: string; // page_view: search | direct | social | referral | internal
}

/** Forma de leitura consumida pelo dashboard. */
export interface AnalyticsSummary {
  source: 'live' | 'demo';
  kpis: { key: string; value: string; delta?: string; good?: boolean }[];
  series: number[]; // 14 dias
  sources: { key: string; pct: number }[];
  devices: { key: string; pct: number }[];
  topPages: { label: string; v: number }[];
  topNews: { title: string; v: number }[];
  ctas: { label: string; v: number }[];
}
