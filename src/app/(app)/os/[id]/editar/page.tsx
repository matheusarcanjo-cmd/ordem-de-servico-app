import { notFound, redirect } from 'next/navigation';
import { createClient, requireUser } from '@/lib/supabase/server';
import { podeEditarOS } from '@/lib/permissions';
import { OsForm, type OsInicial } from '@/components/OsForm';
import type { OS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditarOSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, profile } = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from('ordens_servico').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const os = data as OS;

  if (!podeEditarOS(profile.papel, os.status, os.solicitante_id, userId))
    redirect(`/os/${id}`);

  const inicial: OsInicial = {
    tipo: os.tipo,
    crs: os.crs,
    extensao_aprox: os.extensao_aprox,
    data_inicial: os.data_inicial,
    prazo_final: os.prazo_final,
    detalhes: os.detalhes,
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold uppercase">
        Editar OS-{String(os.numero_os).padStart(4, '0')}
      </h1>
      <OsForm nomeSolicitante={profile.nome} autoAprova={false} osId={os.id} inicial={inicial} />
    </div>
  );
}
