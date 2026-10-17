-- Call Ready schema. Append-only notes/history keep old data intact while reps keep editing.
create extension if not exists pgcrypto;

create table if not exists accounts (
  id text primary key,
  name text not null,
  segment text,
  hq text,
  website text,
  ticker text,
  stage text not null default 'Research',
  owner text,
  brief jsonb not null default '{}'::jsonb,
  refreshed_at timestamptz,
  signals_checked_at timestamptz,
  last_touched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references accounts(id) on delete cascade,
  name text,
  title text not null,
  role_type text,
  why text,
  decisions text,
  linkedin_url text,
  email text,
  phone text,
  contact_source text not null default 'rep',   -- public | crm | rep
  hooks jsonb not null default '[]'::jsonb,     -- [{text,type,src,confirmed}]
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
  kind text not null default 'call',            -- call | email | meeting | granola
  method text,
  prn jsonb not null,                            -- {purpose, results:{clarify,...}, contacts, decisionMaker, next:[{text,due,owner}], unclear}
  granola_id text unique,
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
  status text not null default 'new',            -- new | reviewed | dismissed
  source text not null default 'exa',
  created_at timestamptz not null default now(),
  unique (account_id, url)
);

create table if not exists activity (
  id bigint generated always as identity primary key,
  account_id text references accounts(id) on delete cascade,
  actor text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists activity_created_idx on activity(created_at desc);

create table if not exists brief_history (
  id bigint generated always as identity primary key,
  account_id text not null references accounts(id) on delete cascade,
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
  created_at timestamptz not null default now(),
  ended_at timestamptz
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
alter table settings enable row level security;
