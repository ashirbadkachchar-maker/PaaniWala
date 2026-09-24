-- PaaniWala MARKETPLACE (pehle wali supabase.sql ke BAAD chalao)

create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_name text not null,
  mobile text unique not null,
  password text not null,
  area text,
  address text,
  status text default 'pending',
  commission_rate int default 5,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade,
  item_type text not null,
  item_name text not null,
  price int not null,
  active boolean default true,
  created_at timestamptz default now()
);

alter table orders add column if not exists seller_id uuid references sellers(id);
alter table orders add column if not exists commission int default 0;
alter table orders add column if not exists seller_earning int default 0;

alter table sellers enable row level security;
alter table products enable row level security;

drop policy if exists "open all" on sellers;
create policy "open all" on sellers for all using (true) with check (true);
drop policy if exists "open all" on products;
create policy "open all" on products for all using (true) with check (true);

insert into sellers (business_name, owner_name, mobile, password, area, address, status)
values ('Sharma Water Supply', 'Ramesh Sharma', '9812345670', 'seller123', 'Arihant Anchal', 'Shop 5, Main Market, Jodhpur', 'approved')
on conflict (mobile) do nothing;

insert into products (seller_id, item_type, item_name, price)
select id, 'camper', 'Shuddh Paani - 20L Camper', 40 from sellers where mobile='9812345670'
union all
select id, 'tanker', '2000L Tanker', 1200 from sellers where mobile='9812345670'
union all
select id, 'tanker', '5000L Tanker', 2500 from sellers where mobile='9812345670';
