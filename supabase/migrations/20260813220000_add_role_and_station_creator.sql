-- Papel do usuário e criador do posto.
--
-- Só existem dois papéis: admin e membro. Toda conta nasce membro; virar
-- admin só acontece direto no banco, nunca pelo app.
--
-- `updated_by` é sobrescrito a cada anotação de preço, então não serve para
-- saber quem pode apagar o posto. `created_by` entra separado e nunca muda
-- depois de gravado. Para posto já existente não há como saber quem criou de
-- fato — o melhor palpite é quem fez a última anotação até aqui.

alter table public.users add column role text not null default 'membro' check (role in ('admin', 'membro'));

alter table public.stations add column created_by text references public.users(id) on delete set null;
alter table public.stations add column created_by_name text not null default '';

update public.stations set created_by = updated_by, created_by_name = updated_by_name;

comment on column public.users.role is 'admin ou membro. Setado direto no banco — não há tela para isso.';
comment on column public.stations.created_by is 'Quem criou o posto. Só quem criou (ou um admin) pode apagar.';
