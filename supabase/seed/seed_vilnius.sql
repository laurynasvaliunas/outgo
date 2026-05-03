-- Legacy filename kept for compatibility; demo data now covers multiple cities.

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  is_anonymous,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo-host@outgo.app',
    crypt('outgo123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"OutGo Host","email_verified":true}'::jsonb,
    false,
    false,
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo-walker@outgo.app',
    crypt('outgo123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Global Walker","email_verified":true}'::jsonb,
    false,
    false,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    jsonb_build_object(
      'sub', '11111111-1111-4111-8111-111111111111',
      'email', 'demo-host@outgo.app',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    jsonb_build_object(
      'sub', '22222222-2222-4222-8222-222222222222',
      'email', 'demo-walker@outgo.app',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do update set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = excluded.updated_at;

insert into public.profiles (
  id,
  full_name,
  username,
  bio,
  city,
  age_range,
  interests
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'OutGo Host',
    'outgo_host',
    'I host small, friendly plans in public places.',
    'Berlin',
    '25-34',
    array['coffee', 'walks', 'board games']
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Global Walker',
    'global_walker',
    'Mostly outdoors, usually low-pressure.',
    'Lisbon',
    '25-34',
    array['parks', 'language exchange', 'culture']
  )
on conflict (id) do update set
  full_name = excluded.full_name,
  username = excluded.username,
  bio = excluded.bio,
  city = excluded.city,
  age_range = excluded.age_range,
  interests = excluded.interests;

delete from public.events
where host_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
)
and title in (
  'Quiet coffee after work',
  'Bernardine Garden walk',
  'Library study block',
  'Beginner language exchange',
  'No-phone board games',
  'Quiet coffee near the station',
  'Riverside walk',
  'Library study block',
  'Beginner language exchange',
  'No-phone board games'
);

insert into public.events (
  id,
  title,
  description,
  category,
  vibe,
  location_name,
  latitude,
  longitude,
  city,
  start_time,
  end_time,
  max_participants,
  price_type,
  price_amount,
  host_id,
  status,
  safety_note
)
values
  (
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'Quiet coffee near the station',
    'A small table for people who want an easy first meetup. We will keep introductions simple and chat about favorite neighborhood spots.',
    'coffee',
    'No pressure',
    'Public cafe near Berlin Hauptbahnhof',
    52.5251,
    13.3694,
    'Berlin',
    now() + interval '2 days' + interval '18 hours',
    now() + interval '2 days' + interval '19 hours 30 minutes',
    6,
    'paid',
    5,
    '11111111-1111-4111-8111-111111111111',
    'published',
    'Meet inside by the front counter. Public venue, small group, leave whenever you need.'
  ),
  (
    'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
    'Riverside walk',
    'A gentle public route by the water. Good for people who prefer side-by-side conversation.',
    'walk',
    'Outdoor',
    'Cais do Sodre riverside entrance',
    38.7057,
    -9.1444,
    'Lisbon',
    now() + interval '3 days' + interval '11 hours',
    now() + interval '3 days' + interval '12 hours 15 minutes',
    8,
    'free',
    null,
    '22222222-2222-4222-8222-222222222222',
    'published',
    'Meet at the public entrance. Wear comfortable shoes and check the weather.'
  ),
  (
    'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
    'Library study block',
    'Two quiet focus rounds with a short break. Say hello at the start, then work on your own project or reading.',
    'study',
    'Focused',
    'New York Public Library main entrance',
    40.7532,
    -73.9822,
    'New York',
    now() + interval '4 days' + interval '16 hours',
    now() + interval '4 days' + interval '18 hours',
    5,
    'free',
    null,
    '11111111-1111-4111-8111-111111111111',
    'published',
    'Public library setting. Keep valuables with you and respect quiet areas.'
  ),
  (
    'aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa',
    'Beginner language exchange',
    'English and Japanese practice in pairs. No tests, no pressure, just friendly conversation prompts.',
    'language_exchange',
    'Beginner-friendly',
    'Public cafe near Shibuya crossing',
    35.6595,
    139.7005,
    'Tokyo',
    now() + interval '5 days' + interval '18 hours',
    now() + interval '5 days' + interval '19 hours 30 minutes',
    10,
    'donation',
    2,
    '22222222-2222-4222-8222-222222222222',
    'published',
    'Public cafe. Host will bring a small sign and conversation cards.'
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    'No-phone board games',
    'Casual board games with phones away during each round. Good for people who like a clear activity.',
    'board_games',
    'Phone-light',
    'Public board game cafe',
    48.8566,
    2.3522,
    'Paris',
    now() + interval '6 days' + interval '17 hours',
    now() + interval '6 days' + interval '20 hours',
    7,
    'paid',
    4,
    '11111111-1111-4111-8111-111111111111',
    'published',
    'Public venue. Phones away is optional but encouraged during games.'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  vibe = excluded.vibe,
  location_name = excluded.location_name,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  city = excluded.city,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  max_participants = excluded.max_participants,
  price_type = excluded.price_type,
  price_amount = excluded.price_amount,
  host_id = excluded.host_id,
  status = excluded.status,
  safety_note = excluded.safety_note;
