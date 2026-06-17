-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- This creates the chat_sessions table and sets up Row Level Security

-- 1. Create the table
create table if not exists public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New Research Session',
  tool_mode   text not null default 'general',
  messages    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Index for fast per-user queries
create index if not exists chat_sessions_user_id_updated_at_idx
  on public.chat_sessions(user_id, updated_at desc);

-- 3. Enable Row Level Security
alter table public.chat_sessions enable row level security;

-- 4. Drop any existing policies to avoid conflicts
drop policy if exists "Users can view their own sessions"  on public.chat_sessions;
drop policy if exists "Users can insert their own sessions" on public.chat_sessions;
drop policy if exists "Users can update their own sessions" on public.chat_sessions;
drop policy if exists "Users can delete their own sessions" on public.chat_sessions;

-- 5. Create RLS policies
create policy "Users can view their own sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- Done! The app uses server-side API routes (not the browser client) to write
-- data, so the anon key + RLS combo works correctly.

-- ── Research Reports table (for PDF report storage) ──────────────────────────

create table if not exists public.research_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  session_id  uuid references public.chat_sessions(id) on delete set null,
  title       text not null,
  content     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists research_reports_user_id_idx
  on public.research_reports(user_id, created_at desc);

alter table public.research_reports enable row level security;

drop policy if exists "Users can view their own reports"   on public.research_reports;
drop policy if exists "Users can insert their own reports" on public.research_reports;
drop policy if exists "Users can delete their own reports" on public.research_reports;

create policy "Users can view their own reports"
  on public.research_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on public.research_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on public.research_reports for delete
  using (auth.uid() = user_id);
