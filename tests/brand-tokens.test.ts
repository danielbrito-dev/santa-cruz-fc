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
