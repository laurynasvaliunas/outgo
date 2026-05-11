alter table public.profiles
add column if not exists hobbies text[] not null default '{}',
add column if not exists life_context text[] not null default '{}',
add column if not exists social_goals text[] not null default '{}';
