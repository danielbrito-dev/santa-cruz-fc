'use server';

import {
  getSessionUser,
  getUserById,
  inviteUser,
  updateUser,
  setActive,
  setPassword,
  deleteUser,
  type Role,
} from './users';

type Result = { ok: true } | { ok: false; error: string };

async function isAdmin(): Promise<boolean> {
  const u = await getSessionUser();
  return !!u && u.role === 'admin';
}

export async function inviteUserAction(input: { email: string; name: string; role: Role }): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'unauthorized' };
  if (!input.email || !input.name) return { ok: false, error: 'invalid' };
  return inviteUser(input);
}

export async function updateUserAction(id: string, patch: { name?: string; role?: Role }): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'unauthorized' };
  return updateUser(id, patch);
}

export async function setActiveAction(id: string, active: boolean): Promise<Result> {
  const me = await getSessionUser();
  if (!me || me.role !== 'admin') return { ok: false, error: 'unauthorized' };
  if (me.id === id) return { ok: false, error: 'self' }; // não pode se autodesativar
  return setActive(id, active);
}

export async function setPasswordAction(id: string, password: string): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'unauthorized' };
  if (!password || password.length < 8) return { ok: false, error: 'invalid' };
  return setPassword(id, password);
}

export async function deleteUserAction(id: string): Promise<Result> {
  const me = await getSessionUser();
  if (!me || me.role !== 'admin') return { ok: false, error: 'unauthorized' };
  if (me.id === id) return { ok: false, error: 'self' };
  const target = await getUserById(id);
  if (target?.isRoot) return { ok: false, error: 'root' }; // root não pode ser excluído (só desativado)
  return deleteUser(id);
}
