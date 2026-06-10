import { setRequestLocale, getTranslations, getFormatter } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/lib/i18n/routing';
import { Link } from '@/lib/i18n/navigation';
import site from '@/content/site.json';
import { readSiteContent } from '@/server/content/store';
import { resolveLocalized } from '@/server/content/localized';
import { SiteShell } from '@/components/site/site-shell';

export const revalidate = 60;

export function generateStaticParams() {
  // Build: slugs do JSON empacotado; novos posts renderizam on-demand (dynamicParams).
  const news = (site as { news: { slug: string; status: string }[] }).news;
  return routing.locales.flatMap((locale) =>
    news.filter((n) => n.status === 'published').map((n) => ({ locale, slug: n.slug })),
  );
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tCommon = await getTranslations('common');
  const format = await getFormatter();

  const content = await readSiteContent();
  const item = content.news.find((n) => n.slug === slug && n.status === 'published');
  if (!item) notFound();

  const date = format.dateTime(new Date(item.publishedAt), {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const body = resolveLocalized(item.body, locale);
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <SiteShell locale={locale}>
      <article className="news-article" data-section="midia">
        <header className="news-article-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.coverImage} alt={resolveLocalized(item.title, locale)} />
          <div className="news-article-hero-grad" aria-hidden="true" />
          <div className="container news-article-hero-body">
            <span className="news-article-tag">{resolveLocalized(item.tag, locale)}</span>
            <h1>{resolveLocalized(item.title, locale)}</h1>
            <time dateTime={item.publishedAt}>{date}</time>
          </div>
        </header>

        <div className="container news-article-body">
          {resolveLocalized(item.excerpt, locale) && (
            <p className="news-article-lead">{resolveLocalized(item.excerpt, locale)}</p>
          )}
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <Link href="/midia/noticias" className="news-article-back">
            ← {tCommon('allNews')}
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
