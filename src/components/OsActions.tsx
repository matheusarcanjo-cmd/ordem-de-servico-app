'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { alterarStatus, apagarOS } from '@/actions/os';
import { STATUS_LABEL, type Papel, type Status } from '@/lib/types';
import { TRANSICOES, PAPEL_POR_TRANSICAO, PODE_APAGAR_OS, podeEditarOS } from '@/lib/permissions';

export function OsActions({
  osId,
  status,
  papel,
  souSolicitante,
  solicitanteId,
  userId,
}: {
  osId: string;
  status: Status;
  papel: Papel;
  souSolicitante: boolean;
  solicitanteId: string;
  userId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [rejeitando, setRejeitando] = useState(false);
  const [confirmaApagar, setConfirmaApagar] = useState(false);
  const [motivo, setMotivo] = useState('');

  const destinos = (papel === 'admin'
    ? (Object.keys(STATUS_LABEL) as Status[]).filter((s) => s !== status)
    : TRANSICOES[status].filter((destino) => {
        if (!PAPEL_POR_TRANSICAO[destino].includes(papel)) return false;
        if ((destino === 'aprovada' || destino === 'rejeitada') && souSolicitante) return false;
        return true;
      }));

  function mudar(novo: Status, obs?: string) {
    setErro(null);
    startTransition(async () => {
      const res = await alterarStatus(osId, novo, obs);
      if (!res.ok) setErro(res.erro);
      else {
        setRejeitando(false);
        setMotivo('');
        router.refresh();
      }
    });
  }

  const podeEditar = podeEditarOS(papel, status, solicitanteId, userId);
  const podeApagar = PODE_APAGAR_OS.includes(papel);

  function apagar() {
    setErro(null);
    startTransition(async () => {
      const res = await apagarOS(osId);
      if (!res.ok) setErro(res.erro);
      else router.push('/dashboard');
    });
  }

  const rotulo = (s: Status) =>
    ({ aprovada: 'Aprovar', rejeitada: 'Rejeitar', em_execucao: 'Iniciar execução',
       concluida: 'Concluir', cancelada: 'Cancelar OS', pendente: 'Voltar a pendente' }[s] ?? STATUS_LABEL[s]);

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="font-display text-lg font-bold uppercase">Ações</h2>

      {destinos.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhuma ação disponível para o seu papel neste status.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {destinos.map((d) =>
          d === 'rejeitada' ? (
            <button key={d} className="btn bg-red-600 text-white hover:bg-red-700"
              disabled={pending} onClick={() => setRejeitando((v) => !v)}>
              Rejeitar
            </button>
          ) : (
            <button
              key={d}
              className={
                d === 'aprovada'
                  ? 'btn bg-green-600 text-white hover:bg-green-700'
                  : d === 'cancelada'
                    ? 'btn-ghost text-red-700'
                    : 'btn-primary'
              }
              disabled={pending}
              onClick={() => mudar(d)}
            >
              {rotulo(d)}
            </button>
          )
        )}
      </div>

      {rejeitando && (
        <div className="space-y-2 rounded-md bg-red-50 p-3">
          <label className="label" htmlFor="motivo">Motivo da rejeição (obrigatório)</label>
          <textarea id="motivo" className="input" rows={2} value={motivo}
            onChange={(e) => setMotivo(e.target.value)} />
          <button className="btn bg-red-600 text-white hover:bg-red-700"
            disabled={pending || !motivo.trim()} onClick={() => mudar('rejeitada', motivo)}>
            Confirmar rejeição
          </button>
        </div>
      )}

      {(podeEditar || podeApagar) && (
        <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
          {podeEditar && (
            <Link href={`/os/${osId}/editar`} className="btn-ghost">
              Editar OS
            </Link>
          )}
          {podeApagar && !confirmaApagar && (
            <button className="btn-ghost text-red-700" disabled={pending}
              onClick={() => setConfirmaApagar(true)}>
              Apagar OS
            </button>
          )}
        </div>
      )}

      {confirmaApagar && (
        <div className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-sm font-semibold text-red-800">
            Apagar definitivamente esta OS?
          </p>
          <p className="text-xs text-red-700">
            Diferente de Cancelar, esta ação remove a OS, os anexos e todo o histórico,
            sem possibilidade de recuperação.
          </p>
          <div className="flex gap-2">
            <button className="btn bg-red-600 text-white hover:bg-red-700"
              disabled={pending} onClick={apagar}>
              {pending ? 'Apagando…' : 'Sim, apagar definitivamente'}
            </button>
            <button className="btn-ghost" disabled={pending}
              onClick={() => setConfirmaApagar(false)}>
              Voltar
            </button>
          </div>
        </div>
      )}

      {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
    </div>
  );
}
