create table if not exists public.noties (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete cascade,
    title text not null,
    content text not null,
    mode text
);

alter table public.noties enable row level security;

create policy "Users can view their own noties"
    on public.noties for select
    using (auth.uid() = created_by);

create policy "Users can insert their own noties"
    on public.noties for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own noties"
    on public.noties for update
    using (auth.uid() = created_by);

create policy "Users can delete their own noties"
    on public.noties for delete
    using (auth.uid() = created_by);
