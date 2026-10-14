-- ============================================================================
-- Campus Pulse — Production Supabase / PostgreSQL Schema & RLS Policies
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ORGANIZATIONS / TENANTS TABLE
create table if not exists public.organizations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    campus_name text not null,
    emergency_hotline_number text default '4444',
    emergency_hotline_label text default 'Campus Emergency Hotline',
    emergency_hotline_note text default 'Dial for immediate medical or security support',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. USER PROFILES TABLE
create table if not exists public.profiles (
    id text primary key,
    organization_id uuid references public.organizations(id) on delete set null,
    full_name text not null,
    initials text not null,
    role text not null check (role in ('member', 'admin', 'user')) default 'member',
    role_label text default 'Campus Member',
    department text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ISSUES TABLE
create table if not exists public.issues (
    id text primary key, -- e.g. "CP-1042"
    organization_id uuid references public.organizations(id) on delete set null,
    title text not null check (char_length(title) <= 120),
    description text,
    category text not null, -- water, wifi, cleanliness, facilities, etc.
    zone text not null,     -- e.g. "Block B"
    area text not null,     -- e.g. "2nd Floor Pantry"
    location_full_text text not null,
    urgency text not null check (urgency in ('low', 'medium', 'high')) default 'medium',
    status text not null check (status in ('reported', 'under_review', 'assigned', 'in_progress', 'resolved', 'reopened')) default 'reported',
    priority_score integer default 20 check (priority_score between 0 and 100),
    priority_tier text default 'low' check (priority_tier in ('low', 'medium', 'high', 'critical')),
    affected_count integer default 1 check (affected_count >= 1),
    reported_by_id text,
    is_anonymous boolean default false,
    assigned_to_id text,
    photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ISSUE CONFIRMATIONS TABLE (Collective impact tracking)
create table if not exists public.issue_confirmations (
    id uuid primary key default uuid_generate_v4(),
    issue_id text references public.issues(id) on delete cascade not null,
    user_id text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(issue_id, user_id)
);

-- 5. ISSUE RESOLUTION EVIDENCE TABLE
create table if not exists public.resolution_evidence (
    id uuid primary key default uuid_generate_v4(),
    issue_id text references public.issues(id) on delete cascade not null unique,
    resolved_by_id text,
    resolved_by_name text not null,
    resolution_note text not null,
    after_photo_url text,
    verified_count integer default 0,
    reopened_count integer default 0,
    resolved_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ISSUE LIFECYCLE AUDIT HISTORY
create table if not exists public.issue_history (
    id uuid primary key default uuid_generate_v4(),
    issue_id text references public.issues(id) on delete cascade not null,
    actor_name text not null,
    actor_id text,
    status text not null,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- Triggers for Automatic Affected Count & Timestamps
-- ============================================================================

create or replace function public.handle_issue_confirmation_change()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.issues
        set affected_count = affected_count + 1,
            updated_at = timezone('utc'::text, now())
        where id = NEW.issue_id;
        return NEW;
    elsif (TG_OP = 'DELETE') then
        update public.issues
        set affected_count = greatest(1, affected_count - 1),
            updated_at = timezone('utc'::text, now())
        where id = OLD.issue_id;
        return OLD;
    end if;
    return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_issue_confirmation_change on public.issue_confirmations;
create trigger on_issue_confirmation_change
after insert or delete on public.issue_confirmations
for each row execute function public.handle_issue_confirmation_change();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Grant read and write access to both 'anon' and 'authenticated' roles
-- so your frontend (using VITE_SUPABASE_ANON_KEY) functions smoothly.
-- ============================================================================

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.issue_confirmations enable row level security;
alter table public.resolution_evidence enable row level security;
alter table public.issue_history enable row level security;

-- Read policies:
drop policy if exists "Allow select organizations" on public.organizations;
create policy "Allow select organizations" on public.organizations for select to anon, authenticated using (true);

drop policy if exists "Allow select profiles" on public.profiles;
create policy "Allow select profiles" on public.profiles for select to anon, authenticated using (true);

drop policy if exists "Allow select issues" on public.issues;
create policy "Allow select issues" on public.issues for select to anon, authenticated using (true);

drop policy if exists "Allow select confirmations" on public.issue_confirmations;
create policy "Allow select confirmations" on public.issue_confirmations for select to anon, authenticated using (true);

drop policy if exists "Allow select resolutions" on public.resolution_evidence;
create policy "Allow select resolutions" on public.resolution_evidence for select to anon, authenticated using (true);

drop policy if exists "Allow select history" on public.issue_history;
create policy "Allow select history" on public.issue_history for select to anon, authenticated using (true);

-- Insert & Update & Delete policies:
drop policy if exists "Allow insert issues" on public.issues;
create policy "Allow insert issues" on public.issues for insert to anon, authenticated with check (true);

drop policy if exists "Allow update issues" on public.issues;
create policy "Allow update issues" on public.issues for update to anon, authenticated using (true) with check (true);

drop policy if exists "Allow delete issues" on public.issues;
create policy "Allow delete issues" on public.issues for delete to anon, authenticated using (true);

drop policy if exists "Allow manage profiles" on public.profiles;
create policy "Allow manage profiles" on public.profiles for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow manage organizations" on public.organizations;
create policy "Allow manage organizations" on public.organizations for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow manage confirmations" on public.issue_confirmations;
create policy "Allow manage confirmations" on public.issue_confirmations for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow manage resolutions" on public.resolution_evidence;
create policy "Allow manage resolutions" on public.resolution_evidence for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow manage history" on public.issue_history;
create policy "Allow manage history" on public.issue_history for all to anon, authenticated using (true) with check (true);

-- ============================================================================
-- Initial Seed Data (Optional baseline data to get started)
-- ============================================================================

insert into public.organizations (name, campus_name, emergency_hotline_number, emergency_hotline_label)
values ('Acme Corp', 'Tech Park Campus', '4444', 'Campus Emergency Hotline')
on conflict do nothing;

insert into public.issues (id, title, description, category, zone, area, location_full_text, urgency, status, priority_score, priority_tier, affected_count)
values 
('CP-1042', 'Water cooler leaking & low pressure', 'Continuous leak on the right dispenser tap, pooling onto floor near the main stairs.', 'water', 'Block B', '2nd Floor Pantry', 'Block B, 2nd Floor Pantry', 'high', 'in_progress', 82, 'high', 24),
('CP-1043', 'Wi-Fi connection drops in Conference Room 3', 'Frequent disconnects during video conference meetings. 5GHz SSID disappears intermittently.', 'wifi', 'Block A', 'Ground Floor Lobby', 'Block A, Ground Floor Lobby', 'medium', 'reported', 65, 'medium', 18),
('CP-1044', 'Restroom soap dispensers empty', 'All three soap dispensers in the third-floor gender-neutral restroom are empty.', 'cleanliness', 'Floor 4', 'Open Workspace', 'Floor 4, Restroom 4A', 'low', 'reported', 45, 'low', 12)
on conflict do nothing;
