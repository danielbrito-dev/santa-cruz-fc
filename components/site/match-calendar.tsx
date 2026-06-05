import { getTranslations } from 'next-intl/server';
import type { SectionProps } from './types';
import type { MatchItem } from '@/server/content/types';
import { resolveLocalized } from '@/server/content/localized';
import { MatchCalendarClient } from './match-calendar.client';

function MatchCard({
  m,
  locale,
}: {
  m: MatchItem;
  locale: string;
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
    </article>
  );
}

export async function MatchCalendar({ content, locale }: SectionProps) {
  const tCalendar = await getTranslations('calendar');
  const calendarTitle = tCalendar('title');

  return (
    <div className="hero-calendar">
      <div className="hero-calendar-inner">
        <MatchCalendarClient
          calendarTitle={calendarTitle}
          labelPrev={tCalendar('prev')}
          labelNext={tCalendar('next')}
        >
          {content.matches.map((m) => (
            <MatchCard
              key={m.id}
              m={m}
              locale={locale}
            />
          ))}
        </MatchCalendarClient>
      </div>
    </div>
  );
}
