import { login, trocarSenha } from '@/actions/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; trocar?: string }>;
}) {
  const { erro, trocar } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-asfalto p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-t-lg bg-asfalto-claro p-6 text-center">
          {/* Logo da empresa: coloque o arquivo em public/logo-strata.png */}
          <img
            src="/logo-strata.png"
            alt="Strata Engenharia"
            className="mx-auto mb-4 h-14 w-auto rounded bg-white p-1.5"
          />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Solicitações de Levantamento
          </h1>
          <p className="mt-1 text-sm text-zinc-400">Ordens de serviço de campo</p>
        </div>
        <div className="lane-stripe" />
        <form
          action={trocar ? trocarSenha : login}
          className="space-y-4 rounded-b-lg bg-white p-6 shadow-lg"
        >
          {trocar ? (
            <>
              <p className="text-sm text-zinc-600">
                Primeiro acesso: defina sua nova senha (mínimo de 8 caracteres).
              </p>
              <div>
                <label className="label" htmlFor="ns">Nova senha</label>
                <input id="ns" name="nova_senha" type="password" className="input" required minLength={8} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label" htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" className="input" required autoComplete="username" />
              </div>
              <div>
                <label className="label" htmlFor="senha">Senha</label>
                <input id="senha" name="senha" type="password" className="input" required autoComplete="current-password" />
              </div>
            </>
          )}
          {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
          <button className="btn-primary w-full justify-center" type="submit">
            {trocar ? 'Salvar nova senha' : 'Entrar'}
          </button>
          <p className="text-center text-xs text-zinc-400">
            Sem cadastro? Solicite acesso ao administrador do sistema.
          </p>
        </form>
      </div>
    </main>
  );
}
