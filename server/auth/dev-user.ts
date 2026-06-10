// Fallback de emergência: usado só quando o Supabase Auth está indisponível
// (queda de rede) ou sem configuração (dev local sem env). Ver users.ts.
export const DEV_USER = {
  email: 'admin@santacruz.fc',
  password: 'cobracoral1914',
  name: 'Admin',
} as const;

/** Server-side credential check (email case-insensitive + trimmed; password exact). */
export function verifyCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEV_USER.email &&
    password === DEV_USER.password
  );
}
