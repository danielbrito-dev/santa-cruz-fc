'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';

const THRESHOLD = 80;
const DELTA = 6;

export function HeaderClient() {
  const nav = useTranslations('nav');
  const drawer = useTranslations('drawer');
  const common = useTranslations('common');

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
              aria-label="Abrir menu"
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
            <a href="#" className="header-link hide-mobile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
              {nav('login')}
            </a>
            <a href="#" className="header-link hide-mobile">
              {nav('tickets')}
            </a>
            <a href="#" className="header-link hide-mobile">
              {nav('shop')}
            </a>
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
            aria-label="Fechar menu"
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
              onClick={() => toggleSection('marketing')}
            >
              {drawer('sections.marketing')}
              <span className="chevron" />
            </button>
            <div className="drawer-sub">
              <a
                href="https://socio-santacruz.futebolcard.com/"
                target="_blank"
                rel="noreferrer"
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
        </nav>

        <div className="drawer-foot">
          <a
            href="https://socio-santacruz.futebolcard.com/"
            target="_blank"
            rel="noreferrer"
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
