import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/lib/i18n/routing';
import { INFO_PAGE_PATHS, resolvePage } from '@/lib/site-nav';
import { SiteShell } from '@/components/site/site-shell';
import { InfoPage } from '@/components/site/info-page';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    INFO_PAGE_PATHS.map((path) => ({ locale, path })),
  );
}

export default async function InternalPage({
  params,
}: {
  params: Promise<{ locale: Locale; path: string[] }>;
}) {
  const { locale, path } = await params;
  setRequestLocale(locale);

  const page = resolvePage(path);
  if (!page) notFound();

  return (
    <SiteShell locale={locale}>
      <InfoPage sectionKey={page.sectionKey} titleKey={page.titleKey} locale={locale} />
    </SiteShell>
  );
}
