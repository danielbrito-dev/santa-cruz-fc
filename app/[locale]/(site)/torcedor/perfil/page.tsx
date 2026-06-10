import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/routing';
import { Link } from '@/lib/i18n/navigation';
import { SiteShell } from '@/components/site/site-shell';
import { FanProfile } from '@/components/site/fan-profile';
import { getFanUser } from '@/server/auth/fan';

export const dynamic = 'force-dynamic';

export default async function FanProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fan = await getFanUser();
  if (!fan) redirect(`/${locale}/torcedor/entrar?next=${encodeURIComponent('/torcedor/perfil')}`);
  const t = await getTranslations('fanProfile');

  return (
    <SiteShell locale={locale}>
      <section className="fan-area">
        <div className="container fan-narrow">
          <Link href="/torcedor" className="fan-back">← {t('back')}</Link>
          <span className="fan-kicker">{t('kicker')}</span>
          <h1 className="fan-title fan-title--dash">{t('title')}</h1>
          <p className="fan-lead">{t('lead')}</p>
          <FanProfile fan={fan} />
        </div>
      </section>
    </SiteShell>
  );
}
