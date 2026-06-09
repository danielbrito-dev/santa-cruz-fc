import type { ReactNode } from 'react';
import { getServerApi } from '@/lib/trpc/server';
import type { Locale } from '@/lib/i18n/routing';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { FooterParallax } from '@/components/site/footer.client';
import { SvgFilters } from '@/components/site/svg-filters';

/**
 * Common chrome for internal pages: fixed Header + main + parallax Footer.
 * Fetches site content for the footer so route files stay tiny.
 */
export async function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const api = await getServerApi();
  const content = await api.content.site();
  return (
    <>
      <SvgFilters />
      <Header />
      <main>{children}</main>
      <Footer content={content} locale={locale} />
      <FooterParallax />
    </>
  );
}
