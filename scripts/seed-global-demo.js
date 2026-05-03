const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.join(__dirname, "..", ".env");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\n/)
    .filter(Boolean)
    .filter((line) => !line.trim().startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    email: "demo-host@outgo.app",
    password: "outgo123",
    fullName: "OutGo Host"
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    email: "demo-walker@outgo.app",
    password: "outgo123",
    fullName: "Global Walker"
  }
];

const profiles = [
  {
    id: users[0].id,
    full_name: "OutGo Host",
    username: "outgo_host",
    bio: "I host small, friendly plans in public places.",
    city: "Berlin",
    age_range: "25-34",
    interests: ["coffee", "walks", "board games"]
  },
  {
    id: users[1].id,
    full_name: "Global Walker",
    username: "global_walker",
    bio: "Mostly outdoors, usually low-pressure.",
    city: "Lisbon",
    age_range: "25-34",
    interests: ["parks", "language exchange", "culture"]
  }
];

const nowPlus = (days, hours = 0, minutes = 0) =>
  new Date(
    Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000
  ).toISOString();

const events = [
  {
    id: "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    title: "Quiet coffee near the station",
    description:
      "A small table for people who want an easy first meetup. We will keep introductions simple and chat about favorite neighborhood spots.",
    category: "coffee",
    vibe: "No pressure",
    location_name: "Public cafe near Berlin Hauptbahnhof",
    latitude: 52.5251,
    longitude: 13.3694,
    city: "Berlin",
    start_time: nowPlus(2, 18),
    end_time: nowPlus(2, 19, 30),
    max_participants: 6,
    price_type: "paid",
    price_amount: 5,
    host_id: users[0].id,
    status: "published",
    safety_note:
      "Meet inside by the front counter. Public venue, small group, leave whenever you need."
  },
  {
    id: "aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa",
    title: "Riverside walk",
    description:
      "A gentle public route by the water. Good for people who prefer side-by-side conversation.",
    category: "walk",
    vibe: "Outdoor",
    location_name: "Cais do Sodre riverside entrance",
    latitude: 38.7057,
    longitude: -9.1444,
    city: "Lisbon",
    start_time: nowPlus(3, 11),
    end_time: nowPlus(3, 12, 15),
    max_participants: 8,
    price_type: "free",
    price_amount: null,
    host_id: users[1].id,
    status: "published",
    safety_note:
      "Meet at the public entrance. Wear comfortable shoes and check the weather."
  },
  {
    id: "aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa",
    title: "Library study block",
    description:
      "Two quiet focus rounds with a short break. Say hello at the start, then work on your own project or reading.",
    category: "study",
    vibe: "Focused",
    location_name: "New York Public Library main entrance",
    latitude: 40.7532,
    longitude: -73.9822,
    city: "New York",
    start_time: nowPlus(4, 16),
    end_time: nowPlus(4, 18),
    max_participants: 5,
    price_type: "free",
    price_amount: null,
    host_id: users[0].id,
    status: "published",
    safety_note:
      "Public library setting. Keep valuables with you and respect quiet areas."
  },
  {
    id: "aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa",
    title: "Beginner language exchange",
    description:
      "English and Japanese practice in pairs. No tests, no pressure, just friendly conversation prompts.",
    category: "language_exchange",
    vibe: "Beginner-friendly",
    location_name: "Public cafe near Shibuya crossing",
    latitude: 35.6595,
    longitude: 139.7005,
    city: "Tokyo",
    start_time: nowPlus(5, 18),
    end_time: nowPlus(5, 19, 30),
    max_participants: 10,
    price_type: "donation",
    price_amount: 2,
    host_id: users[1].id,
    status: "published",
    safety_note:
      "Public cafe. Host will bring a small sign and conversation cards."
  },
  {
    id: "aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa",
    title: "No-phone board games",
    description:
      "Casual board games with phones away during each round. Good for people who like a clear activity.",
    category: "board_games",
    vibe: "Phone-light",
    location_name: "Public board game cafe",
    latitude: 48.8566,
    longitude: 2.3522,
    city: "Paris",
    start_time: nowPlus(6, 17),
    end_time: nowPlus(6, 20),
    max_participants: 7,
    price_type: "paid",
    price_amount: 4,
    host_id: users[0].id,
    status: "published",
    safety_note:
      "Public venue. Phones away is optional but encouraged during games."
  }
];

async function assertOk(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

async function main() {
  for (const user of users) {
    await supabase.auth.admin.deleteUser(user.id).catch(() => undefined);
    await assertOk(
      await supabase.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName
        }
      }),
      `create ${user.email}`
    );
  }

  await assertOk(
    await supabase.from("profiles").upsert(profiles, { onConflict: "id" }),
    "upsert profiles"
  );

  await assertOk(
    await supabase
      .from("events")
      .delete()
      .in("title", [
        "Quiet coffee after work",
        "Bernardine Garden walk",
        "Quiet coffee near the station",
        "Riverside walk",
        "Library study block",
        "Beginner language exchange",
        "No-phone board games"
      ]),
    "delete demo events"
  );

  await assertOk(
    await supabase.from("events").upsert(events, { onConflict: "id" }),
    "upsert events"
  );

  console.log("Seeded global demo users and events.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
