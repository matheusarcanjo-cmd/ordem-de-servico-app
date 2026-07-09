import type { Papel, Status } from './types';

/** Quem pode criar OS (ajuste aprovado: Aprovador também cria). */
export const PODE_CRIAR: Papel[] = ['solicitante', 'aprovador', 'admin'];

/** Quem pode aprovar/rejeitar OS pendentes. */
export const PODE_APROVAR: Papel[] = ['aprovador', 'admin'];

/** Quem pode movimentar o status operacional. */
export const PODE_OPERAR: Papel[] = ['editor', 'admin'];

/** Quem enxerga todas as OS (os demais veem só as próprias, via RLS). */
export const VE_TODAS: Papel[] = ['aprovador', 'editor', 'admin'];

/** Transições válidas. Estados finais não saem daqui (Admin pode sobrescrever). */
export const TRANSICOES: Record<Status, Status[]> = {
  pendente: ['aprovada', 'rejeitada', 'cancelada'],
  aprovada: ['em_execucao', 'cancelada'],
  em_execucao: ['concluida', 'cancelada'],
  rejeitada: [],
  concluida: [],
  cancelada: [],
};

/** Papel exigido para cada status de destino. */
export const PAPEL_POR_TRANSICAO: Record<Status, Papel[]> = {
  pendente: ['admin'],
  aprovada: PODE_APROVAR,
  rejeitada: PODE_APROVAR,
  em_execucao: PODE_OPERAR,
  concluida: PODE_OPERAR,
  cancelada: PODE_OPERAR,
};

export function podeTransicionar(
  papel: Papel,
  de: Status,
  para: Status,
  opts: { solicitanteId: string; userId: string }
): { ok: boolean; motivo?: string } {
  if (papel === 'admin') return { ok: true }; // Admin sobrescreve tudo

  if (!TRANSICOES[de].includes(para))
    return { ok: false, motivo: `Transição inválida: ${de} → ${para}.` };

  if (!PAPEL_POR_TRANSICAO[para].includes(papel))
    return { ok: false, motivo: 'Seu papel não permite esta ação.' };

  // Salvaguarda: Aprovador não aprova/rejeita a própria OS
  if (
    (para === 'aprovada' || para === 'rejeitada') &&
    opts.solicitanteId === opts.userId
  )
    return { ok: false, motivo: 'Você não pode aprovar sua própria solicitação.' };

  return { ok: true };
}
