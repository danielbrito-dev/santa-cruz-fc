import { getTranslations } from 'next-intl/server';
import type { SectionProps } from './types';
import type { MatchItem } from '@/server/content/types';
import { resolveLocalized } from '@/server/content/localized';
import { MatchCalendarClient } from './match-calendar.client';

function MatchCard({
  m,
  locale,
  matchCenterLabel,
}: {
  m: MatchItem;
  locale: string;
  matchCenterLabel: string;
}) {
  // Row order: if isHome, Santa first then opponent; else opponent first then Santa.
  // First row always shows scoreHome; second row always shows scoreAway.
  const santaRow = (score: number | null) => (
    <div className="match-row">
      <div className="match-row-shield home">
        <img src="/images/logo.png" alt="Santa" />
      </div>
      <span className="match-row-name">Santa</span>
      {score !== null && <span className="match-row-score">{score}</span>}
    </div>
  );

  const opponentRow = (score: number | null) => (
    <div className="match-row">
      <div className="match-row-shield">{m.opponentShort}</div>
      <span className="match-row-name">{m.opponent}</span>
      {score !== null && <span className="match-row-score">{score}</span>}
    </div>
  );

  return (
    <article className="match" data-comp={m.comp}>
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
      <a href={m.matchCenterUrl} className="match-center">
        {matchCenterLabel}
      </a>
    </article>
  );
}

export async function MatchCalendar({ content, locale }: SectionProps) {
  const tCalendar = await getTranslations('calendar');
  const tCommon = await getTranslations('common');
  const calendarTitle = tCalendar('title');
  const matchCenterLabel = tCommon('matchCenter');

  return (
    <div className="hero-calendar">
      <div className="hero-calendar-inner">
        <MatchCalendarClient
          calendarTitle={calendarTitle}
          labelPrev="Anterior"
          labelNext="Próximo"
        >
          {content.matches.map((m) => (
            <MatchCard
              key={m.id}
              m={m}
              locale={locale}
              matchCenterLabel={matchCenterLabel}
            />
          ))}
        </MatchCalendarClient>
      </div>
    </div>
  );
}
