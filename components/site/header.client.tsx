'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';
import { SITE_NAV } from '@/lib/site-nav';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

const THRESHOLD = 80;
const DELTA = 6;

export function HeaderClient() {
  const nav = useTranslations('nav');
  const menu = useTranslations('menu');
  const drawer = useTranslations('drawer');
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');

  // For drawer locale switcher on mobile
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const headerRef = useRef<HTMLElement>(null);

  // Smart header scroll behavior
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function syncHeader() {
      const header = headerRef.current;
      if (!header) return;

      const y = window.scrollY;
      const delta = y - lastY;

      header.classList.toggle('scrolled', y > THRESHOLD);

      if (y > THRESHOLD && Math.abs(delta) > DELTA) {
        if (delta > 0) {
          if (!drawerOpen) header.classList.add('hide');
        } else {
          header.classList.remove('hide');
        }
      }
      if (y <= THRESHOLD) header.classList.remove('hide');

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(syncHeader);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [drawerOpen]);

  // Escape key closes drawer
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Toggle body no-scroll
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [drawerOpen]);

  function openDrawer() {
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleDrawerLinkClick() {
    setTimeout(closeDrawer, 100);
  }

  return (
    <>
      {/* HEADER */}
      <header className="site-header" ref={headerRef}>
        <div className="header-inner">
          <div className="header-left">
            <button
              className="menu-trigger"
              aria-label={a11y('openMenu')}
              aria-expanded={drawerOpen}
              onClick={openDrawer}
            >
              <span className="bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="label">{nav('menu')}</span>
            </button>
            <Link href="/" className="header-logo">
              <img src="/images/logo.png" alt="Escudo Santa Cruz FC" />
            </Link>

            {/* Desktop nav — the 6 sections, each a hover/focus dropdown */}
            <nav className="header-nav hide-mobile" aria-label="Menu principal">
              {SITE_NAV.map((section) => (
                <div className="header-nav-item" key={section.key}>
                  <button type="button" className="header-nav-label" aria-haspopup="true">
                    {menu(section.key)}
                  </button>
                  <div className="header-dropdown" role="menu">
                    {section.items.map((it) => (
                      <Link
                        key={it.key}
                        href={it.href}
                        className="header-dropdown-link"
                        role="menuitem"
                      >
                        {menu(it.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="header-right">
            <Link href="/entrar" className="header-link hide-mobile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
              {nav('login')}
            </Link>
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      {/* DRAWER OVERLAY */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* DRAWER */}
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-label="Menu principal">
        <div className="drawer-head">
          <Link href="/">
            <img src="/images/logo.png" alt="Santa Cruz FC" />
          </Link>
          <button className="drawer-close" aria-label={a11y('closeMenu')} onClick={closeDrawer}>
            ✕
          </button>
        </div>

        <nav className="drawer-nav">
          {SITE_NAV.map((section) => (
            <div
              key={section.key}
              className={`drawer-item${openSections[section.key] ? ' open' : ''}`}
            >
              <button
                className="drawer-item-trigger"
                aria-expanded={!!openSections[section.key]}
                onClick={() => toggleSection(section.key)}
              >
                {menu(section.key)}
                <span className="chevron" />
              </button>
              <div className="drawer-sub">
                {section.items.map((it) => (
                  <Link key={it.key} href={it.href} onClick={handleDrawerLinkClick}>
                    {menu(it.key)}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Entrar (login) — caminho para o admin no mobile */}
          <div className="drawer-item">
            <Link
              href="/entrar"
              className="drawer-item-trigger"
              style={{ display: 'flex' }}
              onClick={handleDrawerLinkClick}
            >
              {nav('login')}
            </Link>
          </div>
        </nav>

        {/* Drawer controls: theme toggle + language selector — shown on mobile only via CSS */}
        <div className="drawer-controls">
          <div className="drawer-controls-row">
            <span className="drawer-controls-label">{drawer('themeLabel')}</span>
            <ThemeToggle />
          </div>
          <div className="drawer-controls-row">
            <span className="drawer-controls-label">{drawer('langLabel')}</span>
            <div className="drawer-lang-btns">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  className={`drawer-lang-btn${l === locale ? ' active' : ''}`}
                  aria-current={l === locale ? 'true' : undefined}
                  onClick={() => {
                    router.replace(pathname, { locale: l });
                    setTimeout(closeDrawer, 100);
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="drawer-foot">
          <a
            href="https://socio-santacruz.futebolcard.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="primary"
            onClick={handleDrawerLinkClick}
          >
            {common('becomeMember')}
            <span>→</span>
          </a>
        </div>
      </aside>
    </>
  );
}
