'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PAPEL_LABEL, type Papel, type Profile } from '@/lib/types';
import { criarUsuario, atualizarUsuario, apagarUsuario, resetarSenha } from '@/actions/usuarios';

const PAPEIS = Object.keys(PAPEL_LABEL) as Papel[];

export function UsuariosAdmin({
  usuarios,
  meuId,
  meuPapel,
}: {
  usuarios: Profile[];
  meuId: string;
  meuPapel: Papel;
}) {
  const souAdmin = meuPapel === 'admin';
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [apagandoId, setApagandoId] = useState<string | null>(null);
  const [senhaReset, setSenhaReset] = useState<{ nome: string; senha: string } | null>(null);

  function resetar(id: string, nome: string) {
    setErro(null);
    setSenhaReset(null);
    startTransition(async () => {
      const res = await resetarSenha(id);
      if (!res.ok) setErro(res.erro);
      else {
        setSenhaReset({ nome, senha: res.senhaProvisoria ?? '' });
        router.refresh();
      }
    });
  }

  function apagar(id: string) {
    setErro(null);
    startTransition(async () => {
      const res = await apagarUsuario(id);
      if (!res.ok) setErro(res.erro);
      setApagandoId(null);
      if (res.ok) router.refresh();
    });
  }

  function submit(fd: FormData) {
    setErro(null);
    setSenhaGerada(null);
    startTransition(async () => {
      const res = await criarUsuario(fd);
      if (!res.ok) setErro(res.erro);
      else {
        setSenhaGerada(res.senhaProvisoria ?? null);
        router.refresh();
      }
    });
  }

  function patch(id: string, p: { papel?: Papel; ativo?: boolean }) {
    setErro(null);
    startTransition(async () => {
      const res = await atualizarUsuario(id, p);
      if (!res.ok) setErro(res.erro);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {souAdmin && (
      <form action={submit} className="grid grid-cols-1 items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        <div>
          <label className="label" htmlFor="nome">Nome</label>
          <input id="nome" name="nome" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="papel">Papel</label>
          <select id="papel" name="papel" className="input" defaultValue="solicitante">
            {PAPEIS.map((p) => <option key={p} value={p}>{PAPEL_LABEL[p]}</option>)}
          </select>
        </div>
        <button className="btn-primary justify-center" disabled={pending}>Cadastrar usuário</button>
      </form>
      )}

      {senhaGerada && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Usuário criado. Senha provisória (envie ao usuário — ele trocará no primeiro acesso):{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono font-bold">{senhaGerada}</code>
        </p>
      )}
      {senhaReset && (
  <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
    Senha de <strong>{senhaReset.nome}</strong> resetada. Nova senha provisória
    (envie ao usuário — ele trocará no primeiro acesso):{' '}
    <code className="rounded bg-white px-1.5 py-0.5 font-mono font-bold">{senhaReset.senha}</code>
  </p>
)}
      {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-asfalto text-left text-xs uppercase tracking-wide text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">Nome</th>
              <th className="px-3 py-2 font-semibold">E-mail</th>
              <th className="px-3 py-2 font-semibold">Papel</th>
              <th className="px-3 py-2 font-semibold">Situação</th>
              <th className="px-3 py-2 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50">
                <td className="px-3 py-2 font-semibold">
                  {u.nome}{u.id === meuId && <span className="ml-1 text-xs text-zinc-400">(você)</span>}
                </td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <select
                    className="input py-1"
                    value={u.papel}
                    disabled={pending || u.id === meuId || !souAdmin}
                    onChange={(e) => patch(u.id, { papel: e.target.value as Papel })}
                  >
                    {PAPEIS.map((p) => <option key={p} value={p}>{PAPEL_LABEL[p]}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    className={`rounded px-2 py-1 text-xs font-bold ${
                      u.ativo ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-500'
                    }`}
                    disabled={pending || u.id === meuId}
                    onClick={() => patch(u.id, { ativo: !u.ativo })}
                    title="Clique para alternar"
                  >
                    {u.ativo ? 'Ativo' : 'Desativado'}
                  </button>
                </td>
                <td className="px-3 py-2">
                  {souAdmin && apagandoId !== u.id && (
                    <button
                    className="mr-2 rounded px-2 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
                    disabled={pending || u.id === meuId}
                    title="Gera nova senha provisória e força troca no primeiro acesso"
                    onClick={() => resetar(u.id, u.nome)}
                    >
                    Resetar senha
                    </button>
                  )}
                  {apagandoId === u.id ? (
                    <span className="flex items-center gap-2">
                      <button className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700"
                        disabled={pending} onClick={() => apagar(u.id)}>
                        Confirmar exclusão
                      </button>
                      <button className="rounded border border-zinc-300 px-2 py-1 text-xs"
                        disabled={pending} onClick={() => setApagandoId(null)}>
                        Voltar
                      </button>
                    </span>
                  ) : (
                    <button
                      className="rounded px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
                      disabled={pending || u.id === meuId}
                      title="Só é possível apagar usuários sem OS ou histórico; caso contrário, desative."
                      onClick={() => setApagandoId(u.id)}
                    >
                      Apagar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
