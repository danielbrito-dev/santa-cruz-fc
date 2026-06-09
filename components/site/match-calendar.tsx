import { getTranslations } from 'next-intl/server';
import type { SectionProps } from './types';
import type { MatchItem } from '@/server/content/types';
import { resolveLocalized } from '@/server/content/localized';
import { MatchCalendarClient } from './match-calendar.client';

/** Card fixo de memória: 7×0 no Sport (1934) — escudo do Sport com tratamento de rival. */
function LegacyCard({ sportCrest }: { sportCrest: string | null }) {
  return (
    <article className="match match--legacy" data-comp="legacy">
      <div className="match-comp">
        <span className="badge">Clássico das Multidões</span>
        <span className="status legacy">1934</span>
      </div>
      <div className="match-rows">
        <div className="match-row">
          <div className="match-row-shield home">
            <img src="/images/logo.png" alt="Santa Cruz" />
          </div>
          <span className="match-row-name">
            <span className="club-full">Santa Cruz</span>
            <span className="club-short">Santa</span>
          </span>
          <span className="match-row-score">7</span>
        </div>
        <div className="match-row">
          <div className="match-row-shield has-crest is-rival">
            {sportCrest ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sportCrest} alt="Sport" />
            ) : (
              'SPT'
            )}
          </div>
          <span className="match-row-name">Sport</span>
          <span className="match-row-score">0</span>
        </div>
      </div>
    </article>
  );
}

function MatchCard({
  m,
  locale,
  opponentCrest,
  opponentRival,
  isNext,
}: {
  m: MatchItem;
  locale: string;
  opponentCrest?: string | null;
  opponentRival?: boolean;
  isNext?: boolean;
}) {
  // Row order: if isHome, Santa first then opponent; else opponent first then Santa.
  // First row always shows scoreHome; second row always shows scoreAway.
  const santaRow = (score: number | null) => (
    <div className="match-row">
      <div className="match-row-shield home">
        <img src="/images/logo.png" alt="Santa Cruz" />
      </div>
      <span className="match-row-name">
        <span className="club-full">Santa Cruz</span>
        <span className="club-short">Santa</span>
      </span>
      {score !== null && <span className="match-row-score">{score}</span>}
    </div>
  );

  const opponentRow = (score: number | null) => (
    <div className="match-row">
      <div className={`match-row-shield${opponentCrest ? ' has-crest' : ''}${opponentCrest && opponentRival ? ' is-rival' : ''}`}>
        {opponentCrest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={opponentCrest} alt={m.opponent} loading="lazy" />
        ) : (
          m.opponentShort
        )}
      </div>
      <span className="match-row-name">{m.opponent}</span>
      {score !== null && <span className="match-row-score">{score}</span>}
    </div>
  );

  return (
    <article className="match" data-comp={m.comp} data-next={isNext ? 'true' : undefined}>
      <div className="match-comp">
        <span className="badge">{m.competition}</span>
        <span className="status">{resolveLocalized(m.status, locale as 'pt' | 'en')}</span>
      </div>
      <div className="match-rows">
        {m.isHome ? (
          <>
            {santaRow(m.scoreHome)}
            {opponentRow(m.scoreAway)}
          </>
        ) : (
          <>
            {opponentRow(m.scoreHome)}
            {santaRow(m.scoreAway)}
          </>
        )}
      </div>
    </article>
  );
}

export async function MatchCalendar({ content, locale }: SectionProps) {
  const tCalendar = await getTranslations('calendar');
  const calendarTitle = tCalendar('title');

  // clube por sigla — escudo + flag de rival definidos uma vez em content.clubs
  const clubByShort = new Map((content.clubs ?? []).map((c) => [c.shortName, c]));
  const sportCrest = clubByShort.get('SPT')?.crestUrl ?? null;
  // próximo jogo = primeiro sem placar (não disputado)
  const nextIdx = content.matches.findIndex((m) => m.scoreHome === null && m.scoreAway === null);

  return (
    <div className="hero-calendar">
      <div className="hero-calendar-inner">
        <MatchCalendarClient
          calendarTitle={calendarTitle}
          labelPrev={tCalendar('prev')}
          labelNext={tCalendar('next')}
        >
          <LegacyCard sportCrest={sportCrest} />
          {content.matches.map((m, i) => {
            const club = clubByShort.get(m.opponentShort);
            return (
              <MatchCard
                key={m.id}
                m={m}
                locale={locale}
                opponentCrest={club?.crestUrl ?? null}
                opponentRival={club?.rival ?? false}
                isNext={i === nextIdx}
              />
            );
          })}
        </MatchCalendarClient>
      </div>
    </div>
  );
}
