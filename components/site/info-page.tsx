import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';

const LOREM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
];

/**
 * Generic internal content page (placeholder/lorem). Hero band (themed via tokens
 * so the fixed header reads in both light and dark) + a readable prose body.
 */
export async function InfoPage({
  sectionKey,
  titleKey,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
}) {
  const t = await getTranslations('menu');

  return (
    <div className="info-page">
      <header className="info-hero">
        <div className="container">
          <nav className="info-breadcrumb" aria-label="breadcrumb">
            <span>{t(sectionKey)}</span>
            <span className="info-breadcrumb-sep">/</span>
            <span className="info-breadcrumb-current">{t(titleKey)}</span>
          </nav>
          <h1 className="info-title">{t(titleKey)}</h1>
          <p className="info-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit — conteúdo em construção.
          </p>
        </div>
      </header>

      <div className="info-body">
        <div className="container">
          <article className="info-prose">
            {LOREM.map((p, i) => (
              <p key={`a${i}`}>{p}</p>
            ))}
            <h2>Lorem ipsum</h2>
            {LOREM.map((p, i) => (
              <p key={`b${i}`}>{p}</p>
            ))}
          </article>
        </div>
      </div>

      {/* keeps short pages tall enough so the parallax footer reveals only on scroll */}
      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
