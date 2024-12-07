-- Create admin function to delete auth user
create or replace function delete_auth_user()
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

  -- Delete from auth.users
  delete from auth.users where id = v_user_id;
end;
$$;

-- Grant execute permission
grant execute on function delete_auth_user() to authenticated;
