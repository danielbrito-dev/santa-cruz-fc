import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/routing';

/** /noticias → a listagem oficial vive em /midia/noticias. */
export default async function NoticiasIndex({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect(`/${locale}/midia/noticias`);
}
