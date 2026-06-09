// Primitivos compartilhados das páginas internas (Coral Editorial).
// Server-safe (sem estado). Marquee é puramente decorativo (aria-hidden).

/** Kicker editorial: rótulo de seção + linha animada + número/etiqueta opcional (dourado). */
export function Kicker({ label, num }: { label: string; num?: string }) {
  return (
    <span className="sc-kicker">
      {num && <span className="num">{num}</span>}
      <span className="bar" aria-hidden="true" />
      <span className="lbl">{label}</span>
    </span>
  );
}

const CHANT = ['É Tradição', 'Não é Moda', 'A Mais Apaixonada', 'Cobra Coral', 'Desde 1914'];

/** Faixa de cânticos em loop infinito — divisor de marca. Decorativo. */
export function Marquee({ items = CHANT }: { items?: string[] }) {
  const seq = [...items, ...items]; // duplicado p/ loop -50% sem emenda
  return (
    <div className="sc-marquee" aria-hidden="true">
      <div className="sc-marquee-track">
        {seq.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/** Seta "→" reutilizável. */
export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Ícone de download. */
export function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14" />
    </svg>
  );
}
