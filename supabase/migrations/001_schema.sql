-- ============================================================
-- OS Rodovias — Schema inicial
-- Execute no SQL Editor do Supabase (ou via supabase db push)
-- ============================================================

-- ENUMs -------------------------------------------------------
create type papel as enum ('solicitante', 'aprovador', 'editor', 'admin');
create type tipo_levantamento as enum (
  'FWD', 'VDR', 'MUMETER', 'MANCHA_AREIA', 'PENDULO_BRITANICO',
  'VIGA_BENKELMAN', 'ICP', 'RETRO_REFLETANCIA', 'AMS_DBQ'
);
create type status_os as enum ('pendente', 'aprovada', 'rejeitada', 'em_execucao', 'concluida', 'cancelada');
create type data_inicial as enum ('imediatamente', 'em_2_dias', 'em_5_dias', 'em_1_semana', 'em_1_mes');

-- Perfis (espelho de auth.users com papel) --------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  nome              text not null,
  email             text unique not null,
  papel             papel not null default 'solicitante',
  ativo             boolean not null default true,
  deve_trocar_senha boolean not null default true,
  criado_em         timestamptz not null default now()
);

-- Cria profile automaticamente quando o Admin cadastra um usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, email, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    coalesce((new.raw_user_meta_data->>'papel')::papel, 'solicitante')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: papel do usuário logado (usado nas policies) --------
create or replace function public.current_papel()
returns papel language sql security definer stable set search_path = public as $$
  select papel from public.profiles where id = auth.uid() and ativo = true
$$;

-- Ordens de Serviço -------------------------------------------
create table public.ordens_servico (
  id              uuid primary key default gen_random_uuid(),
  numero_os       serial unique,
  solicitante_id  uuid not null references public.profiles (id),
  crs             text not null,
  tipo            tipo_levantamento not null,
  extensao_aprox  text not null,
  data_inicial    data_inicial not null,
  prazo_final     date not null,
  status          status_os not null default 'pendente',
  aprovado_por    uuid references public.profiles (id),
  aprovado_em     timestamptz,
  motivo_rejeicao text,
  detalhes        jsonb not null,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index idx_os_status on public.ordens_servico (status);
create index idx_os_solicitante on public.ordens_servico (solicitante_id);

create or replace function public.touch_atualizado_em()
returns trigger language plpgsql as $$
begin new.atualizado_em = now(); return new; end $$;

create trigger trg_os_touch before update on public.ordens_servico
  for each row execute function public.touch_atualizado_em();

-- Trilha de auditoria -----------------------------------------
create table public.historico_status (
  id              uuid primary key default gen_random_uuid(),
  os_id           uuid not null references public.ordens_servico (id) on delete cascade,
  status_anterior status_os,
  status_novo     status_os not null,
  alterado_por    uuid not null references public.profiles (id),
  alterado_em     timestamptz not null default now(),
  observacao      text
);

create index idx_hist_os on public.historico_status (os_id);

-- Anexos (KML, PDF, imagens — arquivos no bucket 'anexos') ----
create table public.anexos (
  id           uuid primary key default gen_random_uuid(),
  os_id        uuid not null references public.ordens_servico (id) on delete cascade,
  nome_arquivo text not null,
  tipo_mime    text not null,
  caminho      text not null,
  enviado_por  uuid not null references public.profiles (id),
  enviado_em   timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Leituras: direto do cliente, filtradas por RLS.
-- Escritas em OS: apenas via server actions (service role),
-- que validam papel + transição de status na aplicação.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.historico_status enable row level security;
alter table public.anexos enable row level security;

-- profiles: cada um vê o próprio; aprovador/editor/admin veem todos (nomes no dashboard)
create policy profiles_select on public.profiles for select using (
  id = auth.uid() or public.current_papel() in ('aprovador', 'editor', 'admin')
);

-- OS: solicitante vê as próprias; aprovador/editor/admin veem todas
create policy os_select on public.ordens_servico for select using (
  solicitante_id = auth.uid()
  or public.current_papel() in ('aprovador', 'editor', 'admin')
);

-- OS: solicitante, aprovador e admin podem criar (sempre em nome próprio)
create policy os_insert on public.ordens_servico for insert with check (
  solicitante_id = auth.uid()
  and public.current_papel() in ('solicitante', 'aprovador', 'admin')
  and status = 'pendente'
  and aprovado_por is null and aprovado_em is null
);

-- Histórico e anexos: visíveis a quem vê a OS
create policy hist_select on public.historico_status for select using (
  exists (select 1 from public.ordens_servico o where o.id = os_id)
);
create policy anexos_select on public.anexos for select using (
  exists (select 1 from public.ordens_servico o where o.id = os_id)
);
create policy anexos_insert on public.anexos for insert with check (
  enviado_por = auth.uid()
  and exists (select 1 from public.ordens_servico o where o.id = os_id)
);

-- ============================================================
-- VIEW para Power BI (achata o JSONB e calcula SLAs)
-- Conecte o Power BI direto no Postgres do Supabase e leia esta view.
-- ============================================================
create or replace view public.vw_ordens_completas as
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

-- ============================================================
-- STORAGE: crie o bucket 'anexos' (privado) no painel do Supabase.
-- Policies do bucket:
--   insert: authenticated
--   select: authenticated
-- ============================================================
