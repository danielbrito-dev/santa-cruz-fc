import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { LoginForm } from '@/components/auth/login-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  const siteName = 'Santa Cruz FC';
  return {
    title: `${t('title')} — ${siteName}`,
  };
}

export default async function EntrarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <main className="login-page">
      {/* Subtle top accent strip */}
      <div className="login-accent-strip" aria-hidden="true" />

      <div className="login-card">
        {/* Escudo — ≥50px, no effects (BRAND.md §3) */}
        <div className="login-crest-wrap">
          <img
            src="/images/logo.png"
            alt="Santa Cruz FC"
            className="login-crest"
            width={72}
            height={72}
          />
        </div>

        <hgroup className="login-hgroup">
          <h1 className="login-title">{t('title')}</h1>
          <p className="login-subtitle">{t('subtitle')}</p>
        </hgroup>

        <LoginForm />

        <Link href="/" className="login-back-link">
          ← {t('backToSite')}
        </Link>
      </div>
    </main>
  );
}
