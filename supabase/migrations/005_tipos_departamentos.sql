-- Novos tipos por departamento (Geral, Geotecnia, Geoprocessamento)
-- Execute no SQL Editor. Cada linha é independente e idempotente.
alter type tipo_levantamento add value if not exists 'CVC';
alter type tipo_levantamento add value if not exists 'PESQUISA_OD';
