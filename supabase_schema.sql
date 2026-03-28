-- Run this SQL in your Supabase Dashboard → SQL Editor

-- 1. Portfolios table
create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text,
  ticker_symbol text,
  type text,
  invested numeric default 0,
  current numeric default 0,
  "return" numeric default 0,
  purchase_date text,
  created_at timestamptz default now()
);

alter table portfolios enable row level security;

create policy "Users manage own portfolios" on portfolios
  for all using (auth.uid() = user_id);

-- 2. Goals table
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text,
  target numeric default 0,
  progress numeric default 0,
  year numeric,
  color text,
  created_at timestamptz default now()
);

-- If you already created this table, run these:
-- alter table goals add column year numeric;
-- alter table goals add column color text;

alter table goals enable row level security;

create policy "Users manage own goals" on goals
  for all using (auth.uid() = user_id);

-- 3. Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  phone_number text,
  address text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id);
