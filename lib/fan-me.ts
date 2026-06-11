'use client';

// Sessão do torcedor no cliente — cache por carregamento de página (uma chamada
// alimenta header, drawer e gates). invalidateFanMe() força nova busca.
export interface FanMe {
  name: string;
  photo: string | null;
  city?: string;
  unread?: number;
}

let cache: Promise<FanMe | null> | null = null;

export function fetchFanMe(): Promise<FanMe | null> {
  if (!cache) {
    cache = fetch('/api/fan/me')
      .then((r) => (r.ok ? (r.json() as Promise<FanMe | null>) : null))
      .catch(() => null);
  }
  return cache;
}

export function invalidateFanMe(): void {
  cache = null;
}
