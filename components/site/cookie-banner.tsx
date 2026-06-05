'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations('cookies');

  useEffect(() => {
    if (localStorage.getItem('cookie-consent') !== 'accepted') {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="region" aria-label={t('ariaLabel')}>
      <div className="cookie-banner-inner">
        <p>
          {t('message')}{' '}
          <a href="/politica-de-privacidade">{t('privacy')}</a>
        </p>
        <button type="button" className="cookie-accept" onClick={accept}>
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
