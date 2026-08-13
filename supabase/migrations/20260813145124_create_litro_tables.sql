create table public.vehicles (
  id text primary key,
  type text not null check (type in ('carro', 'moto')),
  brand text not null default '' check (char_length(brand) <= 40),
  model text not null check (char_length(model) between 1 and 60),
  year integer check (year between 1900 and 9999),
  plate text not null default '' check (plate = '' or plate ~ '^[A-Z0-9]{7}$'),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  color_name text not null,
  main_fuel text not null check (
    main_fuel in ('gasolina-comum', 'gasolina-aditivada', 'etanol', 'diesel', 'gnv', 'eletrico')
  ),
  nickname text not null default '' check (char_length(nickname) <= 40),
  initial_odometer double precision not null default 0 check (initial_odometer >= 0),
  created_at date not null
);

create table public.fill_ups (
  id text primary key,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  date date not null,
  odometer double precision not null check (odometer >= 0),
  liters double precision not null check (liters > 0),
  total_cents bigint not null check (total_cents > 0),
  fuel text not null check (
    fuel in ('gasolina-comum', 'gasolina-aditivada', 'etanol', 'diesel', 'gnv', 'eletrico')
  ),
  station_name text not null default '' check (char_length(station_name) <= 60),
  full_tank boolean not null default true,
  created_at date not null
);

create index idx_fill_ups_vehicle on public.fill_ups(vehicle_id, odometer);

create table public.stations (
  id text primary key,
  name text not null check (char_length(name) between 1 and 60),
  name_key text not null unique,
  gasoline_cents bigint check (gasoline_cents > 0),
  ethanol_cents bigint check (ethanol_cents > 0),
  diesel_cents bigint check (diesel_cents > 0),
  updated_at timestamptz not null
);

alter table public.vehicles enable row level security;
alter table public.fill_ups enable row level security;
alter table public.stations enable row level security;

-- O app acessa os dados somente no servidor com uma secret key. Não há acesso
-- direto pelo navegador e, portanto, anon/authenticated não recebem privilégios.
create policy "Bloquear acesso direto" on public.vehicles
  for all to anon, authenticated using (false) with check (false);
create policy "Bloquear acesso direto" on public.fill_ups
  for all to anon, authenticated using (false) with check (false);
create policy "Bloquear acesso direto" on public.stations
  for all to anon, authenticated using (false) with check (false);

revoke all on table public.vehicles, public.fill_ups, public.stations from anon, authenticated;
grant select, insert, update, delete on table public.vehicles, public.fill_ups, public.stations to service_role;

comment on table public.vehicles is 'Veículos cadastrados no Litro.';
comment on table public.fill_ups is 'Abastecimentos dos veículos, removidos em cascata com o veículo.';
comment on table public.stations is 'Preços mais recentes por posto, únicos pelo nome normalizado.';
