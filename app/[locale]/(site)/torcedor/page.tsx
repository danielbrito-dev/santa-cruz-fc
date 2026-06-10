import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Link } from '@/lib/i18n/navigation';
import { SiteShell } from '@/components/site/site-shell';
import { getFanUser } from '@/server/auth/fan';
import { fanLogoutAction } from '@/server/auth/fan-actions';

export const dynamic = 'force-dynamic';

export default async function TorcedorPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('fan');
  const fan = await getFanUser();

  if (fan) {
    const cards = [
      { key: 'censo', href: '/viva-o-santa/censo' },
      { key: 'sugestoes', href: '/historias/enviar' },
      { key: 'sorteios', href: '/viva-o-santa/experiencias' },
      { key: 'area', href: '/torcedor/perfil' },
    ] as const;
    return (
      <SiteShell locale={locale}>
        <section className="fan-area">
          <div className="container">
            <div className="fan-dash-head">
              {fan.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="fan-dash-photo" src={fan.photo} alt="" />
              ) : (
                <span className="fan-dash-photo fan-chip-initial">{fan.name.charAt(0).toUpperCase()}</span>
              )}
              <div>
                <span className="fan-kicker">{t('kicker')}</span>
                <h1 className="fan-title fan-title--dash">{t('hello', { name: fan.name.split(' ')[0] })}</h1>
              </div>
            </div>
            <p className="fan-lead">{t('dashLead')}</p>
            <ul className="fan-grid">
              {cards.map((c) => (
                <li key={c.key}>
                  <Link href={c.href} className="fan-card fan-card--link">
                    <h3>{t(`d_${c.key}_title`)}</h3>
                    <p>{t(`d_${c.key}_desc`)}</p>
                    <span className="fan-card-arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <form action={fanLogoutAction.bind(null, locale)}>
              <button type="submit" className="fan-btn fan-btn--ghost">{t('logout')}</button>
            </form>
          </div>
        </section>
      </SiteShell>
    );
  }

  const features = ['sorteios', 'censo', 'sugestoes', 'area'] as const;
  return (
    <SiteShell locale={locale}>
      <section className="fan-area">
        <div className="container">
          <span className="fan-kicker">{t('kicker')}</span>
          <h1 className="fan-title">{t('title')}</h1>
          <p className="fan-lead">{t('lead')}</p>
          <div className="fan-cta-row">
            <Link href="/torcedor/cadastro" className="fan-btn">{t('signupCta')}</Link>
            <Link href="/torcedor/entrar" className="fan-btn fan-btn--ghost">{t('loginCta')}</Link>
          </div>
          <ul className="fan-grid">
            {features.map((f) => (
              <li key={f} className="fan-card">
                <h3>{t(`f_${f}_title`)}</h3>
                <p>{t(`f_${f}_desc`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
