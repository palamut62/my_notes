-- Create passwords table
create table if not exists passwords (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    username text,
    password text not null,
    website text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_archived boolean default false,
    is_trashed boolean default false
);

-- Enable RLS
alter table passwords enable row level security;

-- Create policies
create policy "Users can view their own passwords"
    on passwords for select
    using (auth.uid() = user_id);

create policy "Users can create their own passwords"
    on passwords for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own passwords"
    on passwords for update
    using (auth.uid() = user_id);

create policy "Users can delete their own passwords"
    on passwords for delete
    using (auth.uid() = user_id);
