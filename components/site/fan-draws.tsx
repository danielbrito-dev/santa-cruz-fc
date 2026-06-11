'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { FanDraw } from '@/server/content/draw-store';
import { subscribeToDraw } from '@/server/content/draw-actions';

/** Lista de sorteios para o torcedor — inscrição com desafio dinâmico opcional. */
export function FanDraws({ draws }: { draws: FanDraw[] }) {
  const t = useTranslations('fanDraw');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [err, setErr] = useState<number | null>(null);

  function subscribe(d: FanDraw) {
    const a = answers[d.id] ?? d.myAnswer ?? '';
    if (d.prompt && !a.trim()) { setErr(d.id); return; }
    setErr(null);
    start(async () => {
      const res = await subscribeToDraw(d.id, a);
      if (res.ok) {
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[d.id];
          return next;
        });
        router.refresh();
      } else setErr(d.id);
    });
  }

  if (draws.length === 0) return <p className="fdr-empty">{t('empty')}</p>;

  return (
    <div className="fdr-list">
      {draws.map((d) => (
        <article key={d.id} className={`fdr-card${d.status !== 'aberto' ? ' fdr-card--closed' : ''}`}>
          <header className="fdr-head">
            <span className={`fdr-badge${d.status === 'aberto' ? ' is-open' : ''}`}>
              {d.status === 'aberto' ? t('open') : t('drawn')}
            </span>
            <h2 className="fdr-title">{d.title}</h2>
            <p className="fdr-prize">🏆 {d.prize}</p>
          </header>

          {d.status === 'aberto' ? (
            d.subscribed && !(d.id in answers) ? (
              <div className="fdr-done">
                <p className="fdr-ok">{t('subscribed')}</p>
                {d.prompt && d.myAnswer && <p className="fdr-myanswer">“{d.myAnswer}”</p>}
                {d.prompt && (
                  <button type="button" className="fan-btn fan-btn--ghost" onClick={() => setAnswers((a) => ({ ...a, [d.id]: d.myAnswer ?? '' }))}>
                    {t('editAnswer')}
                  </button>
                )}
              </div>
            ) : (
              <div className="fdr-join">
                {d.prompt && (
                  <label className="fan-field">
                    <span>{d.prompt}</span>
                    <textarea
                      rows={3}
                      maxLength={600}
                      value={answers[d.id] ?? d.myAnswer ?? ''}
                      onChange={(e) => { setAnswers((a) => ({ ...a, [d.id]: e.target.value })); setErr(null); }}
                      placeholder={t('answerPh')}
                    />
                  </label>
                )}
                {err === d.id && <p className="fdr-err" role="alert">{t('answerRequired')}</p>}
                <button type="button" className="fan-btn" onClick={() => subscribe(d)} disabled={isPending}>
                  {isPending ? t('sending') : d.subscribed ? t('updateEntry') : t('join')}
                </button>
              </div>
            )
          ) : (
            d.winners && (
              <div className="fdr-winners">
                <h3>{t('winners')}</h3>
                <ol>
                  {d.winners.map((w) => (
                    <li key={w.fanId}>{w.name.split(' ')[0]} {w.name.split(' ')[1]?.charAt(0) ?? ''}.</li>
                  ))}
                </ol>
              </div>
            )
          )}
        </article>
      ))}
    </div>
  );
}
