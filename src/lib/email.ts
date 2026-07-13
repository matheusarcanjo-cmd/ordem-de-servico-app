import { createAdminClient } from './supabase/admin';
import { TIPO_LABEL, type Tipo } from './types';

/**
 * Notifica Aprovadores, Editores e Admins ativos sobre uma nova OS.
 * Usa a API do Resend (https://resend.com). Nunca lança: falha de e-mail
 * não pode impedir a criação da OS — erros vão para o log da Vercel.
 */
export async function notificarNovaOS(os: {
  id: string;
  numero_os: number;
  crs: string;
  tipo: Tipo;
  extensao_aprox: string;
  prazo_final: string;
  solicitanteNome: string;
  solicitanteId: string;
  autoAprovada: boolean;
}): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[email] RESEND_API_KEY não configurada — notificação ignorada.');
      return;
    }

    const admin = createAdminClient();
    const { data: destinatarios } = await admin
      .from('profiles')
      .select('email')
      .in('papel', ['aprovador', 'editor', 'admin'])
      .eq('ativo', true)
      .neq('id', os.solicitanteId); // quem criou não precisa ser avisado

    const emails = (destinatarios ?? []).map((d) => d.email).filter(Boolean);
    if (emails.length === 0) return;

    const numero = `OS-${String(os.numero_os).padStart(4, '0')}`;
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
    const link = appUrl ? `${appUrl}/os/${os.id}` : '';
    const prazo = new Date(os.prazo_final + 'T12:00:00').toLocaleDateString('pt-BR');
    const statusTxt = os.autoAprovada
      ? 'já criada como <strong>Aprovada</strong> (aberta por um Aprovador) — pronta para programação'
      : 'aguardando <strong>aprovação</strong>';

    const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden">
  <div style="background:#1e2124;padding:20px 24px">
    <h1 style="color:#ffffff;font-size:18px;margin:0;text-transform:uppercase;letter-spacing:.5px">
      Solicitações de Levantamento</h1>
  </div>
  <div style="height:5px;background:repeating-linear-gradient(90deg,#f5c518 0 40px,#1e2124 40px 64px)"></div>
  <div style="padding:24px;background:#ffffff;color:#18181b">
    <p style="font-size:15px;margin:0 0 16px">
      Nova ordem de serviço <strong>${numero}</strong>, ${statusTxt}.</p>
    <table style="font-size:14px;border-collapse:collapse;width:100%">
      <tr><td style="padding:6px 0;color:#71717a;width:150px">Solicitante</td><td style="padding:6px 0"><strong>${os.solicitanteNome}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#71717a">Tipo</td><td style="padding:6px 0">${TIPO_LABEL[os.tipo]}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a">CRS</td><td style="padding:6px 0">${os.crs}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a">Extensão aprox.</td><td style="padding:6px 0">${os.extensao_aprox}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a">Prazo final</td><td style="padding:6px 0">${prazo}</td></tr>
    </table>
    ${link ? `<a href="${link}" style="display:inline-block;margin-top:20px;background:#1e2124;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:6px">Abrir a ${numero}</a>` : ''}
    <p style="font-size:12px;color:#a1a1aa;margin:22px 0 0">
      Notificação automática — Strata Engenharia. Não responda a este e-mail.</p>
  </div>
</div>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'Solicitações de Levantamento <onboarding@resend.dev>',
        to: emails,
        subject: `${numero} — nova solicitação de ${TIPO_LABEL[os.tipo]}${os.autoAprovada ? ' (já aprovada)' : ''}`,
        html,
      }),
    });
    if (!resp.ok)
      console.error('[email] Resend respondeu', resp.status, await resp.text());
  } catch (e) {
    console.error('[email] Falha ao notificar nova OS:', e);
  }
}
