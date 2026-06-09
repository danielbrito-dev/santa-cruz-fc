import { setRequestLocale } from 'next-intl/server';
import { EDITABLE_PAGES, getEditablePage } from '@/lib/site-pages';
import { PaginasAdmin, type EditablePage } from '@/components/admin/paginas-admin';

export default async function AdminPaginasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const pages: EditablePage[] = EDITABLE_PAGES.flatMap((p) => {
    const e = getEditablePage(p.href);
    return e ? [{ href: p.href, title: e.title, lead: e.lead, sections: e.sections }] : [];
  });
  return <PaginasAdmin pages={pages} />;
}
