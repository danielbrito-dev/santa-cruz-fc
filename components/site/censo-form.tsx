'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { CENSUS_QUESTIONS, type CensusAnswers } from '@/lib/census';
import { saveCensusAction } from '@/server/content/census-actions';

/** Formulário do Censo Coral — pills de opção, pré-preenchido se já respondeu. */
export function CensoForm({ initial }: { initial: CensusAnswers | null }) {
  const t = useTranslations('fanCensus');
  const [answers, setAnswers] = useState<Record<string, string>>({ ...(initial ?? {}) });
  const [isPending, start] = useTransition();
  const [state, setState] = useState<'idle' | 'saved' | 'error' | 'incomplete'>(initial ? 'saved' : 'idle');

  const complete = CENSUS_QUESTIONS.every((q) => answers[q.key]);

  function submit() {
    if (!complete) {
      setState('incomplete');
      return;
    }
    start(async () => {
      const res = await saveCensusAction(answers);
      setState(res.ok ? 'saved' : 'error');
    });
  }

  return (
    <div className="cns">
      {CENSUS_QUESTIONS.map((q, i) => (
        <fieldset className="cns-q sc-reveal" key={q.key}>
          <legend className="cns-legend">
            <span className="cns-num" aria-hidden="true">0{i + 1}</span>
            {t(`q_${q.key}`)}
          </legend>
          <div className="cns-opts" role="radiogroup" aria-label={t(`q_${q.key}`)}>
            {q.options.map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={answers[q.key] === o}
                className={`cns-opt${answers[q.key] === o ? ' is-on' : ''}`}
                onClick={() => {
                  setAnswers((a) => ({ ...a, [q.key]: o }));
                  if (state === 'incomplete') setState('idle');
                }}
              >
                {t(`o_${q.key}_${o}`)}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {state === 'saved' && !isPending && <p className="cns-ok" role="status">{t('saved')}</p>}
      {state === 'error' && <p className="cns-err" role="alert">{t('error')}</p>}
      {state === 'incomplete' && <p className="cns-err" role="alert">{t('incomplete')}</p>}

      <button type="button" className="sc-btn cns-submit" onClick={submit} disabled={isPending}>
        {isPending ? t('saving') : initial ? t('update') : t('submit')} →
      </button>
    </div>
  );
}
