-- 理解万岁 · 初始 schema（Supabase Auth + Postgres + RLS）
-- 使用 Cursor 制作
-- 项目: https://qophqzbssamxrrjnsggu.supabase.co

-- ---------------------------------------------------------------------------
-- profiles：真名唯一；公开展示可用 real_name；审计用 id
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  real_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_real_name_unique unique (real_name)
);

create index if not exists profiles_email_idx on public.profiles (email);

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------
create table if not exists public.memberships (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'plus', 'super')),
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- instances / ratings / comments
-- ---------------------------------------------------------------------------
create table if not exists public.instances (
  id text primary key,
  title text not null,
  description text not null default '',
  scoring_mode text not null check (scoring_mode in ('scale_10', 'binary')),
  category text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists instances_created_by_idx on public.instances (created_by);
create index if not exists instances_category_idx on public.instances (category);

create table if not exists public.ratings (
  id text primary key,
  instance_id text not null references public.instances (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  score numeric not null,
  anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ratings_one_per_user unique (instance_id, author_id)
);

create index if not exists ratings_instance_idx on public.ratings (instance_id);
create index if not exists ratings_author_idx on public.ratings (author_id);

create table if not exists public.comments (
  id text primary key,
  instance_id text not null references public.instances (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_one_per_user unique (instance_id, author_id)
);

create index if not exists comments_instance_idx on public.comments (instance_id);

-- ---------------------------------------------------------------------------
-- feedback / announcements / sensitive / audit
-- ---------------------------------------------------------------------------
create table if not exists public.feedbacks (
  id text primary key,
  author_id uuid not null references public.profiles (id),
  body text not null,
  priority text not null default 'normal'
    check (priority in ('normal', 'plus', 'super')),
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null,
  super_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sensitive_words (
  word text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id text primary key,
  actor_id uuid not null references public.profiles (id),
  action text not null,
  entity_type text not null check (entity_type in ('instance', 'rating', 'comment')),
  entity_id text not null,
  created_at timestamptz not null default now(),
  payload jsonb
);

create index if not exists audit_events_actor_idx on public.audit_events (actor_id);
create index if not exists audit_events_created_idx on public.audit_events (created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.real_name_available(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where real_name = trim(p_name)
  );
$$;

revoke all on function public.real_name_available(text) from public;
grant execute on function public.real_name_available(text) to anon, authenticated;

-- 注册后自动建 profile + 默认 membership（真名来自 user_metadata.real_name）
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data->>'real_name', '')), '');
  if v_name is null then
    raise exception '务必填写真实姓名';
  end if;

  insert into public.profiles (id, real_name, email, role)
  values (new.id, v_name, coalesce(new.email, ''), 'user');

  insert into public.memberships (user_id, tier)
  values (new.id, 'free')
  on conflict (user_id) do nothing;

  return new;
exception
  when unique_violation then
    raise exception '真实姓名已被占用。若需证明身份，请发邮件至 support@ethan128.top';
      using errcode = '23505';
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception '不可自行修改角色';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.instances enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;
alter table public.feedbacks enable row level security;
alter table public.announcements enable row level security;
alter table public.sensitive_words enable row level security;
alter table public.audit_events enable row level security;

-- profiles
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- memberships
drop policy if exists "memberships_select_authenticated" on public.memberships;
create policy "memberships_select_authenticated"
  on public.memberships for select to authenticated
  using (true);

drop policy if exists "memberships_select_anon_tier" on public.memberships;
create policy "memberships_select_anon_tier"
  on public.memberships for select to anon
  using (true);

drop policy if exists "memberships_upsert_own_demo" on public.memberships;
create policy "memberships_upsert_own_demo"
  on public.memberships for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "memberships_update_own_demo" on public.memberships;
create policy "memberships_update_own_demo"
  on public.memberships for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "memberships_admin_all" on public.memberships;
create policy "memberships_admin_all"
  on public.memberships for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- instances：公开可读
drop policy if exists "instances_select_all" on public.instances;
create policy "instances_select_all"
  on public.instances for select to anon, authenticated
  using (true);

drop policy if exists "instances_insert_own" on public.instances;
create policy "instances_insert_own"
  on public.instances for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "instances_update_own_or_admin" on public.instances;
create policy "instances_update_own_or_admin"
  on public.instances for update to authenticated
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "instances_delete_own_or_admin" on public.instances;
create policy "instances_delete_own_or_admin"
  on public.instances for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- ratings：公开可读；本人可写
drop policy if exists "ratings_select_all" on public.ratings;
create policy "ratings_select_all"
  on public.ratings for select to anon, authenticated
  using (true);

drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own"
  on public.ratings for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own"
  on public.ratings for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "ratings_delete_own_or_admin" on public.ratings;
create policy "ratings_delete_own_or_admin"
  on public.ratings for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- comments
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all"
  on public.comments for select to anon, authenticated
  using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
  on public.comments for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own"
  on public.comments for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin"
  on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- feedbacks：本人可读自己的；管理员全读
drop policy if exists "feedbacks_select_own_or_admin" on public.feedbacks;
create policy "feedbacks_select_own_or_admin"
  on public.feedbacks for select to authenticated
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "feedbacks_insert_own" on public.feedbacks;
create policy "feedbacks_insert_own"
  on public.feedbacks for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "feedbacks_update_admin" on public.feedbacks;
create policy "feedbacks_update_admin"
  on public.feedbacks for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- announcements：公开；超级专属由应用层过滤
drop policy if exists "announcements_select_all" on public.announcements;
create policy "announcements_select_all"
  on public.announcements for select to anon, authenticated
  using (true);

drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write"
  on public.announcements for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- sensitive_words：公开读（打码用）；管理员写
drop policy if exists "sensitive_select_all" on public.sensitive_words;
create policy "sensitive_select_all"
  on public.sensitive_words for select to anon, authenticated
  using (true);

drop policy if exists "sensitive_admin_write" on public.sensitive_words;
create policy "sensitive_admin_write"
  on public.sensitive_words for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- audit：仅管理员
drop policy if exists "audit_admin_select" on public.audit_events;
create policy "audit_admin_select"
  on public.audit_events for select to authenticated
  using (public.is_admin());

drop policy if exists "audit_insert_authenticated" on public.audit_events;
create policy "audit_insert_authenticated"
  on public.audit_events for insert to authenticated
  with check (actor_id = auth.uid() or public.is_admin());
