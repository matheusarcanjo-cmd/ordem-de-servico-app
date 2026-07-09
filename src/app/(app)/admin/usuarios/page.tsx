import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UsuariosAdmin } from '@/components/UsuariosAdmin';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const { userId, profile } = await requireUser();
  if (profile.papel !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('*').order('nome');

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold uppercase">Gestão de Usuários</h1>
      <p className="text-sm text-zinc-500">
        O sistema não possui auto-cadastro: todo acesso é criado aqui, com senha provisória
        trocada obrigatoriamente no primeiro login.
      </p>
      <UsuariosAdmin usuarios={(data ?? []) as Profile[]} meuId={userId} />
    </div>
  );
}
