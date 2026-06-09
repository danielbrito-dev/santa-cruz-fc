import { NextResponse, type NextRequest } from 'next/server';
import { trackEventSchema, type StoredEvent, type DeviceKind } from '@/server/analytics/types';
import { recordEvents } from '@/server/analytics/sink';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function deviceFromUA(ua: string): DeviceKind {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod|Windows Phone|webOS|BlackBerry/i.test(ua)) return 'mobile';
  return 'desktop';
}
function classifySource(referrer: string | undefined, host: string): string {
  if (!referrer) return 'direct';
  let h = '';
  try {
    h = new URL(referrer).hostname.toLowerCase();
  } catch {
    return 'direct';
  }
  if (!h || h === host || h.endsWith('.' + host)) return 'internal';
  if (/google|bing|duckduckgo|yahoo|ecosia|baidu|yandex|search/.test(h)) return 'search';
  if (/facebook|instagram|twitter|x\.com|t\.co|tiktok|youtube|youtu\.be|linkedin|whatsapp|wa\.me|telegram|reddit|threads/.test(h))
    return 'social';
  return 'referral';
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const items = Array.isArray(payload) ? payload : [payload];
  const ua = req.headers.get('user-agent') ?? '';
  const device = deviceFromUA(ua);
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase();
  const now = Date.now();

  const stored: StoredEvent[] = [];
  for (const item of items.slice(0, 20)) {
    const parsed = trackEventSchema.safeParse(item);
    if (!parsed.success) continue;
    const ev: StoredEvent = { ...parsed.data, ts: now, device };
    if (ev.type === 'page_view') ev.source = classifySource(ev.referrer, host);
    stored.push(ev);
  }
  await recordEvents(stored);
  return NextResponse.json({ ok: true, n: stored.length });
}
