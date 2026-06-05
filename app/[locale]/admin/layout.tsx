import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { DEV_USER } from '@/server/auth/dev-user';
import { AdminShell } from '@/components/admin/admin-shell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jar = await cookies();
  const session = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) redirect(`/${locale}/entrar`);

  // Single hardcoded user — name comes from DEV_USER
  return (
    <AdminShell userName={DEV_USER.name} userEmail={session.email}>
      {children}
    </AdminShell>
  );
}
