create extension if not exists pgcrypto;

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  name text not null,
  role text not null,
  income_cadence text not null,
  current_balance numeric(12,2) not null default 0,
  monthly_income numeric(12,2) not null default 0,
  monthly_expenses numeric(12,2) not null default 0,
  safe_to_spend numeric(12,2) not null default 0,
  days_until_payday integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goals (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  saved_amount numeric(12,2) not null default 0,
  target_amount numeric(12,2) not null default 0,
  weekly_contribution numeric(12,2) not null default 0,
  icon text not null,
  color text not null,
  is_priority boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bills (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  due_date date not null,
  amount numeric(12,2) not null default 0,
  priority text not null check (priority in ('critical', 'high', 'medium')),
  icon text not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'handled', 'remind_later')),
  remind_at timestamptz,
  notes text,
  handled_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jars (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  balance numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leaks (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  category text not null,
  amount numeric(12,2) not null default 0,
  frequency text not null,
  ai_explanation text not null,
  icon text not null,
  color text not null,
  patched boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists savings_entries (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  date date not null,
  source_note text not null,
  created_by text not null check (created_by in ('manual', 'kapitan')),
  jar_id text references jars(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists savings_entry_allocations (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  savings_entry_id text not null references savings_entries(id) on delete cascade,
  goal_id text not null references goals(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_goals_workspace_id on goals (workspace_id);
create index if not exists idx_bills_workspace_due_date on bills (workspace_id, due_date);
create index if not exists idx_jars_workspace_id on jars (workspace_id);
create index if not exists idx_leaks_workspace_id on leaks (workspace_id);
create index if not exists idx_savings_entries_workspace_date on savings_entries (workspace_id, date desc);
create index if not exists idx_savings_allocations_workspace_entry on savings_entry_allocations (workspace_id, savings_entry_id);
