import { createClient, requireUser } from '@/lib/supabase/server';
import { DashboardView } from '@/components/DashboardView';
import { DashboardGraficos } from '@/components/DashboardGraficos';
import { PODE_CRIAR, VE_TODAS } from '@/lib/permissions';
import Link from 'next/link';
import type { OS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { profile } = await requireUser();
  const { status } = await searchParams;
  const supabase = await createClient();

  // RLS já restringe: Solicitante recebe apenas as próprias OS.
  const { data } = await supabase
    .from('ordens_servico')
    .select('*, solicitante:profiles!ordens_servico_solicitante_id_fkey(nome)')
    .order('criado_em', { ascending: false });

  const lista = (data ?? []) as OS[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase">Central de Requisições</h1>
          <p className="text-sm text-zinc-500">
            {VE_TODAS.includes(profile.papel)
              ? `${lista.length} requisições no sistema`
              : 'Suas solicitações de levantamento'}
          </p>
        </div>
        {PODE_CRIAR.includes(profile.papel) && (
          <Link href="/os/nova" className="btn-primary">+ Nova OS</Link>
        )}
      </div>
      <DashboardView lista={lista} statusInicial={status} />
      {VE_TODAS.includes(profile.papel) && <DashboardGraficos lista={lista} />}
    </div>
  );
}
