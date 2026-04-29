alter table savings_entries
add column if not exists entry_type text not null default 'deposit'
check (entry_type in ('deposit', 'withdrawal'));

update savings_entries
set entry_type = 'deposit'
where entry_type is null;
