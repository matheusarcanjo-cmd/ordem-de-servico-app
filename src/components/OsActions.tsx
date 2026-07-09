'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { alterarStatus } from '@/actions/os';
import { STATUS_LABEL, type Papel, type Status } from '@/lib/types';
import { TRANSICOES, PAPEL_POR_TRANSICAO } from '@/lib/permissions';

export function OsActions({
  osId,
  status,
  papel,
  souSolicitante,
}: {
  osId: string;
  status: Status;
  papel: Papel;
  souSolicitante: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [rejeitando, setRejeitando] = useState(false);
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

      {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
    </div>
  );
}
