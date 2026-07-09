import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/supabase/server';
import { logout } from '@/actions/auth';
import { NotificationBell } from '@/components/NotificationBell';
import { PAPEL_LABEL } from '@/lib/types';
import { PODE_CRIAR, PODE_APROVAR, PODE_OPERAR } from '@/lib/permissions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect('/login');
  }
  const { profile } = user;
  if (profile.deve_trocar_senha) redirect('/login?trocar=1');

  const mostraSino = PODE_APROVAR.includes(profile.papel) || PODE_OPERAR.includes(profile.papel);

  return (
    <div className="min-h-screen">
      <header className="bg-asfalto text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img
              src="/logo-strata.png"
              alt="Strata Engenharia"
              className="h-9 w-auto rounded bg-white p-1"
            />
            <span className="font-display text-xl font-bold uppercase tracking-wide">
              Solicitações de Levantamento
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-zinc-300 hover:text-white">Dashboard</Link>
            {PODE_CRIAR.includes(profile.papel) && (
              <Link href="/os/nova" className="text-zinc-300 hover:text-white">Nova OS</Link>
            )}
            {profile.papel === 'admin' && (
              <Link href="/admin/usuarios" className="text-zinc-300 hover:text-white">Usuários</Link>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {mostraSino && <NotificationBell />}
            <div className="text-right text-xs">
              <p className="font-semibold">{profile.nome}</p>
              <p className="text-zinc-400">{PAPEL_LABEL[profile.papel]}</p>
            </div>
            <form action={logout}>
              <button className="rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-asfalto-claro">
                Sair
              </button>
            </form>
          </div>
        </div>
        <div className="lane-stripe" />
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
