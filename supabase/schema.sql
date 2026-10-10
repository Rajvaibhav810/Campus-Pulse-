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

-- 2. USER PROFILES TABLE (Linked with auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    organization_id uuid references public.organizations(id) on delete set null,
    full_name text not null,
    initials text not null,
    role text not null check (role in ('user', 'member', 'admin')) default 'user',
    admin_domain text default 'all', -- 'water', 'wifi', 'cleanliness', 'facilities', 'safety', 'all'
    role_label text default 'General User',
    department text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ISSUES TABLE
create table if not exists public.issues (
    id text primary key, -- e.g. "CP-1042"
    organization_id uuid references public.organizations(id) on delete cascade,
    title text not null check (char_length(title) <= 80),
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
    reported_by_id uuid references public.profiles(id) on delete set null,
    is_anonymous boolean default false,
    assigned_to_id uuid references public.profiles(id) on delete set null,
    photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ISSUE CONFIRMATIONS TABLE (Collective impact tracking)
create table if not exists public.issue_confirmations (
    id uuid primary key default uuid_generate_v4(),
    issue_id text references public.issues(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(issue_id, user_id)
);

-- 5. ISSUE RESOLUTION EVIDENCE TABLE
create table if not exists public.resolution_evidence (
    id uuid primary key default uuid_generate_v4(),
    issue_id text references public.issues(id) on delete cascade not null unique,
    resolved_by_id uuid references public.profiles(id) on delete set null,
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
    actor_id uuid references public.profiles(id) on delete set null,
    status text not null,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- Triggers for Automatic Affected Count & Timestamps
-- ============================================================================

-- Increment/Decrement affected_count when an issue is confirmed/unconfirmed
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
-- ============================================================================

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.issue_confirmations enable row level security;
alter table public.resolution_evidence enable row level security;
alter table public.issue_history enable row level security;

-- Read policies: Authenticated users can view issues, confirmations, history
create policy "Authenticated users can read organizations"
    on public.organizations for select
    to authenticated
    using (true);

create policy "Authenticated users can read profiles"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Authenticated users can read issues"
    on public.issues for select
    to authenticated
    using (true);

create policy "Authenticated users can read confirmations"
    on public.issue_confirmations for select
    to authenticated
    using (true);

create policy "Authenticated users can read resolutions"
    on public.resolution_evidence for select
    to authenticated
    using (true);

create policy "Authenticated users can read history"
    on public.issue_history for select
    to authenticated
    using (true);

-- Insert policies: Members can report issues and confirm issues
create policy "Authenticated users can create issues"
    on public.issues for insert
    to authenticated
    with check (auth.uid() = reported_by_id or is_anonymous = true);

create policy "Users can toggle their own confirmations"
    on public.issue_confirmations for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Update policies: Domain Administrators can update status, assign, or resolve
create policy "Domain administrators can update issues"
    on public.issues for update
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
            and (profiles.admin_domain = 'all' or profiles.admin_domain = issues.category)
        )
        or auth.uid() = reported_by_id
    );

-- Storage bucket configuration reminder:
-- Create a public bucket in Supabase Storage named "issue-evidence"
