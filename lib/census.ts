/** Perguntas do Censo Coral — chaves estáveis (labels via i18n `fanCensus.q_*` / `o_*`). */
export const CENSUS_QUESTIONS = [
  { key: 'socio', options: ['sim', 'jafui', 'nao'] },
  { key: 'frequencia', options: ['todojogo', 'asvezes', 'raramente', 'longe'] },
  { key: 'desde', options: ['crianca', 'dez', 'vinte', 'recente'] },
  { key: 'assiste', options: ['estadio', 'tv', 'streaming', 'radio'] },
  { key: 'idade', options: ['ate17', 'a18', 'a30', 'a45', 'a60'] },
] as const;

export type CensusKey = (typeof CENSUS_QUESTIONS)[number]['key'];
export type CensusAnswers = Partial<Record<CensusKey, string>>;

/** Mantém só pares pergunta/opção válidos. */
export function sanitizeCensus(input: Record<string, string>): CensusAnswers {
  const out: CensusAnswers = {};
  for (const q of CENSUS_QUESTIONS) {
    const v = input[q.key];
    if (v && (q.options as readonly string[]).includes(v)) out[q.key] = v;
  }
  return out;
}
