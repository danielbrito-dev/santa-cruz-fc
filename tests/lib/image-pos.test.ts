import { describe, it, expect } from 'vitest';
import { parseImagePos, withImagePos } from '@/lib/image-pos';

describe('image-pos', () => {
  it('URL sem fragmento → posição padrão (centro), pos null', () => {
    expect(parseImagePos('/images/a.jpg')).toEqual({ src: '/images/a.jpg', pos: null, x: 50, y: 50 });
  });

  it('codifica e decodifica a posição', () => {
    const url = withImagePos('https://x.co/m/a.jpg', 30, 72);
    expect(url).toBe('https://x.co/m/a.jpg#pos=30,72');
    expect(parseImagePos(url)).toEqual({ src: 'https://x.co/m/a.jpg', pos: '30% 72%', x: 30, y: 72 });
  });

  it('volta ao centro remove o fragmento', () => {
    expect(withImagePos('/a.jpg#pos=30,72', 50, 50)).toBe('/a.jpg');
  });

  it('reposicionar substitui o fragmento anterior', () => {
    expect(withImagePos('/a.jpg#pos=10,10', 0, 100)).toBe('/a.jpg#pos=0,100');
  });

  it('clampa valores fora de 0–100', () => {
    expect(withImagePos('/a.jpg', -20, 140)).toBe('/a.jpg#pos=0,100');
    expect(parseImagePos('/a.jpg#pos=999,40').pos).toBe('100% 40%');
  });

  it('fragmento que não é pos é ignorado (graceful)', () => {
    expect(parseImagePos('/a.jpg#section')).toEqual({ src: '/a.jpg#section', pos: null, x: 50, y: 50 });
  });
});
