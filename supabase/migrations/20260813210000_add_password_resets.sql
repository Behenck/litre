-- Links de redefinição de senha ("esqueci minha senha").
--
-- Mesmo desenho de public.email_verifications: token de uso único guardado
-- como hash, ligado à conta, com prazo de validade.

create table public.password_resets (
  token_hash text primary key,
  user_id text not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null
);

create index idx_password_resets_user on public.password_resets(user_id);

alter table public.password_resets enable row level security;

create policy "Bloquear acesso direto" on public.password_resets
  for all to anon, authenticated using (false) with check (false);

revoke all on table public.password_resets from anon, authenticated;
grant select, insert, update, delete on table public.password_resets to service_role;

comment on table public.password_resets is 'Links de redefinição de senha, guardados como hash.';
