import type { ReactNode } from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AdminNav } from './admin-nav';
import { LogoutButton } from './logout-button';
import { ThemeToggle } from '@/components/site/theme-toggle';

interface AdminShellProps {
  children: ReactNode;
  userName: string;
  userEmail: string;
}

export async function AdminShell({ children, userName, userEmail }: AdminShellProps) {
  const t = await getTranslations('admin');

  return (
    <div className="admin-shell">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="admin-sidebar" aria-label={t('title')}>
        {/* Brand row: escudo on white pill + label */}
        <div className="admin-brand">
          {/* White pill ensures escudo never sits directly on dark sidebar (BRAND.md §3) */}
          <div className="admin-brand-crest">
            <Image
              src="/images/logo.png"
              alt="Santa Cruz FC"
              width={50}
              height={50}
              priority
              /* No effects — BRAND.md §3 */
            />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-club">Santa Cruz FC</span>
            <span className="admin-brand-section">{t('title')}</span>
          </div>
        </div>

        {/* Nav links */}
        <AdminNav />

        {/* Sidebar footer: version / meta */}
        <div className="admin-sidebar-foot">
          <span className="admin-sidebar-ver">v0.1</span>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          {/* Mobile hamburger — triggers sidebar open via CSS checkbox hack */}
          <label htmlFor="admin-sidebar-toggle" className="admin-hamburger" aria-label="Menu">
            <span />
            <span />
            <span />
          </label>

          <div className="admin-topbar-spacer" />

          <div className="admin-topbar-right">
            <div className="admin-user">
              <div className="admin-user-avatar" aria-hidden="true">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{userName}</span>
                <span className="admin-user-email">{userEmail}</span>
              </div>
            </div>

            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Content */}
        <main className="admin-content" id="admin-content">
          {children}
        </main>
      </div>

      {/* Hidden checkbox for mobile sidebar toggle — no JS required */}
      <input type="checkbox" id="admin-sidebar-toggle" className="admin-sidebar-toggle-input" aria-hidden="true" />
      {/* Overlay to close sidebar on mobile */}
      <label htmlFor="admin-sidebar-toggle" className="admin-sidebar-overlay" aria-hidden="true" />
    </div>
  );
}
