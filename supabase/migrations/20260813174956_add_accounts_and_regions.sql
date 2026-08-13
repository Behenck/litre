-- Contas, sessões e postos por praça.
--
-- ATENÇÃO: veículos, abastecimentos e postos existentes são apagados. Eles
-- foram criados antes de existir usuário, então não há a quem atribuí-los —
-- `npm run db:seed` recarrega o conjunto de demonstração já com dono.

create table public.users (
  id text primary key,
  name text not null check (char_length(name) between 2 and 60),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  city text not null check (char_length(city) between 2 and 60),
  state text not null check (state ~ '^[A-Z]{2}$'),
  region_key text not null,
  -- Nulo enquanto o e-mail não foi confirmado; sem isso não há login.
  email_verified_at timestamptz,
  created_at timestamptz not null
);

create index idx_users_region on public.users(region_key);

-- O JWT é só o portador: quem decide se a sessão vale é a linha aqui. Sair da
-- conta apaga a linha e o token para de valer na hora.
create table public.sessions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  -- SHA-256 do JWT emitido: nem o banco guarda o token inteiro.
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null
);

create index idx_sessions_user on public.sessions(user_id);
create index idx_sessions_expires on public.sessions(expires_at);

create table public.email_verifications (
  token_hash text primary key,
  user_id text not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null
);

create index idx_email_verifications_user on public.email_verifications(user_id);

-- Veículo e abastecimento passam a ser privados do motorista.
delete from public.fill_ups;
delete from public.vehicles;

alter table public.vehicles add column user_id text not null references public.users(id) on delete cascade;
alter table public.fill_ups add column user_id text not null references public.users(id) on delete cascade;

create index idx_vehicles_user on public.vehicles(user_id, created_at);
create index idx_fill_ups_user on public.fill_ups(user_id, vehicle_id, odometer);

-- O posto continua coletivo, mas agora dentro de uma praça: dois "Ipiranga
-- Centro" em cidades diferentes são dois postos.
delete from public.stations;

alter table public.stations add column city text not null check (char_length(city) between 2 and 60);
alter table public.stations add column state text not null check (state ~ '^[A-Z]{2}$');
alter table public.stations add column region_key text not null;
alter table public.stations add column updated_by text references public.users(id) on delete set null;
alter table public.stations add column updated_by_name text not null default '';

alter table public.stations drop constraint stations_name_key_key;
create unique index idx_stations_region_name on public.stations(region_key, name_key);
create index idx_stations_region on public.stations(region_key, updated_at desc);

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.email_verifications enable row level security;

-- Como nas demais tabelas: o app fala com o banco só pelo servidor, com a
-- secret key. Navegador nenhum chega aqui — muito menos na tabela de senhas.
create policy "Bloquear acesso direto" on public.users
  for all to anon, authenticated using (false) with check (false);
create policy "Bloquear acesso direto" on public.sessions
  for all to anon, authenticated using (false) with check (false);
create policy "Bloquear acesso direto" on public.email_verifications
  for all to anon, authenticated using (false) with check (false);

revoke all on table public.users, public.sessions, public.email_verifications from anon, authenticated;
grant select, insert, update, delete
  on table public.users, public.sessions, public.email_verifications to service_role;

comment on table public.users is 'Contas do Litro. A senha é guardada como hash scrypt.';
comment on table public.sessions is 'Sessões de login; a linha é o que faz o JWT valer.';
comment on table public.email_verifications is 'Links de confirmação de e-mail, guardados como hash.';
comment on column public.stations.region_key is 'Praça do posto (UF:cidade) — escopo de quem vê e edita o preço.';
