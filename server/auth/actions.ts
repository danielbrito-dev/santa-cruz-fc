'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyCredentials } from './dev-user';
import { createSessionToken, SESSION_COOKIE } from './session';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function login(
  email: string,
  password: string,
  locale: string,
): Promise<{ error?: 'invalid' }> {
  if (!verifyCredentials(email, password)) {
    return { error: 'invalid' };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(email.trim().toLowerCase()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  redirect(`/${locale}/admin`); // throws — navigates; no return after this
}

export async function logout(locale: string): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect(`/${locale}/entrar`);
}
