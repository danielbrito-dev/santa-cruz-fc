import { setRequestLocale } from 'next-intl/server';
import { NewsForm } from '@/components/admin/news-form';

export default async function AdminNovaNoticiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewsForm locale={locale} />;
}
