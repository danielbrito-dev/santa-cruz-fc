import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'scfc_session';

// TODO(Phase 2): move to AUTH_SECRET env + Supabase sessions. Replaceable constant for now.
const SECRET = process.env.AUTH_SECRET ?? 'scfc-dev-session-secret-change-me';

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

/** payload = "<email>|<issuedAtMs>"; token = base64url(payload).signature */
export function createSessionToken(email: string): string {
  const payload = `${email}|${Date.now()}`;
  const encoded = Buffer.from(payload).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined | null): { email: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expected = sign(encoded);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = Buffer.from(encoded, 'base64url').toString('utf8');
    const [email] = payload.split('|');
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}
