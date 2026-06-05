import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'scfc_session';

// TODO(Phase 2): move to AUTH_SECRET env + Supabase sessions. Replaceable constant for now.
const SECRET = process.env.AUTH_SECRET ?? 'scfc-dev-session-secret-change-me';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // token lifetime (matches the cookie maxAge)

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

/** payload = "<email>|<issuedAtMs>"; token = base64url(payload).signature */
export function createSessionToken(email: string, issuedAt: number = Date.now()): string {
  const payload = `${email}|${issuedAt}`;
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
    const [email, issuedAtStr] = payload.split('|');
    const issuedAt = Number(issuedAtStr);
    if (!email || !Number.isFinite(issuedAt)) return null;
    // reject expired tokens (signature is valid but the session has aged out)
    if (Date.now() - issuedAt > MAX_AGE_MS) return null;
    return { email };
  } catch {
    return null;
  }
}
