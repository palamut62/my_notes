-- Enable RLS for the tables
alter table public.user_profiles enable row level security;
alter table public.files enable row level security;
alter table public.notes enable row level security;
alter table public.passwords enable row level security;

-- Create policies for deletion
create policy "Users can delete their own profile"
  on public.user_profiles for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own files"
  on public.files for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own passwords"
  on public.passwords for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create a function to completely delete a user and all their data
create or replace function delete_user_completely()
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete from user_profiles first (due to foreign key constraints)
  delete from public.user_profiles where user_id = v_user_id;
  
  -- Delete from auth.users
  delete from auth.users where id = v_user_id;
  
  -- Delete other user data
  perform delete_user_data();
  
  -- Delete storage objects
  delete from storage.objects 
  where bucket_id = 'secure-files' 
  and path like v_user_id || '/%';
end;
$$;

-- Create the delete function
create or replace function delete_user_data()
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete from all tables
  delete from public.user_profiles where user_id = v_user_id;
  delete from public.files where user_id = v_user_id;
  delete from public.notes where user_id = v_user_id;
  delete from public.passwords where user_id = v_user_id;
end;
$$;

-- Grant execute permission
grant execute on function delete_user_completely() to authenticated;
grant execute on function delete_user_data() to authenticated;
