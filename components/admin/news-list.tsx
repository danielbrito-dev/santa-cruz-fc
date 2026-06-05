import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { NewsItem } from '@/server/content/types';
import { DeleteNewsButton } from './delete-news-button';
import { ArchiveNewsButton } from './archive-news-button';

interface NewsListProps {
  items: NewsItem[];
  locale: string;
}

function resolveLocalized(text: Record<string, string>, locale: string): string {
  return text[locale] ?? text['pt'] ?? Object.values(text)[0] ?? '';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
}

export async function NewsList({ items, locale }: NewsListProps) {
  const t = await getTranslations('admin');

  if (items.length === 0) {
    return (
      <div className="admin-news-empty">
        <svg
          viewBox="0 0 24 24"
          width="40"
          height="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="admin-news-empty-icon"
        >
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
        </svg>
        <p>{t('newsEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="admin-news-list">
      <div className="admin-news-list-head">
        <span>{t('colArticle')}</span>
        <span>{t('colTag')}</span>
        <span>{t('colStatus')}</span>
        <span>{t('colDate')}</span>
        <span aria-label={t('colActions')}></span>
      </div>
      {items.map((item) => {
        const title = resolveLocalized(item.title, locale);
        const tag = resolveLocalized(item.tag, locale);
        const isPublished = item.status === 'published';
        const isArchived = item.status === 'archived';

        const badgeClass = isPublished
          ? 'admin-badge--published'
          : isArchived
            ? 'admin-badge--archived'
            : 'admin-badge--draft';
        const badgeLabel = isPublished
          ? t('statusPublished')
          : isArchived
            ? t('statusArchived')
            : t('statusDraft');

        return (
          <div key={item.id} className="admin-news-row">
            {/* Cover + title */}
            <div className="admin-news-row-article">
              <div className="admin-news-row-thumb">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverImage}
                    alt=""
                    aria-hidden="true"
                    className="admin-news-thumb-img"
                  />
                ) : (
                  <div className="admin-news-thumb-placeholder" aria-hidden="true" />
                )}
              </div>
              <div className="admin-news-row-meta">
                <span className="admin-news-row-title">
                  {title || <em className="admin-news-no-title">Sem título</em>}
                  {item.featured && (
                    <span
                      className="admin-news-featured-star"
                      title={t('featured')}
                      aria-label={t('featured')}
                    >
                      ★
                    </span>
                  )}
                </span>
                <span className="admin-news-row-slug">{item.slug}</span>
              </div>
            </div>

            {/* Tag */}
            <div className="admin-news-row-tag">
              {tag && <span className="admin-news-tag-pill">{tag}</span>}
            </div>

            {/* Status badge */}
            <div className="admin-news-row-status">
              <span className={`admin-badge ${badgeClass}`}>{badgeLabel}</span>
            </div>

            {/* Date */}
            <div className="admin-news-row-date">
              <span>{formatDate(item.publishedAt)}</span>
            </div>

            {/* Actions */}
            <div className="admin-news-row-actions">
              <Link
                href={`/${locale}/admin/noticias/${item.id}`}
                className="admin-btn admin-btn--ghost admin-btn--sm"
              >
                {t('newsEdit')}
              </Link>
              <ArchiveNewsButton
                id={item.id}
                isArchived={isArchived}
                labelArchive={t('archive')}
                labelRestore={t('restore')}
              />
              <DeleteNewsButton id={item.id} label={t('delete')} confirmMsg={t('deleteConfirm')} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
