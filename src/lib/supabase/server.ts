import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Profile } from '../types';

/** Cliente com a sessão do usuário (leituras passam pelo RLS). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
}

/** Usuário logado + profile. Lança se não autenticado ou inativo. */
export async function requireUser(): Promise<{ userId: string; profile: Profile }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  if (!profile || !profile.ativo) throw new Error('Usuário inativo.');
  return { userId: user.id, profile: profile as Profile };
}
