'use server';

import { revalidatePath } from 'next/cache';
import { getFanUser } from '@/server/auth/fan';
import { readSiteContent, writeSiteContent } from './store';
import { applyCreateStory } from './site-extras-ops';

type Result = { ok: true } | { ok: false; error: string };

/**
 * Envio público de história — exige torcedor logado; entra como 'pending'
 * (moderação no admin) vinculada ao torcedor (fanId).
 */
export async function submitFanStory(input: {
  nome?: string;
  cidade: string;
  geracao?: string;
  historia: string;
}): Promise<Result> {
  const fan = await getFanUser();
  if (!fan) return { ok: false, error: 'unauthorized' };
  const excerpt = (input.historia ?? '').trim().slice(0, 2000);
  const city = (input.cidade ?? '').trim().slice(0, 120);
  if (!excerpt || !city) return { ok: false, error: 'invalid' };

  const story = {
    author: (input.nome ?? '').trim().slice(0, 120) || fan.name,
    city,
    generation: (input.geracao ?? '').trim().slice(0, 40) || '—',
    excerpt,
    featured: false,
    status: 'pending' as const,
    fanId: fan.id,
  };
  const res = await writeSiteContent(applyCreateStory(await readSiteContent(), story));
  if (res.ok) revalidatePath('/', 'layout');
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}
