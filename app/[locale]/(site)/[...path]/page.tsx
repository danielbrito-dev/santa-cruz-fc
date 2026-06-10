import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
export const revalidate = 60;
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/lib/i18n/routing';
import { INFO_PAGE_PATHS, resolvePage } from '@/lib/site-nav';
import { getPageData, type EditorialData } from '@/lib/site-pages';
import { SiteShell } from '@/components/site/site-shell';
import { FanGate } from '@/components/site/fan-gate';
import { Editorial } from '@/components/site/pages/editorial';
import { Legal } from '@/components/site/pages/legal';
import { Faq } from '@/components/site/pages/faq';
import { Achievements } from '@/components/site/pages/achievements';
import { People } from '@/components/site/pages/people';
import { Locations } from '@/components/site/pages/locations';
import { Documents } from '@/components/site/pages/documents';
import { Gallery } from '@/components/site/pages/gallery';
import { Listing } from '@/components/site/pages/listing';
import { Landing } from '@/components/site/pages/landing';
import { FormPage } from '@/components/site/pages/form-page';
import { Stories } from '@/components/site/pages/stories';
import { Feature } from '@/components/site/pages/feature';

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

  const href = '/' + path.join('/');
  const common = { sectionKey: page.sectionKey, titleKey: page.titleKey, locale };

  // Fallback p/ páginas ainda sem conteúdo dedicado (fases B–D) — Editorial genérico.
  const fallback: EditorialData = {
    archetype: 'editorial',
    lead: 'Conteúdo em construção.',
    sections: [{ heading: 'Em breve', paragraphs: ['Esta página será preenchida em breve.'] }],
  };
  const data = getPageData(href) ?? fallback;

  let body: ReactNode;
  switch (data.archetype) {
    case 'legal':
      body = <Legal {...common} data={data} />;
      break;
    case 'faq':
      body = <Faq {...common} data={data} />;
      break;
    case 'achievements':
      body = <Achievements {...common} data={data} />;
      break;
    case 'people':
      body = <People {...common} data={data} />;
      break;
    case 'locations':
      body = <Locations {...common} data={data} />;
      break;
    case 'documents':
      body = <Documents {...common} data={data} />;
      break;
    case 'gallery':
      body = <Gallery {...common} data={data} />;
      break;
    case 'listing':
      body = <Listing {...common} data={data} />;
      break;
    case 'landing':
      body = <Landing {...common} data={data} />;
      break;
    case 'form':
      body = <FormPage sectionKey={page.sectionKey} titleKey={page.titleKey} data={data} />;
      break;
    case 'stories':
      body = <Stories {...common} data={data} />;
      break;
    case 'feature':
      body = <Feature {...common} data={data} />;
      break;
    case 'editorial':
      body = <Editorial {...common} data={data} />;
      break;
    default:
      body = <Editorial {...common} data={fallback} />;
  }

  return (
    <SiteShell locale={locale}>
      {FAN_GATED.has(href) && <FanGate next={href} />}
      {body}
    </SiteShell>
  );
}

// Páginas exclusivas do torcedor logado — sem sessão, redireciona pro login/cadastro.
const FAN_GATED = new Set(['/viva-o-santa/censo', '/viva-o-santa/experiencias', '/historias/enviar']);
