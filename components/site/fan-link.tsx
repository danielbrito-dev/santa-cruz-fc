'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { fetchFanMe, type FanMe } from '@/lib/fan-me';

function Avatar({ me }: { me: FanMe }) {
  return me.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="fan-chip-photo" src={me.photo} alt="" />
  ) : (
    <span className="fan-chip-photo fan-chip-initial" aria-hidden="true">
      {(me.name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

/** "Entrar" do header — vira nome + foto do torcedor quando logado. */
export function FanLink({ variant, onNavigate }: { variant: 'header' | 'drawer'; onNavigate?: () => void }) {
  const nav = useTranslations('nav');
  const [me, setMe] = useState<FanMe | null>(null);

  useEffect(() => {
    let on = true;
    fetchFanMe().then((f) => on && setMe(f));
    return () => {
      on = false;
    };
  }, []);

  if (variant === 'drawer') {
    return (
      <Link href="/torcedor" className="drawer-item-trigger" style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={onNavigate}>
        {me ? (
          <>
            <Avatar me={me} />
            {me.name.split(' ')[0]}
          </>
        ) : (
          nav('login')
        )}
      </Link>
    );
  }

  return (
    <Link href="/torcedor" className={`header-link hide-mobile${me ? ' header-link--fan' : ''}`}>
      {me ? (
        <>
          <Avatar me={me} />
          <span className="fan-chip-name">{me.name.split(' ')[0]}</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
          {nav('login')}
        </>
      )}
    </Link>
  );
}
