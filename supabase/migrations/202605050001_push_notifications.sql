create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;
create extension if not exists supabase_vault with schema vault;

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null unique,
  device_platform text not null check (device_platform in ('ios', 'android', 'web', 'unknown')),
  device_name text,
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  disabled_at timestamptz,
  disabled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  master_enabled boolean not null default true,
  chat_messages boolean not null default true,
  event_reminders boolean not null default true,
  host_updates boolean not null default true,
  joins boolean not null default true,
  safety_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create type public.notification_delivery_status as enum (
    'queued',
    'sent',
    'error',
    'skipped'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_key text not null unique,
  notification_type text not null check (
    notification_type in (
      'event_chat',
      'event_joined',
      'event_update',
      'event_cancelled',
      'event_reminder',
      'report_update'
    )
  ),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  push_token_id uuid references public.push_tokens(id) on delete set null,
  expo_push_token text,
  event_id uuid references public.events(id) on delete cascade,
  message_id uuid references public.event_messages(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  reminder_offset_minutes integer,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  status public.notification_delivery_status not null default 'queued',
  expo_ticket_id text,
  expo_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists push_tokens_user_active_idx
  on public.push_tokens(user_id, active);
create index if not exists notification_deliveries_recipient_idx
  on public.notification_deliveries(recipient_id, created_at desc);
create index if not exists notification_deliveries_type_idx
  on public.notification_deliveries(notification_type, created_at desc);
create index if not exists notification_deliveries_event_idx
  on public.notification_deliveries(event_id, notification_type);

alter table public.push_tokens enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "Users can read own push tokens" on public.push_tokens;
create policy "Users can read own push tokens"
on public.push_tokens for select
using (auth.uid() = user_id);

drop policy if exists "Users can register own push tokens" on public.push_tokens;
create policy "Users can register own push tokens"
on public.push_tokens for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own push tokens" on public.push_tokens;
create policy "Users can update own push tokens"
on public.push_tokens for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own push tokens" on public.push_tokens;
create policy "Users can delete own push tokens"
on public.push_tokens for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own notification preferences" on public.notification_preferences;
create policy "Users can read own notification preferences"
on public.notification_preferences for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own notification preferences" on public.notification_preferences;
create policy "Users can create own notification preferences"
on public.notification_preferences for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notification preferences" on public.notification_preferences;
create policy "Users can update own notification preferences"
on public.notification_preferences for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists push_tokens_set_updated_at on public.push_tokens;
create trigger push_tokens_set_updated_at
before update on public.push_tokens
for each row execute function public.set_updated_at();

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

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

create or replace function public.get_outgo_vault_secret(secret_name text)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  secret_value text;
begin
  select decrypted_secret
  into secret_value
  from vault.decrypted_secrets
  where name = secret_name
  limit 1;

  return secret_value;
exception
  when undefined_table or invalid_schema_name then
    return null;
end;
$$;

revoke execute on function public.get_outgo_vault_secret(text) from public, anon, authenticated;

create or replace function public.invoke_outgo_push_dispatch(
  notification_type text,
  notification_record jsonb,
  old_notification_record jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions, net, vault
as $$
declare
  project_url text;
  webhook_secret text;
begin
  project_url := public.get_outgo_vault_secret('outgo_project_url');
  if project_url is null then
    project_url := public.get_outgo_vault_secret('project_url');
  end if;

  webhook_secret := public.get_outgo_vault_secret('outgo_push_webhook_secret');

  if project_url is null or webhook_secret is null then
    raise log 'OutGo push dispatch skipped: missing outgo_project_url/project_url or outgo_push_webhook_secret vault secret.';
    return;
  end if;

  perform net.http_post(
    url := rtrim(project_url, '/') || '/functions/v1/push-dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-outgo-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'type', notification_type,
      'record', notification_record,
      'old_record', old_notification_record
    ),
    timeout_milliseconds := 2000
  );
exception
  when others then
    raise warning 'OutGo push dispatch failed: %', sqlerrm;
end;
$$;

revoke execute on function public.invoke_outgo_push_dispatch(text, jsonb, jsonb) from public, anon, authenticated;

create or replace function public.invoke_outgo_event_reminders()
returns void
language plpgsql
security definer
set search_path = public, extensions, net, vault
as $$
declare
  project_url text;
  webhook_secret text;
begin
  project_url := public.get_outgo_vault_secret('outgo_project_url');
  if project_url is null then
    project_url := public.get_outgo_vault_secret('project_url');
  end if;

  webhook_secret := public.get_outgo_vault_secret('outgo_push_webhook_secret');

  if project_url is null or webhook_secret is null then
    raise log 'OutGo event reminders skipped: missing outgo_project_url/project_url or outgo_push_webhook_secret vault secret.';
    return;
  end if;

  perform net.http_post(
    url := rtrim(project_url, '/') || '/functions/v1/send-event-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-outgo-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object('requested_at', now()),
    timeout_milliseconds := 2000
  );
exception
  when others then
    raise warning 'OutGo event reminder invocation failed: %', sqlerrm;
end;
$$;

revoke execute on function public.invoke_outgo_event_reminders() from public, anon, authenticated;

create or replace function public.notify_event_message_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.invoke_outgo_push_dispatch('event_chat', to_jsonb(new), null);
  return new;
end;
$$;

drop trigger if exists event_messages_notify_push on public.event_messages;
create trigger event_messages_notify_push
after insert on public.event_messages
for each row execute function public.notify_event_message_inserted();

create or replace function public.notify_event_participant_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.invoke_outgo_push_dispatch('event_joined', to_jsonb(new), null);
  return new;
end;
$$;

drop trigger if exists event_participants_notify_push on public.event_participants;
create trigger event_participants_notify_push
after insert on public.event_participants
for each row execute function public.notify_event_participant_inserted();

create or replace function public.notify_event_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status and new.status = 'cancelled' then
    perform public.invoke_outgo_push_dispatch('event_cancelled', to_jsonb(new), to_jsonb(old));
    return new;
  end if;

  if old.title is distinct from new.title
    or old.description is distinct from new.description
    or old.location_name is distinct from new.location_name
    or old.start_time is distinct from new.start_time
    or old.end_time is distinct from new.end_time
    or old.status is distinct from new.status
    or old.safety_note is distinct from new.safety_note then
    perform public.invoke_outgo_push_dispatch('event_update', to_jsonb(new), to_jsonb(old));
  end if;

  return new;
end;
$$;

drop trigger if exists events_notify_push on public.events;
create trigger events_notify_push
after update on public.events
for each row execute function public.notify_event_updated();

create or replace function public.notify_report_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    perform public.invoke_outgo_push_dispatch('report_update', to_jsonb(new), to_jsonb(old));
  end if;

  return new;
end;
$$;

drop trigger if exists reports_notify_push on public.reports;
create trigger reports_notify_push
after update on public.reports
for each row execute function public.notify_report_updated();

do $$
begin
  perform cron.unschedule('outgo-event-reminders');
exception
  when others then null;
end $$;

select cron.schedule(
  'outgo-event-reminders',
  '*/5 * * * *',
  $$select public.invoke_outgo_event_reminders();$$
);
