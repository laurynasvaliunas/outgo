create table if not exists public.subscription_status (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  revenuecat_app_user_id text not null,
  entitlement_id text not null default 'outgo_plus',
  is_active boolean not null default false,
  product_id text,
  store text,
  environment text,
  expiration_at timestamptz,
  latest_event_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_status_raw (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  raw_customer_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists subscription_status_raw_set_updated_at
on public.subscription_status_raw;
create trigger subscription_status_raw_set_updated_at
before update on public.subscription_status_raw
for each row execute function public.set_updated_at();

alter table public.subscription_status_raw enable row level security;

revoke all on table public.subscription_status_raw from public, anon, authenticated;
grant select, insert, update, delete on table public.subscription_status_raw to service_role;

create index if not exists subscription_status_active_idx
  on public.subscription_status(is_active, expiration_at);

create index if not exists subscription_status_revenuecat_user_idx
  on public.subscription_status(revenuecat_app_user_id);

drop trigger if exists subscription_status_set_updated_at
on public.subscription_status;
create trigger subscription_status_set_updated_at
before update on public.subscription_status
for each row execute function public.set_updated_at();

alter table public.subscription_status enable row level security;

drop policy if exists "Users can read own subscription status"
on public.subscription_status;
create policy "Users can read own subscription status"
on public.subscription_status for select
using (auth.uid() = user_id);
