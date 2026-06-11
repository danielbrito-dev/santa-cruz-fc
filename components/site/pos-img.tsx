import type { CSSProperties } from 'react';
import Image from 'next/image';
import { parseImagePos } from '@/lib/image-pos';

// Hosts que o next/image sabe otimizar (ver next.config.ts). URLs coladas no admin
// podem ser de qualquer lugar — essas (e SVGs) caem no <img> normal, sem quebrar.
const OPTIMIZABLE = /^\/(?!\/)|^https:\/\/hnbmfseltirzruidodve\.supabase\.co\//;

/** Imagem de capa (cover/fill) que entende o enquadramento gravado na URL
 *  (#pos=x,y → object-position). Requer container posicionado (position:relative/absolute). */
export function PosImg({
  src,
  alt = '',
  className,
  sizes = '100vw',
  priority = false,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  const { src: clean, pos } = parseImagePos(src);
  const merged = pos ? { ...style, objectPosition: pos } : style;

  if (!OPTIMIZABLE.test(clean) || /\.svg($|\?)/i.test(clean)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={clean} alt={alt} className={className} style={merged} />;
  }
  return <Image src={clean} alt={alt} fill sizes={sizes} priority={priority} className={className} style={merged} />;
}
