'use server';

import { redirect } from 'next/navigation';
import { signupFan, loginFan, clearFanCookie, updateFanProfile, type FanProfilePatch } from './fan';

export async function fanSignupAction(input: { email: string; name: string; password: string }, locale: string, next?: string): Promise<{ error?: string }> {
  const res = await signupFan(input);
  if (!res.ok) return { error: res.error };
  redirect(`/${locale}${next && next.startsWith('/') ? next : '/torcedor'}`);
}

export async function fanLoginAction(email: string, password: string, locale: string, next?: string): Promise<{ error?: string }> {
  const res = await loginFan(email, password);
  if (!res.ok) return { error: res.error };
  redirect(`/${locale}${next && next.startsWith('/') ? next : '/torcedor'}`);
}

export async function fanLogoutAction(locale: string): Promise<void> {
  await clearFanCookie();
  redirect(`/${locale}/torcedor`);
}

export async function updateFanProfileAction(patch: FanProfilePatch): Promise<{ ok: boolean; error?: string }> {
  const res = await updateFanProfile(patch);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}
