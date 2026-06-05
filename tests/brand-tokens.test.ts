import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('brand tokens (BRAND.md compliance)', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  it('uses the exact brand red #DD0000', () => {
    expect(css).toMatch(/--red:\s*#DD0000/i);
  });
  it('does not use the legacy cordel red #CF1715', () => {
    expect(css).not.toMatch(/#CF1715/i);
  });
});

describe('dark theme tokens', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  it('defines a [data-theme="dark"] block with dark surfaces', () => {
    expect(css).toMatch(/\[data-theme="dark"\]\s*\{[\s\S]*--page-bg:/);
    expect(css).toMatch(/\[data-theme="dark"\][\s\S]*--section-bg:\s*#0E0E0E/i);
  });
  it('does not override brand red in the dark block (brand-locked)', () => {
    const darkBlock = css.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] ?? '';
    expect(darkBlock).not.toMatch(/--red:/);
    expect(css).toMatch(/--red:\s*#DD0000/i);
  });
  it('footer uses deep red in dark (tricolor preserved)', () => {
    const darkBlock = css.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] ?? '';
    expect(darkBlock).toMatch(/--footer-bg:\s*#5C0000/i);
  });
});
