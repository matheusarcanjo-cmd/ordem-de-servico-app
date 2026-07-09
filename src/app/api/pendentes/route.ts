import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Contagem de OS pendentes — alimenta o sino de notificações (polling 30s). */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 }, { status: 401 });

  const { count } = await supabase
    .from('ordens_servico')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pendente');

  return NextResponse.json({ count: count ?? 0 });
}
