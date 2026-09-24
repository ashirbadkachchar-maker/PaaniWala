-- PaaniWala Database (Supabase SQL Editor me paste karke RUN dabao)

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text,
  mobile text unique not null,
  address text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  mobile text not null,
  item_type text not null,
  item_name text not null,
  qty int default 1,
  price int not null,
  discount int default 0,
  total int not null,
  delivery_slot text,
  address text,
  status text default 'Raste Me Hai',
  created_at timestamptz default now()
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  mobile text not null,
  month text not null,
  amount int not null,
  paid boolean default false,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table orders enable row level security;
alter table bills enable row level security;

drop policy if exists "open all" on profiles;
create policy "open all" on profiles for all using (true) with check (true);
drop policy if exists "open all" on orders;
create policy "open all" on orders for all using (true) with check (true);
drop policy if exists "open all" on bills;
create policy "open all" on bills for all using (true) with check (true);

-- sample bills (demo mobile 9876543210)
insert into bills (mobile, month, amount, paid) values
('9876543210','September 2026',128,false),
('9876543210','August 2026',112,true),
('9876543210','July 2026',80,true)
on conflict do nothing;
