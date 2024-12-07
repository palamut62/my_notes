-- Create files table
create table if not exists files (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    size bigint not null,
    type text not null,
    path text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_archived boolean default false,
    is_trashed boolean default false
);

-- Enable RLS
alter table files enable row level security;

-- Create policies
create policy "Users can view their own files"
    on files for select
    using (auth.uid() = user_id);

create policy "Users can create their own files"
    on files for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own files"
    on files for update
    using (auth.uid() = user_id);

create policy "Users can delete their own files"
    on files for delete
    using (auth.uid() = user_id);
