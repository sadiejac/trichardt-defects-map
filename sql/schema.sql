create extension if not exists "uuid-ossp";

create table reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  title text not null,
  description text,
  category text,
  lat double precision not null,
  lng double precision not null,
  photo_url text,
  status text default 'reported',
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

create policy "public_select" on public.reports
  for select using (true);

create policy "authenticated_insert" on public.reports
  for insert with check (auth.role() = 'authenticated');

create policy "owners_update" on public.reports
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owners_delete" on public.reports
  for delete using (auth.uid() = user_id);
