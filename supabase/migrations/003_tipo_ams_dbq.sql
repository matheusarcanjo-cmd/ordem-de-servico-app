-- Novo tipo de levantamento: AMS/DBQ - Demarcação
-- Execute esta única linha no SQL Editor (fora de transação com outros comandos).
alter type tipo_levantamento add value if not exists 'AMS_DBQ';
-- A view vw_ordens_completas já expõe a coluna "detalhamento" — nada mais a fazer.
