import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import { resolveLocalized } from '@/server/content/localized';
import type { Player } from '@/server/squad/squad';

function AthleteSilhouette() {
  return (
    <span className="athlete-silhouette" aria-hidden="true">
      <svg viewBox="0 0 100 120" fill="currentColor" preserveAspectRatio="xMidYMax meet">
        <circle cx="50" cy="34" r="22" />
        <path d="M2 120c2-34 24-56 48-56s46 22 48 56Z" />
      </svg>
    </span>
  );
}

export async function AthletePage({ player, locale }: { player: Player; locale: Locale }) {
  const t = await getTranslations('squad');

  const parts = player.name.trim().split(/\s+/);
  const firstName = parts[0];
  const surname = parts.slice(1).join(' ');

  const details: { label: string; value: string }[] = [
    { label: t('lblNumber'), value: String(player.number) },
    { label: t('lblNationality'), value: player.country },
  ];
  if (player.birthDate) details.push({ label: t('lblBirth'), value: player.birthDate });
  if (player.birthPlace) details.push({ label: t('lblBirthPlace'), value: player.birthPlace });
  if (player.height) details.push({ label: t('lblHeight'), value: player.height });
  if (player.joinedAt) details.push({ label: t('lblJoined'), value: player.joinedAt });

  const bioParas = player.bio
    ? resolveLocalized(player.bio, locale).split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="athlete">
      {/* HERO — name + number + photo */}
      <section className="athlete-hero">
        <div className="container athlete-hero-inner">
          <div className="athlete-hero-text">
            <Link href="/elenco" className="athlete-back">
              ← {t('backToSquad')}
            </Link>
            <span className="athlete-pos">{t(`pos.${player.group}`)}</span>
            <h1 className="athlete-name">
              {surname ? (
                <>
                  <span className="athlete-name-first">{firstName}</span>
                  <span className="athlete-name-last">{surname}</span>
                </>
              ) : (
                <span className="athlete-name-last">{firstName}</span>
              )}
            </h1>
            <span className="athlete-number" aria-hidden="true">
              {player.number}
            </span>
          </div>
          <div className="athlete-photo">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt={player.name} />
            ) : (
              <AthleteSilhouette />
            )}
          </div>
        </div>
      </section>

      {/* DATA STRIP */}
      <section className="athlete-detail">
        <div className="container athlete-detail-grid">
          {details.map((d, i) => (
            <div key={i} className="athlete-detail-item">
              <strong>{d.value}</strong>
              <small>{d.label}</small>
            </div>
          ))}
        </div>
      </section>

      {/* BIOGRAPHY */}
      {bioParas.length > 0 && (
        <section className="athlete-bio">
          <div className="container">
            <h2 className="athlete-bio-title">
              {t('biography')} <em>— {player.name}</em>
            </h2>
            <div className="athlete-bio-text">
              {bioParas.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* fills remaining viewport height so the parallax footer stays hidden until scroll */}
      <div className="athlete-fill" aria-hidden="true" />
    </div>
  );
}
