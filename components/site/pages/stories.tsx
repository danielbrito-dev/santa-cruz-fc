import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { StoriesData } from '@/lib/site-pages';
import { Kicker, Marquee } from './_shared';

export async function Stories({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: StoriesData;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');
  const list = data.mode === 'featured' ? data.stories.filter((s) => s.featured) : data.stories;

  return (
    <div className="sc-page page-hero-dark" data-section={sectionKey}>
      <header className="sc-dhero sc-dhero--ink">
        <span className="sc-dhero-ghost" aria-hidden="true">
          “”
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
          <Link className="sc-btn" href="/historias/enviar">
            {p('sendStory')} →
          </Link>
        </div>
      </header>

      <Marquee />

      <div className="sc-stories">
        <div className="sc-wrap">
          <div className="sc-stories-grid">
            {list.map((s, i) => (
              <article
                className={`sc-story sc-reveal${s.featured ? ' sc-story-featured' : ''}`}
                key={i}
              >
                <p className="sc-story-quote">{s.excerpt}</p>
                <div className="sc-story-meta">
                  <span className="sc-story-author">{s.author}</span>
                  <span className="sc-story-tags">
                    {s.city} · {s.generation}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
