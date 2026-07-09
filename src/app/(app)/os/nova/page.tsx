import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/supabase/server';
import { PODE_CRIAR } from '@/lib/permissions';
import { OsForm } from '@/components/OsForm';

export default async function NovaOSPage() {
  const { profile } = await requireUser();
  if (!PODE_CRIAR.includes(profile.papel)) redirect('/dashboard');

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold uppercase">Abrir Ordem de Serviço</h1>
      <OsForm nomeSolicitante={profile.nome} autoAprova={profile.papel === 'aprovador'} />
    </div>
  );
}
