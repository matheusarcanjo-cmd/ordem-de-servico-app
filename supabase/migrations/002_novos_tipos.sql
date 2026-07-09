-- Novos tipos de levantamento + coluna de detalhamento na view BI
-- (execute apenas se você já rodou a 001 antes desta atualização)
alter type tipo_levantamento add value if not exists 'MUMETER';
alter type tipo_levantamento add value if not exists 'MANCHA_AREIA';
alter type tipo_levantamento add value if not exists 'PENDULO_BRITANICO';
alter type tipo_levantamento add value if not exists 'VIGA_BENKELMAN';
alter type tipo_levantamento add value if not exists 'ICP';
alter type tipo_levantamento add value if not exists 'RETRO_REFLETANCIA';

-- CREATE OR REPLACE não aceita coluna nova no meio da view; drop e recria.
-- É apenas uma view: nenhum dado é perdido.
drop view if exists public.vw_ordens_completas;

create view public.vw_ordens_completas as
select
  o.numero_os,
  o.crs,
  o.tipo::text                             as tipo_levantamento,
  o.extensao_aprox,
  o.data_inicial::text                     as data_inicial_desejada,
  o.prazo_final,
  o.status::text,
  s.nome                                   as solicitante,
  a.nome                                   as aprovado_por,
  o.aprovado_em,
  o.motivo_rejeicao,
  o.detalhes ->> 'espacamento'             as fwd_espacamento,
  o.detalhes ->> 'detalhamento'            as detalhamento,
  o.detalhes ->> 'cameras'                 as vdr_cameras,
  (o.detalhes ->> 'gps_l1l2')::boolean     as vdr_gps_l1l2,
  (o.detalhes ->> 'todas_faixas')::boolean as todas_faixas,
  (o.detalhes ->> 'faixas_adicionais')::boolean as faixas_adicionais,
  (o.detalhes ->> 'marginais')::boolean    as marginais,
  o.criado_em,
  o.atualizado_em,
  extract(epoch from (o.aprovado_em - o.criado_em)) / 3600      as horas_ate_aprovacao,
  (select min(h.alterado_em) from public.historico_status h
    where h.os_id = o.id and h.status_novo = 'em_execucao')     as iniciada_em,
  (select min(h.alterado_em) from public.historico_status h
    where h.os_id = o.id and h.status_novo = 'concluida')       as concluida_em
from public.ordens_servico o
join public.profiles s on s.id = o.solicitante_id
left join public.profiles a on a.id = o.aprovado_por;
