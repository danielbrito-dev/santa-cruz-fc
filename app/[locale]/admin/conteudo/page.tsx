import { setRequestLocale, getTranslations } from 'next-intl/server';
import { readSiteContent } from '@/server/content/store';
import { ContentEditor } from '@/components/admin/content-editor';

export default async function AdminConteudoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const content = await readSiteContent();

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('contentTitle')}</h1>
        <p className="admin-page-sub">{t('contentIntro')}</p>
      </div>
      <ContentEditor initial={content} />
    </div>
  );
}
