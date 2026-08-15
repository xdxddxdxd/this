create table if not exists public.user_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  wrong_option text,
  wrong_word text not null,
  correct_word text not null,
  rule_category text not null,
  explanation text not null,
  coach_note text,
  difficulty_score smallint check (difficulty_score between 1 and 10),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_errors_user_created_idx on public.user_errors (user_id, created_at desc);

create table if not exists public.sentence_pool (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  sentence_text text not null,
  has_error boolean not null,
  wrong_word text,
  correct_word text,
  rule_category text not null,
  explanation text,
  coach_note text,
  created_at timestamptz not null default now(),
  unique (owner_id, sentence_text)
);

create table if not exists public.user_sentence_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  sentence_id uuid not null references public.sentence_pool(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (user_id, sentence_id)
);

create table if not exists public.tdk_cache (
  word text primary key,
  is_valid boolean not null,
  correct_form text,
  meanings jsonb not null default '[]'::jsonb,
  rule_category text,
  explanation text,
  updated_at timestamptz not null default now()
);

alter table public.user_errors enable row level security;
alter table public.sentence_pool enable row level security;
alter table public.user_sentence_history enable row level security;
alter table public.tdk_cache enable row level security;

create policy "Users manage only their errors" on public.user_errors for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage only their sentence pool" on public.sentence_pool for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Users manage only their history" on public.user_sentence_history for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Authenticated users read dictionary cache" on public.tdk_cache for select to authenticated using (true);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists user_errors_set_updated_at on public.user_errors;
create trigger user_errors_set_updated_at before update on public.user_errors for each row execute function public.set_updated_at();
