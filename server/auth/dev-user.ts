// Credencial de DEV LOCAL: só vale quando o Supabase NÃO está configurado
// (sem envs). Em produção o login é 100% Supabase Auth. Ver users.ts.
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
