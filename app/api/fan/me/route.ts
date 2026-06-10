import { NextResponse } from 'next/server';
import { getFanUser } from '@/server/auth/fan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const fan = await getFanUser();
  return NextResponse.json(fan ? { name: fan.name, photo: fan.photo ?? null, city: fan.city ?? null } : null);
}
