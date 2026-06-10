'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { fetchFanMe } from '@/lib/fan-me';

/**
 * Gate de torcedor: páginas exclusivas (censo, enviar história, experiências)
 * redirecionam para o login/cadastro do torcedor quando não há sessão.
 * Cobre a página com um véu até a checagem terminar (evita flash do conteúdo).
 */
export function FanGate({ next }: { next: string }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let on = true;
    fetchFanMe().then((me) => {
      if (!on) return;
      if (me) setAllowed(true);
      else router.replace(`/torcedor/entrar?next=${encodeURIComponent(next)}`);
    });
    return () => {
      on = false;
    };
  }, [next, router]);

  if (allowed) return null;
  return <div className="fan-gate-veil" aria-hidden="true" />;
}
