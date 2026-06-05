'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

const THRESHOLD = 80;
const DELTA = 6;

export function HeaderClient() {
  const nav = useTranslations('nav');
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
          // scrolling down → hide (only if drawer is closed)
          if (!drawerOpen) header.classList.add('hide');
        } else {
          // scrolling up → show
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
            <a href="#noticias" className="header-link hide-mobile">
              {nav('news')}
            </a>
            <a href="#calendario" className="header-link hide-mobile">
              {nav('calendar')}
            </a>
            <a href="#" className="header-link hide-mobile">
              {nav('tvCoral')}
            </a>
          </div>

          <div className="header-right">
            <Link href="/entrar" className="header-link hide-mobile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
              {nav('login')}
            </Link>
            <a href="#" className="header-link hide-mobile">
              {nav('tickets')}
            </a>
            <a href="#" className="header-link hide-mobile">
              {nav('shop')}
            </a>
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
      <aside
        className={`drawer${drawerOpen ? ' open' : ''}`}
        aria-label="Menu principal"
      >
        <div className="drawer-head">
          <Link href="/">
            <img src="/images/logo.png" alt="Santa Cruz FC" />
          </Link>
          <button
            className="drawer-close"
            aria-label={a11y('closeMenu')}
            onClick={closeDrawer}
          >
            ✕
          </button>
        </div>

        <nav className="drawer-nav">
          {/* Início */}
          <div className="drawer-item">
            <a href="#" className="drawer-item-trigger" style={{ display: 'flex' }}>
              {drawer('home')}
            </a>
          </div>

          {/* Clube */}
          <div className={`drawer-item${openSections.club ? ' open' : ''}`}>
            <button
              className="drawer-item-trigger"
              aria-expanded={!!openSections.club}
              onClick={() => toggleSection('club')}
            >
              {drawer('sections.club')}
              <span className="chevron" />
            </button>
            <div className="drawer-sub">
              <a href="#historia" onClick={handleDrawerLinkClick}>
                {drawer('items.history')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.board')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.symbols')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.stadium')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.council')}
              </a>
            </div>
          </div>

          {/* Futebol */}
          <div className={`drawer-item${openSections.football ? ' open' : ''}`}>
            <button
              className="drawer-item-trigger"
              aria-expanded={!!openSections.football}
              onClick={() => toggleSection('football')}
            >
              {drawer('sections.football')}
              <span className="chevron" />
            </button>
            <div className="drawer-sub">
              <a href="#elenco" onClick={handleDrawerLinkClick}>
                {drawer('items.squad')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.coachingStaff')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.youth')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.women')}
              </a>
            </div>
          </div>

          {/* Marketing */}
          <div className={`drawer-item${openSections.marketing ? ' open' : ''}`}>
            <button
              className="drawer-item-trigger"
              aria-expanded={!!openSections.marketing}
              onClick={() => toggleSection('marketing')}
            >
              {drawer('sections.marketing')}
              <span className="chevron" />
            </button>
            <div className="drawer-sub">
              <a
                href="https://socio-santacruz.futebolcard.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDrawerLinkClick}
              >
                {drawer('items.member')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.shop')}
              </a>
              <a href="#patrocinadores" onClick={handleDrawerLinkClick}>
                {drawer('items.sponsors')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.licensed')}
              </a>
            </div>
          </div>

          {/* Imprensa */}
          <div className={`drawer-item${openSections.press ? ' open' : ''}`}>
            <button
              className="drawer-item-trigger"
              aria-expanded={!!openSections.press}
              onClick={() => toggleSection('press')}
            >
              {drawer('sections.press')}
              <span className="chevron" />
            </button>
            <div className="drawer-sub">
              <a href="#noticias" onClick={handleDrawerLinkClick}>
                {drawer('items.news')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.tvCoral')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.gallery')}
              </a>
              <a href="#" onClick={handleDrawerLinkClick}>
                {drawer('items.pressContact')}
              </a>
            </div>
          </div>

          {/* Contato */}
          <div className="drawer-item">
            <a href="#" className="drawer-item-trigger" style={{ display: 'flex' }}>
              {drawer('contact')}
            </a>
          </div>

          {/* Entrar (login) — gives mobile users a path to /entrar */}
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
          <a href="#" className="outline" onClick={handleDrawerLinkClick}>
            {nav('tickets')}
            <span>→</span>
          </a>
        </div>
      </aside>
    </>
  );
}
