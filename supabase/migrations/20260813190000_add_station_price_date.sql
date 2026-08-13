-- Data em que o motorista viu o preço (informada por ele), separada do
-- updated_at de auditoria (quando o registro foi salvo).
alter table public.stations add column price_date date;
update public.stations set price_date = updated_at::date;
alter table public.stations alter column price_date set not null;

comment on column public.stations.price_date is 'Data em que o motorista viu esse preço — diferente de updated_at.';
