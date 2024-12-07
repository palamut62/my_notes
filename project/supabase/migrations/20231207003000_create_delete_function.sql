-- Drop existing functions if they exist
drop function if exists public.delete_user_data();
drop function if exists public.delete_user_completely();

-- Create the delete function
create or replace function public.delete_user_account()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    return false;
  end if;

  -- Delete all user data
  delete from public.user_profiles where user_id = v_user_id;
  delete from public.files where user_id = v_user_id;
  delete from public.notes where user_id = v_user_id;
  delete from public.passwords where user_id = v_user_id;
  
  -- Delete storage objects
  delete from storage.objects 
  where bucket_id = 'secure-files' 
  and path like v_user_id || '/%';

  return true;
exception
  when others then
    return false;
end;
$$;

-- Grant execute permission
grant execute on function public.delete_user_account() to authenticated;
