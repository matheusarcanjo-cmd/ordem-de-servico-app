'use client';

import { useMemo } from 'react';
import type { OS } from '@/lib/types';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const FAIXA = '#f5c518';
const ASFALTO = '#1e2124';

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="font-display text-lg font-bold uppercase">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Barras verticais: OS abertas por mês (últimos 12 meses). */
function GraficoPorMes({ lista }: { lista: OS[] }) {
  const dados = useMemo(() => {
    const agora = new Date();
    const meses: { chave: string; rotulo: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      meses.push({
        chave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
        total: 0,
      });
    }
    const idx = new Map(meses.map((m, i) => [m.chave, i]));
    for (const os of lista) {
      const d = new Date(os.criado_em);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const i = idx.get(k);
      if (i !== undefined) meses[i].total++;
    }
    return meses;
  }, [lista]);

  const max = Math.max(1, ...dados.map((m) => m.total));
  const W = 720, H = 220, pad = 28, baseY = H - 34;
  const bw = (W - pad * 2) / dados.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Gráfico de OS abertas por mês">
      <line x1={pad} y1={baseY} x2={W - pad} y2={baseY} stroke="#d4d4d8" />
      {dados.map((m, i) => {
        const h = Math.round((m.total / max) * (baseY - 30));
        const x = pad + i * bw;
        return (
          <g key={m.chave}>
            <rect x={x + bw * 0.18} y={baseY - h} width={bw * 0.64} height={h}
              rx={3} fill={m.total > 0 ? FAIXA : '#e4e4e7'} stroke={ASFALTO}
              strokeWidth={m.total > 0 ? 1 : 0} />
            {m.total > 0 && (
              <text x={x + bw / 2} y={baseY - h - 6} textAnchor="middle"
                fontSize="12" fontWeight="bold" fill={ASFALTO}>{m.total}</text>
            )}
            <text x={x + bw / 2} y={baseY + 16} textAnchor="middle"
              fontSize="10" fill="#71717a">{m.rotulo}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Barras horizontais: OS abertas por usuário. */
function GraficoPorUsuario({ lista }: { lista: OS[] }) {
  const dados = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const os of lista) {
      const nome = os.solicitante?.nome ?? 'Desconhecido';
      mapa.set(nome, (mapa.get(nome) ?? 0) + 1);
    }
    return Array.from(mapa.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [lista]);

  if (dados.length === 0)
    return <p className="text-sm text-zinc-500">Ainda não há OS registradas.</p>;

  const max = Math.max(1, ...dados.map((d) => d.total));
  const W = 720, rowH = 34, labelW = 190;
  const H = dados.length * rowH + 8;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Gráfico de OS abertas por usuário">
      {dados.map((u, i) => {
        const y = i * rowH + 6;
        const bw = Math.max(4, Math.round((u.total / max) * (W - labelW - 60)));
        return (
          <g key={u.nome}>
            <text x={labelW - 10} y={y + 16} textAnchor="end" fontSize="12"
              fill={ASFALTO}>
              {u.nome.length > 24 ? u.nome.slice(0, 23) + '…' : u.nome}
            </text>
            <rect x={labelW} y={y} width={bw} height={rowH - 12} rx={3}
              fill={FAIXA} stroke={ASFALTO} strokeWidth={1} />
            <text x={labelW + bw + 8} y={y + 16} fontSize="12" fontWeight="bold"
              fill={ASFALTO}>{u.total}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function DashboardGraficos({ lista }: { lista: OS[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Cartao titulo="OS abertas por mês">
        <GraficoPorMes lista={lista} />
      </Cartao>
      <Cartao titulo="OS abertas por usuário">
        <GraficoPorUsuario lista={lista} />
      </Cartao>
    </div>
  );
}
