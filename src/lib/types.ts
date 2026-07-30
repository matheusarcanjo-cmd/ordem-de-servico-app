export type Papel = 'solicitante' | 'aprovador' | 'editor' | 'admin';
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

export type Tipo =
  // Geral
  | 'FWD' | 'VDR' | 'MUMETER' | 'MANCHA_AREIA' | 'PENDULO_BRITANICO'
  | 'VIGA_BENKELMAN' | 'ICP' | 'RETRO_REFLETANCIA' | 'AMS_DBQ'
  | 'CARRO_EMPRESTADO' | 'VISITA_TECNICA' | 'FEIRA_EVENTO' | 'GPR'
  // Geotecnia
  | 'SOND_POCOS_INSPECAO' | 'SOND_TRADO' | 'SOND_ROTATIVAS'
  | 'LEV_OCORRENCIAS' | 'COLETA_OCORRENCIAS'
  // Geoprocessamento
  | 'DEVOLUCAO_EQUIP' | 'TOPO_CONVENCIONAL' | 'TRK_500' | 'PEGASUS_TWO'
  | 'MATRICE_350' | 'BATIMETRIA' | 'LOCACAO_SONDAGENS' | 'LOCACAO_TOPOGRAFICA'
  | 'CAD_RODOVIARIO' | 'CAD_FERROVIARIO' | 'RASTREAMENTO_GNSS'
  | 'MONITORAMENTO_GEO' | 'VISTORIA_FISCALIZACAO' | 'MANUTENCAO_CALIBRACAO'
  | 'REUNIAO_TECNICA' | 'COLETA_PROPOSTA'
  // Tráfego
  | 'CVC' | 'PESQUISA_OD';

export const TIPO_LABEL: Record<Tipo, string> = {
  // Geral
  FWD: 'FWD - Ensaio Defletométrico',
  VDR: 'VDR - Vídeo Registro / IRI / FCH',
  MUMETER: 'MuMeter - Ensaio de Atrito',
  MANCHA_AREIA: 'Mancha de Areia - Ensaio de Macrotextura',
  PENDULO_BRITANICO: 'Pêndulo Britânico - Ensaio de Atrito',
  VIGA_BENKELMAN: 'Viga Benkelman - Ensaio Deflectométrico',
  ICP: 'ICP',
  RETRO_REFLETANCIA: 'Retro Refletância',
  AMS_DBQ: 'AMS/DBQ - Demarcação',
  CARRO_EMPRESTADO: 'Carro Emprestado',
  VISITA_TECNICA: 'Visita Técnica',
  FEIRA_EVENTO: 'Feira/Evento',
  GPR: 'GPR',
  // Geotecnia
  SOND_POCOS_INSPECAO: 'Sondagens de Poços de Inspeção',
  SOND_TRADO: 'Sondagens a Trado',
  SOND_ROTATIVAS: 'Sondagens Rotativas',
  LEV_OCORRENCIAS: 'Levantamento de Ocorrências',
  COLETA_OCORRENCIAS: 'Coleta de Ocorrências',
  // Geoprocessamento
  DEVOLUCAO_EQUIP: 'Devolução de Equipamentos Alugados',
  TOPO_CONVENCIONAL: 'Levantamento Topográfico Convencional',
  TRK_500: 'Levantamento com TRK-500 (Pegasus TRK 500 EVO)',
  PEGASUS_TWO: 'Levantamento Pegasus Two Ultimate',
  MATRICE_350: 'Levantamento com Matrice 350 (RTK/LiDAR – AlphaAir)',
  BATIMETRIA: 'Batimetria',
  LOCACAO_SONDAGENS: 'Locação de Sondagens',
  LOCACAO_TOPOGRAFICA: 'Locação Topográfica (obra)',
  CAD_RODOVIARIO: 'Cadastro/Inventário Rodoviário',
  CAD_FERROVIARIO: 'Cadastro/Inventário Ferroviário',
  RASTREAMENTO_GNSS: 'Rastreamento GNSS (Marco Base/RBMC)',
  MONITORAMENTO_GEO: 'Monitoramento Geotécnico/Estrutural',
  VISTORIA_FISCALIZACAO: 'Vistoria Técnica/Fiscalização',
  MANUTENCAO_CALIBRACAO: 'Manutenção/Calibração de Equipamentos',
  REUNIAO_TECNICA: 'Reunião Técnica com Cliente',
  COLETA_PROPOSTA: 'Coleta de Dados para Elaboração de Proposta/Edital',
  // Tráfego
  CVC: 'Contagem Volumétrica Classificatória (CVC)',
  PESQUISA_OD: 'Pesquisa Origem e Destino (OD)',
};

/** Rótulo curto para badges do Kanban e da tabela. */
export const TIPO_CURTO: Record<Tipo, string> = {
  FWD: 'FWD',
  VDR: 'VDR',
  MUMETER: 'MuMeter',
  MANCHA_AREIA: 'M. Areia',
  PENDULO_BRITANICO: 'Pêndulo',
  VIGA_BENKELMAN: 'Viga B.',
  ICP: 'ICP',
  RETRO_REFLETANCIA: 'Retro',
  AMS_DBQ: 'AMS/DBQ',
  CARRO_EMPRESTADO: 'Carro',
  VISITA_TECNICA: 'Visita',
  FEIRA_EVENTO: 'Feira',
  GPR: 'GPR',
  SOND_POCOS_INSPECAO: 'Sond. PI',
  SOND_TRADO: 'S. Trado',
  SOND_ROTATIVAS: 'S. Rotat.',
  LEV_OCORRENCIAS: 'Lev. Oc.',
  COLETA_OCORRENCIAS: 'Col. Oc.',
  DEVOLUCAO_EQUIP: 'Devol.',
  TOPO_CONVENCIONAL: 'Topo',
  TRK_500: 'TRK-500',
  PEGASUS_TWO: 'Pegasus',
  MATRICE_350: 'M350',
  BATIMETRIA: 'Batim.',
  LOCACAO_SONDAGENS: 'Loc. Son.',
  LOCACAO_TOPOGRAFICA: 'Loc. Topo',
  CAD_RODOVIARIO: 'Cad. Rod.',
  CAD_FERROVIARIO: 'Cad. Fer.',
  RASTREAMENTO_GNSS: 'GNSS',
  MONITORAMENTO_GEO: 'Monit.',
  VISTORIA_FISCALIZACAO: 'Vistoria',
  MANUTENCAO_CALIBRACAO: 'Manut.',
  REUNIAO_TECNICA: 'Reunião',
  COLETA_PROPOSTA: 'Proposta',
  CVC: 'CVC',
  PESQUISA_OD: 'OD',
};

/** Agrupamento por departamento — ordem exibida na lista suspensa. */
export const DEPARTAMENTOS: { nome: string; tipos: Tipo[] }[] = [
  {
    nome: 'Geral',
    tipos: [
      'FWD', 'VDR', 'MUMETER', 'MANCHA_AREIA', 'PENDULO_BRITANICO',
      'VIGA_BENKELMAN', 'ICP', 'RETRO_REFLETANCIA', 'AMS_DBQ',
      'CARRO_EMPRESTADO', 'VISITA_TECNICA', 'FEIRA_EVENTO', 'GPR',
    ],
  },
  {
    nome: 'Geotecnia',
    tipos: [
      'SOND_POCOS_INSPECAO', 'SOND_TRADO', 'SOND_ROTATIVAS',
      'LEV_OCORRENCIAS', 'COLETA_OCORRENCIAS',
    ],
  },
  {
    nome: 'Geoprocessamento',
    tipos: [
      'DEVOLUCAO_EQUIP', 'TOPO_CONVENCIONAL', 'TRK_500', 'PEGASUS_TWO',
      'MATRICE_350', 'BATIMETRIA', 'LOCACAO_SONDAGENS', 'LOCACAO_TOPOGRAFICA',
      'CAD_RODOVIARIO', 'CAD_FERROVIARIO', 'RASTREAMENTO_GNSS',
      'MONITORAMENTO_GEO', 'VISTORIA_FISCALIZACAO', 'MANUTENCAO_CALIBRACAO',
      'REUNIAO_TECNICA', 'COLETA_PROPOSTA',
    ],
  },
  {
    nome: 'Tráfego',
    tipos: ['CVC', 'PESQUISA_OD'],
  },
];

/** Tipos que usam apenas o campo livre de detalhamento (todos, menos FWD e VDR). */
export const TIPOS_SIMPLES: Tipo[] = (Object.keys(TIPO_LABEL) as Tipo[]).filter(
  (t) => t !== 'FWD' && t !== 'VDR'
);

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
