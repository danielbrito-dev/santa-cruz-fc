import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { resolveLocalized } from '@/server/content/localized';
import type { Squad, PlayerGroup, Player } from '@/server/squad/squad';

function PlayerSilhouette() {
  return (
    <span className="player-silhouette" aria-hidden="true">
      <svg viewBox="0 0 100 110" fill="currentColor" preserveAspectRatio="xMidYMax meet">
        <circle cx="50" cy="32" r="21" />
        <path d="M4 110c2-27 22-46 46-46s44 19 46 46Z" />
      </svg>
    </span>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="player-card" data-empty={player.photo ? undefined : 'true'}>
      <div className="player-photo">
        {player.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo} alt={player.name} />
        ) : (
          <PlayerSilhouette />
        )}
      </div>
      <div className="player-bar">
        <span className="player-num">{player.number}</span>
        <h3 className="player-name">{player.name}</h3>
      </div>
    </article>
  );
}

export async function SquadPage({
  squad,
  groups,
  locale,
}: {
  squad: Squad;
  groups: PlayerGroup[];
  locale: Locale;
}) {
  const t = await getTranslations('squad');
  const total = squad.players.length;

  return (
    <div className="squad">
      {/* HERO — light band (mirrors the home hero so the fixed header reads identically) */}
      <header className="squad-hero">
        <div className="container squad-hero-inner">
          <div className="squad-hero-shield">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Escudo Santa Cruz FC" />
          </div>
          <div className="squad-hero-text">
            <span className="squad-eyebrow">{t('season', { year: squad.season })}</span>
            <h1 className="squad-title">{t('title')}</h1>
            <p className="squad-subtitle">{t('subtitle')}</p>
          </div>
          <div className="squad-hero-stats">
            <div className="squad-stat">
              <strong>{total}</strong>
              <small>{t('athletes')}</small>
            </div>
            <div className="squad-stat">
              <strong>{groups.length}</strong>
              <small>{t('positions')}</small>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY POSITION NAV */}
      <nav className="squad-nav" aria-label={t('navLabel')}>
        <div className="container squad-nav-inner">
          {groups.map((g) => (
            <a key={g.key} href={`#g-${g.key}`}>
              {t(g.key)}
            </a>
          ))}
          {squad.staff.length > 0 && <a href="#comissao">{t('staffHeading')}</a>}
        </div>
      </nav>

      {/* BODY — dark "stadium" canvas (same surface as the home news/institutional sections) */}
      <div className="squad-body">
        <div className="container">
          {groups.map((g, i) => (
            <section key={g.key} id={`g-${g.key}`} className="squad-group">
              <div className="squad-group-head">
                <span className="squad-group-index">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="squad-group-title">{t(g.key)}</h2>
                <span className="squad-group-count">{g.players.length}</span>
              </div>
              <div className="squad-grid">
                {g.players.map((p) => (
                  <PlayerCard key={`${p.group}-${p.number}`} player={p} />
                ))}
              </div>
            </section>
          ))}

          {squad.staff.length > 0 && (
            <section id="comissao" className="squad-staff">
              <h2 className="squad-staff-title">{t('staffHeading')}</h2>
              <div className="staff-grid">
                {squad.staff.map((m, i) => (
                  <div key={i} className="staff-card">
                    <span className="staff-role">{resolveLocalized(m.role, locale)}</span>
                    <span className="staff-name">{m.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
