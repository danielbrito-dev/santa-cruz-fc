/**
 * Posição de enquadramento (object-position) codificada no fragmento da URL:
 * "imagem.jpg#pos=50,30" → x=50% y=30%. O fragmento não vai ao servidor, então
 * a mesma string funciona em <img src>, CSS e dados antigos (sem fragmento = centro).
 */

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/** Anexa a posição à URL (remove o fragmento quando volta ao centro 50,50). */
export function withImagePos(url: string, x: number, y: number): string {
  const base = url.split('#')[0];
  const cx = clamp(x);
  const cy = clamp(y);
  if (!base || (cx === 50 && cy === 50)) return base;
  return `${base}#pos=${cx},${cy}`;
}

/** Lê a posição da URL. `pos` vem pronto para object-position (ou null = padrão). */
export function parseImagePos(url: string): { src: string; pos: string | null; x: number; y: number } {
  const i = url.indexOf('#');
  if (i === -1) return { src: url, pos: null, x: 50, y: 50 };
  const m = /(?:^|&)pos=(\d{1,3}),(\d{1,3})(?:&|$)/.exec(url.slice(i + 1));
  if (!m) return { src: url, pos: null, x: 50, y: 50 };
  const x = clamp(Number(m[1]));
  const y = clamp(Number(m[2]));
  return { src: url.slice(0, i), pos: `${x}% ${y}%`, x, y };
}
