import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { SectionProps } from './types';
import { resolveLocalized } from '@/server/content/localized';

export async function Footer({ content, locale }: SectionProps) {
  const t = await getTranslations('footer');
  const a11y = await getTranslations('a11y');
  const { footer } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand column */}
          <div className="footer-brand">
            <img src="/images/logo.png" alt="Santa Cruz FC" />
            <p>{resolveLocalized(footer.brandBlurb, locale)}</p>
          </div>

          {/* 3 link columns from content */}
          {footer.columns.map((col, i) => (
            <div key={i} className="footer-col">
              <h5>{resolveLocalized(col.heading, locale)}</h5>
              <ul>
                {col.links.map((link, j) => {
                  const label = resolveLocalized(link.label, locale);
                  return (
                    <li key={j}>
                      {link.url.startsWith('/') ? (
                        <Link href={link.url}>{label}</Link>
                      ) : (
                        <a href={link.url}>{label}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Apps column — em breve (desabilitado) */}
          <div className="footer-col footer-col--apps">
            <h5>{t('appsHeading')}</h5>
            <p className="footer-apps-blurb">{t('appsBlurb')}</p>
            <div className="footer-apps">
              <div className="footer-app footer-app--soon" aria-disabled="true" aria-label={`${a11y('appStore')} — ${t('appsSoon')}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div>
                  <span>{t('appStorePrefix')}</span>
                  <strong>App Store</strong>
                </div>
                <span className="footer-app-soon">{t('appsSoon')}</span>
              </div>
              <div className="footer-app footer-app--soon" aria-disabled="true" aria-label={`${a11y('googlePlay')} — ${t('appsSoon')}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734c0-.392.241-.736.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.197 2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.31 12l2.388-2.49zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z" />
                </svg>
                <div>
                  <span>{t('googlePlayPrefix')}</span>
                  <strong>Google Play</strong>
                </div>
                <span className="footer-app-soon">{t('appsSoon')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior: copyright + acesso administrativo */}
        <div className="footer-bottom">
          <span className="footer-copy">© {year} Santa Cruz Futebol Clube</span>
          <Link href="/entrar" className="footer-admin-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {t('adminAccess')}
          </Link>
        </div>
      </div>

      {/* Chant — OUTSIDE .container, sibling div inside <footer> */}
      <div className="footer-chant">
        <div className="container">
          <div className="chant-meta">
            {/* Stat 1: Desde 1914 */}
            <div className="chant-stat">
              <small>{t('since')}</small>
              <strong>1914</strong>
            </div>
            {/* Stat 2: Tri-Supercampeonato 1957·1976·1983 */}
            <div className="chant-stat chant-stat--tri">
              <small>Tri Super</small>
              <span className="stars">
                <i className="s s-black">&#9733;</i>
                <i className="s s-white">&#9733;</i>
                <i className="s s-red">&#9733;</i>
              </span>
              <strong>57 &middot; 76 &middot; 83</strong>
            </div>
            {/* Stat 3: Fita Azul 1979 */}
            <div className="chant-stat">
              <small>Fita Azul</small>
              <strong>1979</strong>
            </div>
          </div>

          <h3 className="chant">
            <span className="line">
              {resolveLocalized(footer.chantLine1, locale)}{' '}
              <em>{resolveLocalized(footer.chantEmphasis, locale)}</em>
            </span>
            <span className="line line-2">
              {resolveLocalized(footer.chantLine2, locale)}
            </span>
          </h3>
        </div>
      </div>
    </footer>
  );
}
