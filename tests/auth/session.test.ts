import { describe, it, expect } from 'vitest';
import { createSessionToken, verifySessionToken, SESSION_COOKIE } from '@/server/auth/session';
import { verifyCredentials, DEV_USER } from '@/server/auth/dev-user';

describe('verifyCredentials', () => {
  it('accepts the dev user (email case-insensitive)', () => {
    expect(verifyCredentials('ADMIN@santacruz.fc', DEV_USER.password)).toBe(true);
    expect(verifyCredentials(' admin@santacruz.fc ', DEV_USER.password)).toBe(true);
  });
  it('rejects wrong password or email', () => {
    expect(verifyCredentials(DEV_USER.email, 'nope')).toBe(false);
    expect(verifyCredentials('x@y.com', DEV_USER.password)).toBe(false);
  });
});

describe('session token', () => {
  it('round-trips a valid token to its email', () => {
    const t = createSessionToken('admin@santacruz.fc');
    expect(verifySessionToken(t)?.email).toBe('admin@santacruz.fc');
  });
  it('rejects garbage / malformed tokens', () => {
    expect(verifySessionToken('garbage')).toBeNull();
    expect(verifySessionToken('')).toBeNull();
    expect(verifySessionToken('a.b.c')).toBeNull();
  });
  it('rejects a token with a tampered payload (bad signature)', () => {
    const t = createSessionToken('admin@santacruz.fc');
    const [payload, sig] = t.split('.');
    // tamper the payload, keep old sig
    const badPayload = Buffer.from('attacker@evil.com|0').toString('base64url');
    expect(verifySessionToken(`${badPayload}.${sig}`)).toBeNull();
  });
  it('exposes the cookie name', () => {
    expect(SESSION_COOKIE).toBe('scfc_session');
  });
});
