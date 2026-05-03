create extension if not exists pgcrypto;
create extension if not exists citext;

do $$ begin
  create type public.event_category as enum (
    'coffee',
    'walk',
    'study',
    'sport',
    'board_games',
    'language_exchange',
    'food',
    'culture',
    'volunteering',
    'no_phone',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.price_type as enum ('free', 'paid', 'donation');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.event_status as enum (
    'draft',
    'published',
    'cancelled',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username citext not null unique,
  avatar_url text,
  bio text,
  city text not null default '',
  age_range text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  constraint bio_length check (char_length(coalesce(bio, '')) <= 220)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category public.event_category not null,
  vibe text not null,
  location_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  city text not null default '',
  start_time timestamptz not null,
  end_time timestamptz,
  max_participants integer not null,
  price_type public.price_type not null default 'free',
  price_amount numeric(10,2),
  host_id uuid not null references public.profiles(id) on delete cascade,
  status public.event_status not null default 'published',
  safety_note text,
  moderation_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint title_length check (char_length(title) between 3 and 120),
  constraint description_length check (char_length(description) between 10 and 1200),
  constraint valid_coordinates check (
    latitude between -90 and 90 and longitude between -180 and 180
  ),
  constraint valid_group_size check (max_participants between 2 and 20),
  constraint valid_event_time check (
    end_time is null or end_time > start_time
  ),
  constraint valid_price check (
    (price_type = 'free' and price_amount is null)
    or (price_type in ('paid', 'donation') and price_amount is not null and price_amount >= 0)
  ),
  constraint safety_note_length check (char_length(coalesce(safety_note, '')) <= 240)
);

create table if not exists public.event_participants (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.event_favorites (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint message_body_length check (
    char_length(trim(body)) between 1 and 500
  )
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_event_id uuid references public.events(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  report_type text not null check (
    report_type in ('safety', 'spam', 'harassment', 'misleading', 'other')
  ),
  reason text not null,
  details text,
  status text not null default 'open' check (
    status in ('open', 'reviewed', 'dismissed')
  ),
  created_at timestamptz not null default now(),
  constraint one_report_target check (
    (reported_event_id is not null and reported_user_id is null)
    or (reported_event_id is null and reported_user_id is not null)
  ),
  constraint report_reason_length check (char_length(reason) between 4 and 280),
  constraint report_details_length check (char_length(coalesce(details, '')) <= 600)
);

create index if not exists profiles_city_idx on public.profiles(city);
create index if not exists events_city_start_idx on public.events(city, start_time);
create index if not exists events_category_idx on public.events(category);
create index if not exists events_host_idx on public.events(host_id);
create index if not exists events_status_idx on public.events(status);
create index if not exists event_messages_event_created_idx
  on public.event_messages(event_id, created_at);
create index if not exists reports_status_idx on public.reports(status);

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

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user_' || replace(substring(new.id::text from 1 for 8), '-', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_event_member(
  target_event_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and e.host_id = target_user_id
  )
  or exists (
    select 1
    from public.event_participants ep
    where ep.event_id = target_event_id
      and ep.user_id = target_user_id
  );
$$;

create or replace function public.can_join_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and e.status = 'published'
      and e.start_time > now()
      and e.host_id <> auth.uid()
      and (
        select count(*)
        from public.event_participants ep
        where ep.event_id = e.id
      ) < e.max_participants
  );
$$;

create or replace function public.validate_event_join()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_join_event(new.event_id) then
    raise exception 'Event is not joinable';
  end if;

  return new;
end;
$$;

drop trigger if exists event_participants_validate_join
on public.event_participants;
create trigger event_participants_validate_join
before insert on public.event_participants
for each row execute function public.validate_event_join();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.event_favorites enable row level security;
alter table public.event_messages enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select
using (true);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Published events are readable" on public.events;
create policy "Published events are readable"
on public.events for select
using (
  status = 'published'
  or host_id = auth.uid()
  or public.is_event_member(id, auth.uid())
);

drop policy if exists "Users can create events as themselves" on public.events;
create policy "Users can create events as themselves"
on public.events for insert
with check (auth.uid() = host_id);

drop policy if exists "Hosts can update own events" on public.events;
create policy "Hosts can update own events"
on public.events for update
using (auth.uid() = host_id)
with check (auth.uid() = host_id);

drop policy if exists "Hosts can delete own events" on public.events;
create policy "Hosts can delete own events"
on public.events for delete
using (auth.uid() = host_id);

drop policy if exists "Participants visible for published or own events"
on public.event_participants;
create policy "Participants visible for published or own events"
on public.event_participants for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.events e
    where e.id = event_id
      and (e.status = 'published' or e.host_id = auth.uid())
  )
);

drop policy if exists "Users can join published events"
on public.event_participants;
create policy "Users can join published events"
on public.event_participants for insert
with check (
  auth.uid() = user_id
  and public.can_join_event(event_id)
);

drop policy if exists "Users can leave joined events"
on public.event_participants;
create policy "Users can leave joined events"
on public.event_participants for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own favorites" on public.event_favorites;
create policy "Users can read own favorites"
on public.event_favorites for select
using (auth.uid() = user_id);

drop policy if exists "Users can favorite published events"
on public.event_favorites;
create policy "Users can favorite published events"
on public.event_favorites for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.status = 'published'
  )
);

drop policy if exists "Users can remove own favorites"
on public.event_favorites;
create policy "Users can remove own favorites"
on public.event_favorites for delete
using (auth.uid() = user_id);

drop policy if exists "Event chat visible to members" on public.event_messages;
create policy "Event chat visible to members"
on public.event_messages for select
using (public.is_event_member(event_id, auth.uid()));

drop policy if exists "Event members can send chat messages"
on public.event_messages;
create policy "Event members can send chat messages"
on public.event_messages for insert
with check (
  auth.uid() = sender_id
  and public.is_event_member(event_id, auth.uid())
);

drop policy if exists "Users can read own reports" on public.reports;
create policy "Users can read own reports"
on public.reports for select
using (auth.uid() = reporter_id);

drop policy if exists "Users can create reports" on public.reports;
create policy "Users can create reports"
on public.reports for insert
with check (auth.uid() = reporter_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'event_messages'
  ) then
    alter publication supabase_realtime add table public.event_messages;
  end if;
end $$;
