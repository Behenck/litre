-- Histórico append-only de preços por posto: uma linha por anotação, nunca
-- editada nem removida. `stations` continua guardando só o preço atual.
create table public.station_price_history (
  id text primary key,
  station_id text not null references public.stations(id) on delete cascade,
  gasoline_cents bigint check (gasoline_cents > 0),
  ethanol_cents bigint check (ethanol_cents > 0),
  diesel_cents bigint check (diesel_cents > 0),
  price_date date not null,
  recorded_by text references public.users(id) on delete set null,
  recorded_by_name text not null default '',
  recorded_at timestamptz not null
);

create index idx_station_price_history_station
  on public.station_price_history(station_id, price_date desc, recorded_at desc);

alter table public.station_price_history enable row level security;

create policy "Bloquear acesso direto" on public.station_price_history
  for all to anon, authenticated using (false) with check (false);

revoke all on table public.station_price_history from anon, authenticated;
grant select, insert, update, delete on table public.station_price_history to service_role;

comment on table public.station_price_history is 'Histórico append-only de preços anotados por posto.';
