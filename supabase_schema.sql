-- ============================================
-- SiPPD Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Districts table
create table if not exists districts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- 2. Schools table
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('SK', 'SMK')) not null,
  district_id uuid references districts(id) on delete cascade,
  created_at timestamptz default now()
);

-- 3. Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text check (role in ('guru', 'ppd', 'superadmin')) default 'guru',
  school_id uuid references schools(id),
  district_id uuid references districts(id),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Attendance Reports
create table if not exists attendance_reports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade not null,
  month text not null,
  year int not null,
  class_data jsonb default '[]',
  total_enrolment int default 0,
  total_present int default 0,
  average_percentage numeric(5,2) default 0,
  justification text,
  intervention text,
  status text check (status in ('Draf', 'Submitted')) default 'Draf',
  submitted_at timestamptz,
  created_at timestamptz default now(),
  unique (school_id, month, year)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table districts enable row level security;
alter table schools enable row level security;
alter table profiles enable row level security;
alter table attendance_reports enable row level security;

-- Districts: all authenticated users can read
create policy "districts_read" on districts
  for select using (auth.role() = 'authenticated');

-- Schools: all authenticated can read
create policy "schools_read" on schools
  for select using (auth.role() = 'authenticated');

-- Profiles: users read own; superadmin reads all
create policy "profiles_read_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_superadmin_all" on profiles
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );

-- Attendance: guru sees own school; ppd sees district; superadmin sees all
create policy "attendance_guru_own" on attendance_reports
  for all using (
    school_id = (select school_id from profiles where id = auth.uid())
  );

create policy "attendance_ppd_district" on attendance_reports
  for select using (
    exists (
      select 1 from profiles p
      join schools s on s.id = attendance_reports.school_id
      where p.id = auth.uid()
        and p.role in ('ppd', 'superadmin')
        and (p.district_id = s.district_id or p.role = 'superadmin')
    )
  );

-- ============================================
-- Sample Data (optional — remove in production)
-- ============================================

insert into districts (name) values
  ('PPD Semporna'),
  ('PPD Tawau'),
  ('PPD Lahad Datu')
on conflict do nothing;
