'use client';

import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';

interface MatchCalendarClientProps {
  calendarTitle: string;
  labelPrev: string;
  labelNext: string;
  children: ReactNode;
}

export function MatchCalendarClient({
  calendarTitle,
  labelPrev,
  labelNext,
  children,
}: MatchCalendarClientProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  // disabled controlado por estado (React) — evita conflito com manipulação direta do DOM
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const sync = useCallback(() => {
    const cal = carouselRef.current;
    if (!cal) return;
    const maxScroll = cal.scrollWidth - cal.clientWidth - 2;
    setCanPrev(cal.scrollLeft > 1);
    setCanNext(cal.scrollLeft < maxScroll);
  }, []);

  const step = useCallback(() => {
    const cal = carouselRef.current;
    if (!cal) return 240;
    const card = cal.querySelector<HTMLElement>('.match');
    const gap = parseFloat(getComputedStyle(cal).gap) || 10;
    return card ? (card.getBoundingClientRect().width + gap) * 2 : 240;
  }, []);

  useEffect(() => {
    const cal = carouselRef.current;
    if (!cal) return;
    const onScroll = () => requestAnimationFrame(sync);
    cal.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sync);
    // centraliza no próximo jogo (primeiro card marcado com data-next)
    const next = cal.querySelector<HTMLElement>('[data-next]');
    if (next) {
      const calRect = cal.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      cal.scrollLeft += nextRect.left - calRect.left - (cal.clientWidth - next.offsetWidth) / 2;
    }
    sync();
    return () => {
      cal.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const scroll = (dir: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };

  return (
    <>
      <div className="hero-calendar-head">
        <div className="hero-calendar-title">
          <span className="dot" />
          {calendarTitle}
        </div>
        <div className="cal-controls">
          <button
            className="cal-btn"
            aria-label={labelPrev}
            disabled={!canPrev}
            onClick={() => scroll(-1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="cal-btn"
            aria-label={labelNext}
            disabled={!canNext}
            onClick={() => scroll(1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="carousel-wrap">
        <div className="carousel" ref={carouselRef}>
          {children}
        </div>
      </div>
    </>
  );
}
