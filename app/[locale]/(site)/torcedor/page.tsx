import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Link } from '@/lib/i18n/navigation';
import { SiteShell } from '@/components/site/site-shell';
import { FanNotifications } from '@/components/site/fan-notifications';
import { getFanUser } from '@/server/auth/fan';
import { fanLogoutAction } from '@/server/auth/fan-actions';
import { listNotifications } from '@/server/notify/notifications';

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
      { key: 'sorteios', href: '/torcedor/sorteios' },
      { key: 'area', href: '/torcedor/perfil' },
    ] as const;
    const notifications = await listNotifications(fan.id, 20);
    return (
      <SiteShell locale={locale}>
        <section className="fan-stage">
          <header className="fan-hero fan-hero--dash page-hero-dark">
            <span className="fan-hero-ghost" aria-hidden="true">1914</span>
            <div className="container fan-hero-inner">
              <div className="fan-hero-id">
                {fan.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="fan-hero-ava" src={fan.photo} alt="" />
                ) : (
                  <span className="fan-hero-ava fan-hero-ava--ph">{fan.name.charAt(0).toUpperCase()}</span>
                )}
                <div>
                  <span className="fan-hero-kicker">{t('kicker')}</span>
                  <h1 className="fan-hero-title fan-hero-title--dash">{t('hello', { name: fan.name.split(' ')[0] })}</h1>
                </div>
              </div>
              <p className="fan-hero-lead">{t('dashLead')}</p>
            </div>
          </header>
          <div className="fan-deck">
            <div className="container">
              <FanNotifications items={notifications} />
              <ul className="fan-deck-grid">
                {cards.map((c, i) => (
                  <li key={c.key}>
                    <Link href={c.href} className="fan-deck-card fan-deck-card--link">
                      <span className="fan-deck-num" aria-hidden="true">0{i + 1}</span>
                      <h3>{t(`d_${c.key}_title`)}</h3>
                      <p>{t(`d_${c.key}_desc`)}</p>
                      <span className="fan-deck-go">{t('open')} <i aria-hidden="true">→</i></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <form action={fanLogoutAction.bind(null, locale)}>
                <button type="submit" className="fan-btn fan-btn--ghost">{t('logout')}</button>
              </form>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const features = ['sorteios', 'censo', 'sugestoes', 'area'] as const;
  return (
    <SiteShell locale={locale}>
      <section className="fan-stage">
        <header className="fan-hero page-hero-dark">
          <span className="fan-hero-ghost" aria-hidden="true">1914</span>
          <div className="container fan-hero-inner">
            <span className="fan-hero-kicker">{t('kicker')}</span>
            <h1 className="fan-hero-title">{t('title')}</h1>
            <p className="fan-hero-lead">{t('lead')}</p>
            <div className="fan-hero-ctas">
              <Link href="/torcedor/cadastro" className="fan-btn">{t('signupCta')}</Link>
              <Link href="/torcedor/entrar" className="fan-btn fan-btn--outline">{t('loginCta')}</Link>
            </div>
          </div>
        </header>
        <div className="fan-deck">
          <div className="container">
            <ul className="fan-deck-grid">
              {features.map((f, i) => (
                <li key={f} className="fan-deck-card">
                  <span className="fan-deck-num" aria-hidden="true">0{i + 1}</span>
                  <h3>{t(`f_${f}_title`)}</h3>
                  <p>{t(`f_${f}_desc`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
