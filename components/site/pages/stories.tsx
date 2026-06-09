import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { StoriesData } from '@/lib/site-pages';

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
    <div className="stories">
      <header className="stories-head">
        <div className="container">
          <span className="stories-eyebrow">{t(sectionKey)}</span>
          <h1 className="stories-title">{t(titleKey)}</h1>
          <p className="stories-lead">{data.lead}</p>
          <Link className="stories-cta" href="/historias/enviar">
            {p('sendStory')} →
          </Link>
        </div>
      </header>

      <div className="stories-body">
        <div className="container">
          <div className="stories-grid">
            {list.map((s, i) => (
              <article className="story-card" key={i}>
                <p className="story-quote">“{s.excerpt}”</p>
                <div className="story-meta">
                  <span className="story-author">{s.author}</span>
                  <span className="story-tags">
                    {s.city} · {s.generation}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
