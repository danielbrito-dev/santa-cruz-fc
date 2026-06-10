import { setRequestLocale, getTranslations, getFormatter } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { SiteShell } from '@/components/site/site-shell';
import { Kicker } from '@/components/site/pages/_shared';
import { fetchTvCoralVideos, TV_CORAL_URL } from '@/server/content/youtube';

export const revalidate = 1800; // feed do YouTube re-buscado a cada 30min

export default async function TvCoralPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const menu = await getTranslations('menu');
  const p = await getTranslations('page');
  const format = await getFormatter();

  const videos = await fetchTvCoralVideos();
  const [featured, ...rest] = videos;
  const fmtDate = (iso: string) =>
    format.dateTime(new Date(iso), { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SiteShell locale={locale}>
      <div className="sc-page" data-section="vivaSanta">
        <header className="sc-dhero sc-dhero--doc">
          <span className="sc-dhero-ghost" aria-hidden="true">▶</span>
          <div className="sc-wrap sc-dhero-inner sc-hero-in">
            <Kicker label={menu('vivaSanta')} />
            <h1 className="sc-dhero-title">{menu('tvCoral')}</h1>
          </div>
        </header>

        <section className="tvc">
          <div className="sc-wrap">
            <p className="tvc-lead">{p('tvcLead')}</p>

            {featured ? (
              <>
                <div className="tvc-featured-wrap">
                  <iframe
                    className="tvc-featured"
                    src={`https://www.youtube-nocookie.com/embed/${featured.id}`}
                    title={featured.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                  <h2 className="tvc-featured-title">{featured.title}</h2>
                  <time className="tvc-date" dateTime={featured.published}>{fmtDate(featured.published)}</time>
                </div>

                {rest.length > 0 && (
                  <>
                    <h3 className="tvc-latest">{p('tvcLatest')}</h3>
                    <ul className="tvc-grid">
                      {rest.map((v) => (
                        <li key={v.id}>
                          <a className="tvc-card" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">
                            <span className="tvc-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={v.thumb} alt="" loading="lazy" />
                              <span className="tvc-play" aria-hidden="true">▶</span>
                            </span>
                            <span className="tvc-card-title">{v.title}</span>
                            <time className="tvc-date" dateTime={v.published}>{fmtDate(v.published)}</time>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <p className="tvc-empty">{p('tvcEmpty')}</p>
            )}

            <a className="sc-btn tvc-channel" href={TV_CORAL_URL} target="_blank" rel="noopener noreferrer">
              {p('tvcChannel')} →
            </a>
          </div>
        </section>

        <div className="sc-fill" aria-hidden="true" />
      </div>
    </SiteShell>
  );
}
