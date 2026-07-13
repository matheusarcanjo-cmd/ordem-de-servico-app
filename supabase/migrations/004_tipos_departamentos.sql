-- Novos tipos por departamento (Geral, Geotecnia, Geoprocessamento)
-- Execute no SQL Editor. Cada linha é independente e idempotente.
alter type tipo_levantamento add value if not exists 'CARRO_EMPRESTADO';
alter type tipo_levantamento add value if not exists 'VISITA_TECNICA';
alter type tipo_levantamento add value if not exists 'FEIRA_EVENTO';
alter type tipo_levantamento add value if not exists 'GPR';
alter type tipo_levantamento add value if not exists 'SOND_POCOS_INSPECAO';
alter type tipo_levantamento add value if not exists 'SOND_TRADO';
alter type tipo_levantamento add value if not exists 'SOND_ROTATIVAS';
alter type tipo_levantamento add value if not exists 'LEV_OCORRENCIAS';
alter type tipo_levantamento add value if not exists 'COLETA_OCORRENCIAS';
alter type tipo_levantamento add value if not exists 'DEVOLUCAO_EQUIP';
alter type tipo_levantamento add value if not exists 'TOPO_CONVENCIONAL';
alter type tipo_levantamento add value if not exists 'TRK_500';
alter type tipo_levantamento add value if not exists 'PEGASUS_TWO';
alter type tipo_levantamento add value if not exists 'MATRICE_350';
alter type tipo_levantamento add value if not exists 'BATIMETRIA';
alter type tipo_levantamento add value if not exists 'LOCACAO_SONDAGENS';
alter type tipo_levantamento add value if not exists 'LOCACAO_TOPOGRAFICA';
alter type tipo_levantamento add value if not exists 'CAD_RODOVIARIO';
alter type tipo_levantamento add value if not exists 'CAD_FERROVIARIO';
alter type tipo_levantamento add value if not exists 'RASTREAMENTO_GNSS';
alter type tipo_levantamento add value if not exists 'MONITORAMENTO_GEO';
alter type tipo_levantamento add value if not exists 'VISTORIA_FISCALIZACAO';
alter type tipo_levantamento add value if not exists 'MANUTENCAO_CALIBRACAO';
alter type tipo_levantamento add value if not exists 'REUNIAO_TECNICA';
alter type tipo_levantamento add value if not exists 'COLETA_PROPOSTA';
