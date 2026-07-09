'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { novaOSSchema } from '@/lib/validation';
import { PODE_CRIAR, podeTransicionar } from '@/lib/permissions';
import type { Status } from '@/lib/types';

type Result = { ok: true } | { ok: false; erro: string };
type CriarResult = { ok: true; osId: string } | { ok: false; erro: string };

export async function criarOS(input: unknown): Promise<CriarResult> {
  try {
    const { userId, profile } = await requireUser();
    if (!PODE_CRIAR.includes(profile.papel))
      return { ok: false, erro: 'Seu papel não permite criar OS.' };

    const parsed = novaOSSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, erro: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };

    // Regra de negócio: OS aberta por Aprovador nasce aprovada
    const autoAprovada = profile.papel === 'aprovador';
    const agora = new Date().toISOString();

    const admin = createAdminClient();
    const { data: os, error } = await admin
      .from('ordens_servico')
      .insert({
        solicitante_id: userId, // sempre o usuário logado — nunca vem do form
        crs: parsed.data.crs,
        tipo: parsed.data.tipo,
        extensao_aprox: parsed.data.extensao_aprox,
        data_inicial: parsed.data.data_inicial,
        prazo_final: parsed.data.prazo_final,
        detalhes: parsed.data.detalhes,
        status: autoAprovada ? 'aprovada' : 'pendente',
        aprovado_por: autoAprovada ? userId : null,
        aprovado_em: autoAprovada ? agora : null,
      })
      .select('id')
      .single();
    if (error) return { ok: false, erro: error.message };

    const historico = [
      {
        os_id: os.id,
        status_anterior: null,
        status_novo: 'pendente',
        alterado_por: userId,
        observacao: 'OS criada',
      },
    ];
    if (autoAprovada)
      historico.push({
        os_id: os.id,
        status_anterior: 'pendente' as never,
        status_novo: 'aprovada',
        alterado_por: userId,
        observacao: 'Aprovação automática — OS aberta por Aprovador',
      });
    await admin.from('historico_status').insert(historico);

    revalidatePath('/dashboard');
    return { ok: true, osId: os.id };
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}

export async function alterarStatus(
  osId: string,
  novoStatus: Status,
  observacao?: string
): Promise<Result> {
  try {
    const { userId, profile } = await requireUser();
    const admin = createAdminClient();

    const { data: os, error } = await admin
      .from('ordens_servico')
      .select('id, status, solicitante_id')
      .eq('id', osId)
      .single();
    if (error || !os) return { ok: false, erro: 'OS não encontrada.' };

    const check = podeTransicionar(profile.papel, os.status, novoStatus, {
      solicitanteId: os.solicitante_id,
      userId,
    });
    if (!check.ok) return { ok: false, erro: check.motivo! };

    if (novoStatus === 'rejeitada' && !observacao?.trim())
      return { ok: false, erro: 'Informe o motivo da rejeição.' };

    const patch: Record<string, unknown> = { status: novoStatus };
    // Dados de aprovação: preenchidos automaticamente pelo sistema
    if (novoStatus === 'aprovada' || novoStatus === 'rejeitada') {
      patch.aprovado_por = userId;
      patch.aprovado_em = new Date().toISOString();
      if (novoStatus === 'rejeitada') patch.motivo_rejeicao = observacao;
    }

    const { error: upErr } = await admin
      .from('ordens_servico')
      .update(patch)
      .eq('id', osId)
      .eq('status', os.status); // otimistic lock: falha se alguém mudou antes
    if (upErr) return { ok: false, erro: upErr.message };

    await admin.from('historico_status').insert({
      os_id: osId,
      status_anterior: os.status,
      status_novo: novoStatus,
      alterado_por: userId,
      observacao: observacao ?? null,
    });

    revalidatePath('/dashboard');
    revalidatePath(`/os/${osId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}

/** Upload de anexo (KML, PDF, imagem) para o bucket 'anexos'. */
export async function anexarArquivo(osId: string, formData: FormData): Promise<Result> {
  try {
    const { userId } = await requireUser();
    const file = formData.get('arquivo') as File | null;
    if (!file || file.size === 0) return { ok: false, erro: 'Selecione um arquivo.' };
    if (file.size > 20 * 1024 * 1024) return { ok: false, erro: 'Máximo de 20 MB.' };

    const admin = createAdminClient();
    const caminho = `${osId}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, '_')}`;
    const { error: stErr } = await admin.storage
      .from('anexos')
      .upload(caminho, file, { contentType: file.type });
    if (stErr) return { ok: false, erro: stErr.message };

    const { error } = await admin.from('anexos').insert({
      os_id: osId,
      nome_arquivo: file.name,
      tipo_mime: file.type || 'application/octet-stream',
      caminho,
      enviado_por: userId,
    });
    if (error) return { ok: false, erro: error.message };

    revalidatePath(`/os/${osId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}
