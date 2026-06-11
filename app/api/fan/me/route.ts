import { NextResponse } from 'next/server';
import { getFanUser } from '@/server/auth/fan';
import { unreadCount } from '@/server/notify/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const fan = await getFanUser();
  if (!fan) return NextResponse.json(null);
  const unread = await unreadCount(fan.id);
  return NextResponse.json({ name: fan.name, photo: fan.photo ?? null, city: fan.city ?? null, unread });
}
