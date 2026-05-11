-- Harden public RPC exposure, subscription payload storage, report retention,
-- and participant visibility after the initial MVP schema.

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

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscription_status'
      and column_name = 'raw_customer_info'
  ) then
    insert into public.subscription_status_raw (
      user_id,
      raw_customer_info,
      created_at,
      updated_at
    )
    select
      user_id,
      raw_customer_info,
      created_at,
      updated_at
    from public.subscription_status
    on conflict (user_id) do update
      set raw_customer_info = excluded.raw_customer_info,
          updated_at = now();

    alter table public.subscription_status
      drop column raw_customer_info;
  end if;
end $$;

alter table public.reports
  alter column reporter_id drop not null;

alter table public.reports
  drop constraint if exists reports_reporter_id_fkey,
  add constraint reports_reporter_id_fkey
    foreign key (reporter_id) references public.profiles(id) on delete set null;

alter table public.reports
  drop constraint if exists reports_reported_event_id_fkey,
  add constraint reports_reported_event_id_fkey
    foreign key (reported_event_id) references public.events(id) on delete set null;

alter table public.reports
  drop constraint if exists reports_reported_user_id_fkey,
  add constraint reports_reported_user_id_fkey
    foreign key (reported_user_id) references public.profiles(id) on delete set null;

alter table public.reports
  drop constraint if exists one_report_target,
  add constraint one_report_target check (
    (reported_event_id is null and reported_user_id is null)
    or (reported_event_id is not null and reported_user_id is null)
    or (reported_event_id is null and reported_user_id is not null)
  );

drop policy if exists "Participants visible for published or own events"
on public.event_participants;
drop policy if exists "Participants visible to event members and hosts"
on public.event_participants;
create policy "Participants visible to event members and hosts"
on public.event_participants for select
using (
  user_id = auth.uid()
  or public.is_event_member(event_id, auth.uid())
);

create or replace function public.get_event_participant_counts(
  target_event_ids uuid[]
)
returns table(event_id uuid, participant_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select e.id as event_id, count(ep.user_id)::integer as participant_count
  from public.events e
  left join public.event_participants ep on ep.event_id = e.id
  where e.id = any(target_event_ids)
    and (
      e.status = 'published'
      or e.host_id = auth.uid()
      or public.is_event_member(e.id, auth.uid())
    )
  group by e.id;
$$;

grant execute on function public.get_event_participant_counts(uuid[]) to anon, authenticated;

create or replace function public.ensure_notification_preferences(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> target_user_id then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  insert into public.notification_preferences (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

revoke execute on function public.ensure_notification_preferences(uuid) from public, anon;
grant execute on function public.ensure_notification_preferences(uuid) to authenticated;

revoke execute on function public.get_outgo_vault_secret(text) from public, anon, authenticated;
revoke execute on function public.invoke_outgo_push_dispatch(text, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.invoke_outgo_event_reminders() from public, anon, authenticated;
