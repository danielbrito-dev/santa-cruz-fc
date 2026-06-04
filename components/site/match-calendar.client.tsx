'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';

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
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const syncButtons = useCallback(() => {
    const cal = carouselRef.current;
    const prev = prevRef.current;
    const next = nextRef.current;
    if (!cal || !prev || !next) return;
    const maxScroll = cal.scrollWidth - cal.clientWidth - 2;
    prev.disabled = cal.scrollLeft <= 1;
    next.disabled = cal.scrollLeft >= maxScroll;
  }, []);

  const getStep = useCallback(() => {
    const cal = carouselRef.current;
    if (!cal) return 240;
    const card = cal.querySelector<HTMLElement>('.match');
    if (!card) return 240;
    const cs = getComputedStyle(cal);
    const gap = parseFloat(cs.gap) || 10;
    return (card.getBoundingClientRect().width + gap) * 2;
  }, []);

  useEffect(() => {
    const cal = carouselRef.current;
    if (!cal) return;
    const onScroll = () => requestAnimationFrame(syncButtons);
    cal.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncButtons);
    syncButtons();
    return () => {
      cal.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncButtons);
    };
  }, [syncButtons]);

  const handlePrev = () => {
    carouselRef.current?.scrollBy({ left: -getStep(), behavior: 'smooth' });
  };

  const handleNext = () => {
    carouselRef.current?.scrollBy({ left: getStep(), behavior: 'smooth' });
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
            ref={prevRef}
            className="cal-btn"
            aria-label={labelPrev}
            disabled
            onClick={handlePrev}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            ref={nextRef}
            className="cal-btn"
            aria-label={labelNext}
            onClick={handleNext}
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
