create table if not exists public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  one_time_code text,
  code_shown boolean default false,
  code_generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.user_profiles for select
  using ( auth.uid() = user_id );

create policy "Users can update own profile"
  on public.user_profiles for update
  using ( auth.uid() = user_id );

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check ( auth.uid() = user_id );

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.user_profiles
  for each row
  execute procedure public.handle_updated_at();
