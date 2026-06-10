import type { ImgHTMLAttributes } from 'react';
import { parseImagePos } from '@/lib/image-pos';

/** <img> que entende o enquadramento gravado na URL (#pos=x,y → object-position). */
export function PosImg({ src, style, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const { src: clean, pos } = parseImagePos(src);
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} src={clean} style={pos ? { ...style, objectPosition: pos } : style} />;
}
