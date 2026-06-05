export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_STORAGE_KEY = 'theme';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** Stored choice wins; otherwise follow the OS preference; default light. */
export function resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return systemPrefersDark ? 'dark' : 'light';
}
