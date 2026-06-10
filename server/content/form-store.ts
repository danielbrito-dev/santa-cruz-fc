import { getSql } from '@/server/db/client';

export interface FormSubmission {
  id: number;
  page: string;
  data: Record<string, string>;
  read: boolean;
  createdAt: string;
}

/** Lista os envios de formulário (mais recentes primeiro). Sem DB → lista vazia. */
export async function listFormSubmissions(): Promise<FormSubmission[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`
      select id, page, data, read, created_at
      from form_submissions
      order by created_at desc
      limit 500`;
    return rows.map((r) => ({
      id: Number(r.id),
      page: String(r.page),
      data: (r.data ?? {}) as Record<string, string>,
      read: r.read === true,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));
  } catch {
    return [];
  }
}
