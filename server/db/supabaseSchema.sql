create table if not exists profiles (
  id text primary key,
  email text not null default '',
  phone text not null default '',
  auth_provider text not null default 'google.com',
  avatar_url text not null default '',
  full_name text not null default '',
  delivery_address text not null default '',
  delivery_phone text not null default '',
  pincode text not null default '',
  saved_cart jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table profiles add column if not exists delivery_phone text not null default '';
alter table profiles add column if not exists saved_cart jsonb not null default '[]'::jsonb;

create table if not exists products (
  id text primary key,
  name text not null,
  variety text not null,
  description text not null,
  origin text not null,
  taste_profile text not null,
  image_url text not null,
  price_5kg integer not null,
  price_10kg integer not null,
  price_20kg integer not null,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists serviceable_pincodes (
  pincode text primary key,
  area_name text not null,
  city text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint serviceable_pincodes_pincode_format check (pincode ~ '^[0-9]{6}$')
);

create table if not exists orders (
  id text primary key,
  user_id text not null references profiles(id) on delete cascade,
  user_phone text not null default '',
  user_email text not null default '',
  user_name text not null default '',
  razorpay_order_id text not null unique,
  razorpay_payment_id text not null default '',
  status text not null default 'pending',
  total_amount integer not null,
  delivery_address text not null,
  delivery_phone text not null default '',
  pincode text not null,
  order_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_pincode_format check (pincode ~ '^[0-9]{6}$')
);

alter table orders add column if not exists delivery_phone text not null default '';

create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists products_sort_order_idx on products(sort_order asc);
create index if not exists serviceable_pincodes_is_active_idx on serviceable_pincodes(is_active);
