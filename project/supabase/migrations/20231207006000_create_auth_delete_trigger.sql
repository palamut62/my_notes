-- Create a table to trigger auth user deletion
create table if not exists public.delete_user_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.delete_user_requests enable row level security;

-- Create policy
create policy "Users can insert their own deletion request"
  on public.delete_user_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create trigger function
create or replace function process_user_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Delete from auth.users
  delete from auth.users where id = NEW.user_id;
  return NEW;
exception
  when others then
    return null;
end;
$$;

-- Create trigger
create trigger tr_process_user_deletion
  after insert
  on public.delete_user_requests
  for each row
  execute function process_user_deletion();
