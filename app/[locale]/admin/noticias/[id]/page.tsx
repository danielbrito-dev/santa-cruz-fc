import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { readSiteContent } from '@/server/content/store';
import { NewsForm } from '@/components/admin/news-form';

export default async function AdminEditNoticiaPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const content = await readSiteContent();
  const item = content.news.find((n) => n.id === id);
  if (!item) notFound();

  return <NewsForm locale={locale} initial={item} />;
}
