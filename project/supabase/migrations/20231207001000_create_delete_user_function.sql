-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop the function if it exists
drop function if exists public.delete_user();

-- Create a function to delete a user
create or replace function public.delete_user()
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Get the ID of the authenticated user
  v_user_id := auth.uid();
  
  -- Check if user exists
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete user data from all tables
  delete from storage.objects where bucket_id = 'secure-files' and path like v_user_id || '/%';
  delete from public.files where user_id = v_user_id;
  delete from public.notes where user_id = v_user_id;
  delete from public.passwords where user_id = v_user_id;
  delete from public.user_profiles where user_id = v_user_id;
  
  -- Delete the user from auth.users
  delete from auth.users where id = v_user_id;

  return true;
exception
  when others then
    return false;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.delete_user() to authenticated;
