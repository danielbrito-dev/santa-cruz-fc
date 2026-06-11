/**
 * Envio de e-mail via Resend (https://resend.com) — preparado, liga quando
 * RESEND_API_KEY existir nas envs. Sem chave = no-op gracioso (nada quebra).
 * EMAIL_FROM opcional (default usa o domínio de testes do Resend).
 */

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'Santa Cruz FC <onboarding@resend.dev>';

export function isEmailConfigured(): boolean {
  return !!API_KEY;
}

export type EmailResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}): Promise<EmailResult> {
  if (!API_KEY) return { ok: false, error: 'not-configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text ?? (input.html ? undefined : input.subject),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `resend-${res.status}: ${body.slice(0, 200)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: json.id };
  } catch {
    return { ok: false, error: 'network' };
  }
}

/** Template mínimo on-brand para e-mails transacionais. */
export function emailHtml(title: string, body: string, ctaLabel?: string, ctaUrl?: string): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://santa-ruby.vercel.app').replace(/\/$/, '');
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-top:4px solid #DD0000">
      <tr><td style="padding:28px 32px 8px;font-size:20px;font-weight:bold;color:#0A0A0A">${title}</td></tr>
      <tr><td style="padding:8px 32px 20px;font-size:15px;line-height:1.6;color:#3A3A3A">${body}</td></tr>
      ${ctaLabel && ctaUrl ? `<tr><td style="padding:0 32px 28px"><a href="${ctaUrl}" style="display:inline-block;background:#DD0000;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:.05em;text-transform:uppercase;padding:12px 24px;border-radius:999px;border:1.5px solid #ffffff">${ctaLabel}</a></td></tr>` : ''}
      <tr><td style="padding:16px 32px;border-top:1px solid #E5E5E5;font-size:12px;color:#6E6E6E">Santa Cruz Futebol Clube · <a href="${site}" style="color:#DD0000">${site.replace('https://', '')}</a></td></tr>
    </table>
  </td></tr></table></body></html>`;
}
