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
    if (profile.papel !== 'admin') return { ok: false, erro: 'Apenas Admin.' };
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
