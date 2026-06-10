import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { supabaseAdmin, hasSupabase } from '@/server/auth/supabase';
import { getFanUser } from '@/server/auth/fan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif'];
const MAX = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  // Admin (cookie de sessão) OU torcedor logado (este último só na pasta 'fans').
  const jar = await cookies();
  const isAdmin = !!verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!isAdmin && !(await getFanUser())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!hasSupabase()) return NextResponse.json({ error: 'no-storage' }, { status: 503 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  const file = form.get('file');
  const requested = ((form.get('folder') as string | null) || 'uploads').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'uploads';
  const folder = isAdmin ? requested : 'fans';
  if (!(file instanceof File)) return NextResponse.json({ error: 'no-file' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'type' }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: 'size' }, { status: 413 });

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const admin = supabaseAdmin();
  const { error } = await admin.storage.from('media').upload(key, buf, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = admin.storage.from('media').getPublicUrl(key);
  return NextResponse.json({ url: data.publicUrl });
}
