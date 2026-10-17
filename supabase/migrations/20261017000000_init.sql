-- Call Ready schema. Append-only notes and brief history keep old data intact while reps keep editing.
-- CRM-friendly: every core record has sf_id / hubspot_id columns for Salesforce and HubSpot sync.
create extension if not exists pgcrypto;

create table if not exists accounts (
  id text primary key,
  name text not null,
  segment text,
  hq text,
  website text,
  ticker text,
  phones jsonb not null default '[]'::jsonb,      -- public company lines [{label,number,src}]
  stage text not null default 'Research',
  owner text,
  brief jsonb not null default '{}'::jsonb,       -- company facts found (overview, facts, freight, locations, leadership, sources)
  refreshed_at timestamptz,
  signals_checked_at timestamptz,
  last_touched_at timestamptz,
  sf_id text unique,
  hubspot_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references accounts(id) on delete cascade,
  name text,
  title text not null,
  role_type text,
  location text,
  since text,
  why text,
  decisions text,
  linkedin_url text,
  email text,                                     -- business email from CRM only
  phone text,                                     -- direct line from CRM only
  phones jsonb not null default '[]'::jsonb,      -- public company lines
  career jsonb not null default '[]'::jsonb,
  contact_source text not null default 'rep',     -- public | crm | rep
  hooks jsonb not null default '[]'::jsonb,       -- [{text,say,type,src,confirmed}]
  brief jsonb not null default '{}'::jsonb,       -- person brief: sharpest, known, openers, questions, talk track, crva, persona, sources
  refreshed_at timestamptz,
  last_touched_at timestamptz,
  sf_id text unique,
  hubspot_id text unique,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_account_idx on contacts(account_id);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  author text,
  kind text not null default 'call',              -- call | email | meeting | granola
  method text,
  prn jsonb not null,
  granola_id text unique,
  sf_id text unique,
  hubspot_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists notes_account_idx on notes(account_id, created_at desc);

create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references accounts(id) on delete cascade,
  title text not null,
  url text not null,
  published_at timestamptz,
  category text,
  summary text,
  status text not null default 'new',             -- new | reviewed | dismissed
  source text not null default 'exa',
  created_at timestamptz not null default now(),
  unique (account_id, url)
);

create table if not exists activity (
  id bigint generated always as identity primary key,
  account_id text references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  actor text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists activity_created_idx on activity(created_at desc);

create table if not exists brief_history (
  id bigint generated always as identity primary key,
  account_id text not null references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  brief jsonb not null,
  saved_by text,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists mock_calls (
  id uuid primary key default gen_random_uuid(),
  call_id text unique,
  account_id text references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  rep text,
  goal text,
  difficulty text,
  status text not null default 'registered',
  duration_s integer,
  cost_cents numeric not null default 0,
  transcript text,
  score jsonb,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists reps (
  id text primary key,
  name text not null,
  email text,
  role text,
  monthly_quota numeric not null default 0,        -- gross margin $ per month
  is_sample boolean not null default false,
  sf_id text unique,
  hubspot_id text unique
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  account_id text references accounts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  customer_name text,                              -- for deals with shippers not in Call Ready yet
  name text not null,
  owner text references reps(id),
  stage text not null default 'Discovery',
  status text not null default 'open',             -- open | won | lost
  revenue numeric not null default 0,
  margin numeric not null default 0,
  loads integer not null default 0,
  close_date date,
  is_sample boolean not null default false,
  sf_id text unique,
  hubspot_id text unique,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

-- Lock everything down: only the server (secret key) can read or write.
alter table accounts enable row level security;
alter table contacts enable row level security;
alter table notes enable row level security;
alter table signals enable row level security;
alter table activity enable row level security;
alter table brief_history enable row level security;
alter table mock_calls enable row level security;
alter table reps enable row level security;
alter table deals enable row level security;
alter table settings enable row level security;
