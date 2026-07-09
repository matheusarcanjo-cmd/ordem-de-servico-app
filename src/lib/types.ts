export type Papel = 'solicitante' | 'aprovador' | 'editor' | 'admin';
export type Tipo =
  | 'FWD'
  | 'VDR'
  | 'MUMETER'
  | 'MANCHA_AREIA'
  | 'PENDULO_BRITANICO'
  | 'VIGA_BENKELMAN'
  | 'ICP'
  | 'RETRO_REFLETANCIA';

/** Tipos que usam apenas o campo livre de detalhamento. */
export const TIPOS_SIMPLES: Tipo[] = [
  'MUMETER', 'MANCHA_AREIA', 'PENDULO_BRITANICO', 'VIGA_BENKELMAN', 'ICP', 'RETRO_REFLETANCIA',
];

export const TIPO_LABEL: Record<Tipo, string> = {
  FWD: 'FWD - Ensaio Defletométrico',
  VDR: 'VDR - Vídeo Registro / IRI / FCH',
  MUMETER: 'MuMeter - Ensaio de Atrito',
  MANCHA_AREIA: 'Mancha de Areia - Ensaio de Macrotextura',
  PENDULO_BRITANICO: 'Pêndulo Britânico - Ensaio de Atrito',
  VIGA_BENKELMAN: 'Viga Benkelman - Ensaio Deflectométrico',
  ICP: 'ICP',
  RETRO_REFLETANCIA: 'Retro Refletância',
};

/** Rótulo curto para badges e tabela. */
export const TIPO_CURTO: Record<Tipo, string> = {
  FWD: 'FWD',
  VDR: 'VDR',
  MUMETER: 'MuMeter',
  MANCHA_AREIA: 'M. Areia',
  PENDULO_BRITANICO: 'Pêndulo',
  VIGA_BENKELMAN: 'Viga B.',
  ICP: 'ICP',
  RETRO_REFLETANCIA: 'Retro',
};
export type Status =
  | 'pendente'
  | 'aprovada'
  | 'rejeitada'
  | 'em_execucao'
  | 'concluida'
  | 'cancelada';
export type DataInicial =
  | 'imediatamente'
  | 'em_2_dias'
  | 'em_5_dias'
  | 'em_1_semana'
  | 'em_1_mes';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  deve_trocar_senha: boolean;
}

export interface OS {
  id: string;
  numero_os: number;
  solicitante_id: string;
  crs: string;
  tipo: Tipo;
  extensao_aprox: string;
  data_inicial: DataInicial;
  prazo_final: string;
  status: Status;
  aprovado_por: string | null;
  aprovado_em: string | null;
  motivo_rejeicao: string | null;
  detalhes: Record<string, unknown>;
  criado_em: string;
  atualizado_em: string;
  solicitante?: { nome: string };
  aprovador?: { nome: string } | null;
}

export const PAPEL_LABEL: Record<Papel, string> = {
  solicitante: 'Solicitante',
  aprovador: 'Aprovador',
  editor: 'Editor/Operador',
  admin: 'Admin',
};

export const STATUS_LABEL: Record<Status, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
  em_execucao: 'Em Execução',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

// Cores de sinalização rodoviária: amarelo = atenção, verde = liberado,
// azul = serviço em andamento, vermelho = interdição.
export const STATUS_COLOR: Record<Status, string> = {
  pendente: 'bg-amber-100 text-amber-900 border-amber-400',
  aprovada: 'bg-green-100 text-green-900 border-green-500',
  rejeitada: 'bg-red-100 text-red-900 border-red-400',
  em_execucao: 'bg-blue-100 text-blue-900 border-blue-400',
  concluida: 'bg-zinc-200 text-zinc-700 border-zinc-400',
  cancelada: 'bg-zinc-100 text-zinc-500 border-zinc-300 line-through',
};

export const DATA_INICIAL_LABEL: Record<DataInicial, string> = {
  imediatamente: 'Imediatamente',
  em_2_dias: 'Em 2 dias',
  em_5_dias: 'Em 5 dias',
  em_1_semana: 'Em 1 semana',
  em_1_mes: 'Em 1 mês',
};

export const CAMERAS_LABEL: Record<string, string> = {
  todas: 'Todas',
  apenas_frontal: 'Apenas frontal',
  frontal_e_traseira: 'Frontal e traseira',
  apenas_fotos: 'Apenas fotos',
};
