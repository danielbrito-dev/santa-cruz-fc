import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/routing';
import { SiteShell } from '@/components/site/site-shell';
import { FanAuth } from '@/components/site/fan-auth';
import { getFanUser } from '@/server/auth/fan';

export const dynamic = 'force-dynamic';

export default async function FanSignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);
  if (await getFanUser()) redirect(`/${locale}${next && next.startsWith('/') ? next : '/torcedor'}`);
  return (
    <SiteShell locale={locale}>
      <FanAuth mode="signup" next={next} />
    </SiteShell>
  );
}
