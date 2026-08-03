'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Papel } from '@/lib/types';

type Result = { ok: true; senhaProvisoria?: string } | { ok: false; erro: string };

function senhaProvisoria() {
  return 'OS-' + Math.random().toString(36).slice(2, 10) + '!';
}

/** Somente Admin: cadastra usuário com senha provisória (sem auto-cadastro). */
export async function criarUsuario(formData: FormData): Promise<Result> {
  try {
    const { profile } = await requireUser();
    if (profile.papel !== 'admin') return { ok: false, erro: 'Apenas Admin.' };

    const nome = String(formData.get('nome') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const papel = String(formData.get('papel') ?? 'solicitante') as Papel;
    if (!nome || !email) return { ok: false, erro: 'Preencha nome e e-mail.' };

    const senha = senhaProvisoria();
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome, papel },
    });
    if (error) return { ok: false, erro: error.message };

    revalidatePath('/admin/usuarios');
    return { ok: true, senhaProvisoria: senha };
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}

export async function atualizarUsuario(
  id: string,
  patch: { papel?: Papel; ativo?: boolean }
): Promise<Result> {
  try {
    const { userId, profile } = await requireUser();
    // Editor pode ativar/desativar; mudar papel continua exclusivo do Admin
    const podeGerir = profile.papel === 'admin' || profile.papel === 'editor';
    if (!podeGerir) return { ok: false, erro: 'Sem permissão.' };
    if (patch.papel !== undefined && profile.papel !== 'admin')
      return { ok: false, erro: 'Apenas Admin altera papéis.' };
    if (id === userId && patch.ativo === false)
      return { ok: false, erro: 'Você não pode desativar a si mesmo.' };

    const admin = createAdminClient();
    const { error } = await admin.from('profiles').update(patch).eq('id', id);
    if (error) return { ok: false, erro: error.message };

    revalidatePath('/admin/usuarios');
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}


/** Exclusão DEFINITIVA de usuário (Editor/Admin). Bloqueada se o usuário
 *  tiver OS ou registros de histórico — preserva a trilha de auditoria. */
export async function apagarUsuario(id: string): Promise<Result> {
  try {
    const { userId, profile } = await requireUser();
    if (profile.papel !== 'admin' && profile.papel !== 'editor')
      return { ok: false, erro: 'Sem permissão.' };
    if (id === userId)
      return { ok: false, erro: 'Você não pode apagar a si mesmo.' };

    const admin = createAdminClient();

    const { data: alvo } = await admin
      .from('profiles').select('papel').eq('id', id).single();
    if (!alvo) return { ok: false, erro: 'Usuário não encontrado.' };
    if (alvo.papel === 'admin' && profile.papel !== 'admin')
      return { ok: false, erro: 'Somente Admin pode apagar outro Admin.' };

    // Usuário com registros não pode ser apagado (quebraria auditoria/métricas)
    const [{ count: nOS }, { count: nHist }] = await Promise.all([
      admin.from('ordens_servico').select('id', { count: 'exact', head: true })
        .or(`solicitante_id.eq.${id},aprovado_por.eq.${id}`),
      admin.from('historico_status').select('id', { count: 'exact', head: true })
        .eq('alterado_por', id),
    ]);
    if ((nOS ?? 0) > 0 || (nHist ?? 0) > 0)
      return {
        ok: false,
        erro: 'Este usuário possui OS ou histórico vinculados e não pode ser apagado. Use Desativar para bloquear o acesso mantendo os registros.',
      };

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return { ok: false, erro: error.message };

    revalidatePath('/admin/usuarios');
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}
/** Reseta a senha de um usuário (somente Admin): gera nova senha provisória
 *  e força a troca no primeiro acesso. */
export async function resetarSenha(id: string): Promise<Result> {
  try {
    const { userId, profile } = await requireUser();
    if (profile.papel !== 'admin') return { ok: false, erro: 'Apenas Admin.' };
    if (id === userId)
      return { ok: false, erro: 'Peça a outro Admin para resetar a sua própria senha.' };

    const senha = senhaProvisoria();
    const admin = createAdminClient();

    const { error } = await admin.auth.admin.updateUserById(id, { password: senha });
    if (error) return { ok: false, erro: error.message };

    await admin.from('profiles').update({ deve_trocar_senha: true }).eq('id', id);

    revalidatePath('/admin/usuarios');
    return { ok: true, senhaProvisoria: senha };
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}