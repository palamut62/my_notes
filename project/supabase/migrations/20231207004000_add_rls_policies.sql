-- Enable RLS
alter table public.user_profiles enable row level security;
alter table public.files enable row level security;
alter table public.notes enable row level security;
alter table public.passwords enable row level security;

-- Create delete policies
create policy "Enable delete for users based on user_id"
on public.user_profiles for delete
to authenticated
using (auth.uid() = user_id);

create policy "Enable delete for users based on user_id"
on public.files for delete
to authenticated
using (auth.uid() = user_id);

create policy "Enable delete for users based on user_id"
on public.notes for delete
to authenticated
using (auth.uid() = user_id);

create policy "Enable delete for users based on user_id"
on public.passwords for delete
to authenticated
using (auth.uid() = user_id);
