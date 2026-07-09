'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import {
  DATA_INICIAL_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  TIPO_CURTO,
  TIPO_LABEL,
  type OS,
  type Status,
  type Tipo,
} from '@/lib/types';

const COLUNAS: Status[] = ['pendente', 'aprovada', 'em_execucao', 'concluida', 'rejeitada', 'cancelada'];

function fmt(d: string) {
  return new Date(d + (d.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR');
}

function Card({ os }: { os: OS }) {
  const atrasada =
    !['concluida', 'rejeitada', 'cancelada'].includes(os.status) &&
    new Date(os.prazo_final + 'T23:59:59') < new Date();
  return (
    <Link
      href={`/os/${os.id}`}
      className="block rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-faixa hover:shadow"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-base font-bold">OS-{String(os.numero_os).padStart(4, '0')}</span>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          {TIPO_CURTO[os.tipo]}
        </span>
      </div>
      <p className="mt-1 truncate text-sm text-zinc-700">CRS {os.crs} · {os.extensao_aprox}</p>
      <p className="text-xs text-zinc-500">{os.solicitante?.nome}</p>
      <p className={`mt-1 text-xs ${atrasada ? 'font-bold text-red-600' : 'text-zinc-500'}`}>
        Prazo: {fmt(os.prazo_final)}{atrasada ? ' — atrasada' : ''}
      </p>
    </Link>
  );
}

export function DashboardView({ lista, statusInicial }: { lista: OS[]; statusInicial?: string }) {
  const [modo, setModo] = useState<'kanban' | 'tabela'>('kanban');
  const [busca, setBusca] = useState('');
  const [fStatus, setFStatus] = useState<string>(statusInicial ?? '');
  const [fTipo, setFTipo] = useState<string>('');

  const filtradas = useMemo(
    () =>
      lista.filter(
        (o) =>
          (!fStatus || o.status === fStatus) &&
          (!fTipo || o.tipo === fTipo) &&
          (!busca ||
            o.crs.toLowerCase().includes(busca.toLowerCase()) ||
            String(o.numero_os).includes(busca) ||
            (o.solicitante?.nome ?? '').toLowerCase().includes(busca.toLowerCase()))
      ),
    [lista, fStatus, fTipo, busca]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Buscar por nº, CRS ou solicitante…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select className="input max-w-44" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {COLUNAS.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select className="input max-w-64" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {(Object.keys(TIPO_LABEL) as Tipo[]).map((t) => (
            <option key={t} value={t}>{TIPO_LABEL[t]}</option>
          ))}
        </select>
        <div className="ml-auto flex overflow-hidden rounded-md border border-zinc-300">
          {(['kanban', 'tabela'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`px-3 py-1.5 text-sm font-semibold capitalize ${
                modo === m ? 'bg-asfalto text-white' : 'bg-white text-zinc-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 && (
        <p className="rounded-md border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          Nenhuma OS encontrada com os filtros atuais. Abra uma nova OS para começar.
        </p>
      )}

      {modo === 'kanban' && filtradas.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {COLUNAS.map((s) => {
            const itens = filtradas.filter((o) => o.status === s);
            return (
              <div key={s} className="rounded-lg bg-zinc-200/60 p-2">
                <div className={`mb-2 rounded border-l-4 bg-white px-2 py-1.5 ${STATUS_COLOR[s].split(' ').pop()}`}>
                  <span className="font-display text-sm font-bold uppercase">{STATUS_LABEL[s]}</span>
                  <span className="ml-2 text-xs text-zinc-500">{itens.length}</span>
                </div>
                <div className="space-y-2">
                  {itens.map((o) => <Card key={o.id} os={o} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modo === 'tabela' && filtradas.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-asfalto text-left text-xs uppercase tracking-wide text-white">
              <tr>
                {['OS', 'CRS', 'Tipo', 'Solicitante', 'Início desejado', 'Prazo final', 'Status'].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtradas.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="px-3 py-2 font-display font-bold">
                    <Link className="hover:underline" href={`/os/${o.id}`}>
                      OS-{String(o.numero_os).padStart(4, '0')}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{o.crs}</td>
                  <td className="px-3 py-2" title={TIPO_LABEL[o.tipo]}>{TIPO_CURTO[o.tipo]}</td>
                  <td className="px-3 py-2">{o.solicitante?.nome}</td>
                  <td className="px-3 py-2">{DATA_INICIAL_LABEL[o.data_inicial]}</td>
                  <td className="px-3 py-2">{fmt(o.prazo_final)}</td>
                  <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
