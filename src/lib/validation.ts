import { z } from 'zod';

const simNao = z.boolean();

export const detalhesFWD = z.object({
  espacamento: z.string().min(1, 'Informe o espaçamento'),
  todas_faixas: simNao,
  faixas_adicionais: simNao,
  marginais: simNao,
});

export const detalhesVDR = z.object({
  cameras: z.enum(['todas', 'apenas_frontal', 'frontal_e_traseira', 'apenas_fotos']),
  gps_l1l2: simNao,
  todas_faixas: simNao,
  faixas_adicionais: simNao,
  marginais: simNao,
});

/** Tipos com campo livre de detalhamento do ensaio. */
export const detalhesSimples = z.object({
  detalhamento: z.string().trim().default(''),
});

const base = {
  crs: z.string().min(1, 'Informe o CRS'),
  extensao_aprox: z.string().min(1, 'Informe a extensão aproximada'),
  data_inicial: z.enum(['imediatamente', 'em_2_dias', 'em_5_dias', 'em_1_semana', 'em_1_mes']),
  prazo_final: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecione o prazo final'),
};

const simples = (tipo: string) =>
  z.object({ tipo: z.literal(tipo), ...base, detalhes: detalhesSimples });

export const novaOSSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('FWD'), ...base, detalhes: detalhesFWD }),
  z.object({ tipo: z.literal('VDR'), ...base, detalhes: detalhesVDR }),
  simples('MUMETER'),
  simples('MANCHA_AREIA'),
  simples('PENDULO_BRITANICO'),
  simples('VIGA_BENKELMAN'),
  simples('ICP'),
  simples('RETRO_REFLETANCIA'),
]);

export type NovaOSInput = z.infer<typeof novaOSSchema>;
