'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('senha') ?? ''),
  });
  if (error) redirect('/login?erro=' + encodeURIComponent('E-mail ou senha inválidos.'));

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles').select('ativo, deve_trocar_senha').eq('id', user!.id).single();

  if (!profile?.ativo) {
    await supabase.auth.signOut();
    redirect('/login?erro=' + encodeURIComponent('Usuário desativado. Fale com o administrador.'));
  }
  redirect(profile.deve_trocar_senha ? '/login?trocar=1' : '/dashboard');
}

export async function trocarSenha(formData: FormData) {
  const supabase = await createClient();
  const nova = String(formData.get('nova_senha') ?? '');
  if (nova.length < 8)
    redirect('/login?trocar=1&erro=' + encodeURIComponent('A senha deve ter ao menos 8 caracteres.'));

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) redirect('/login?trocar=1&erro=' + encodeURIComponent(error.message));

  const admin = createAdminClient();
  await admin.from('profiles').update({ deve_trocar_senha: false }).eq('id', user!.id);
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
