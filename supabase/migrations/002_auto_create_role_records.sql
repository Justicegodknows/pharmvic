-- Auto-create vendor or supplier record when a new profile is created
-- This ensures dashboard pages work immediately after registration

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.role = 'vendor' then
    insert into public.vendors (user_id, company_name)
    values (new.id, coalesce(nullif(new.company_name, ''), 'My Company'))
    on conflict (user_id) do nothing;
  elsif new.role = 'supplier' then
    insert into public.suppliers (user_id, company_name)
    values (new.id, coalesce(nullif(new.company_name, ''), 'My Company'))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- Also update the handle_new_user function to include company_name
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, company_name, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'vendor'),
    coalesce(new.raw_user_meta_data ->> 'company_name', ''),
    case
      when coalesce(new.raw_user_meta_data ->> 'role', 'vendor') = 'supplier' then 'Germany'
      else 'Nigeria'
    end
  );
  return new;
end;
$$;
