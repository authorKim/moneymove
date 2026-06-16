-- MoneyMove v1.1 Supabase Schema
-- Run this in Supabase SQL Editor

-- overseas_stocks
create table if not exists overseas_stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  buy_date text default '',
  krw_cost numeric default 0,
  krw_value numeric default 0,
  usd_cost numeric default 0,
  usd_value numeric default 0,
  category text default 'core_us',
  created_at timestamptz default now()
);
alter table overseas_stocks enable row level security;
create policy "users own data" on overseas_stocks for all using (auth.uid() = user_id);

-- domestic_stocks
create table if not exists domestic_stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  buy_date text default '',
  cost numeric default 0,
  value numeric default 0,
  category text default 'core_kr',
  created_at timestamptz default now()
);
alter table domestic_stocks enable row level security;
create policy "users own data" on domestic_stocks for all using (auth.uid() = user_id);

-- alternative_assets
create table if not exists alternative_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  cost numeric default 0,
  value numeric default 0,
  created_at timestamptz default now()
);
alter table alternative_assets enable row level security;
create policy "users own data" on alternative_assets for all using (auth.uid() = user_id);

-- non_invest_assets (user당 1행, upsert)
create table if not exists non_invest_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  cash numeric default 0,
  deposit numeric default 0,
  savings numeric default 0,
  subscription numeric default 0,
  bonds numeric default 0,
  bond_value numeric default 0,
  memo text default '',
  updated_at timestamptz default now()
);
alter table non_invest_assets enable row level security;
create policy "users own data" on non_invest_assets for all using (auth.uid() = user_id);

-- dividends
create table if not exists dividends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  year integer not null,
  month integer not null,
  stock_name text not null,
  amount numeric default 0,
  created_at timestamptz default now()
);
alter table dividends enable row level security;
create policy "users own data" on dividends for all using (auth.uid() = user_id);

-- growth_records
create table if not exists growth_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  year integer not null,
  month integer not null,
  total_asset numeric default 0,
  memo text default '',
  is_auto boolean default false,
  created_at timestamptz default now()
);
alter table growth_records enable row level security;
create policy "users own data" on growth_records for all using (auth.uid() = user_id);

-- investment_categories
create table if not exists investment_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  key text not null,
  target_ratio numeric default 0,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table investment_categories enable row level security;
create policy "users own data" on investment_categories for all using (auth.uid() = user_id);

-- user_settings (user당 1행, upsert)
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  target_asset numeric default 150000000,
  target_year integer default 2030,
  exchange_rate numeric default 1380,
  rate_updated_at text default '',
  target_allocation jsonb default '{"core_us":0.45,"core_kr":0.1,"satellite_us":0.1,"satellite_kr":0.1,"alternative":0.05,"bonds":0.05,"cash":0.15}'::jsonb,
  updated_at timestamptz default now()
);
alter table user_settings enable row level security;
create policy "users own data" on user_settings for all using (auth.uid() = user_id);
