-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Customers Table
create table customers (
  id text primary key,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Company Info Table
create table company_info (
  id text primary key default 'default',
  name text,
  email text,
  phone text,
  address text,
  logo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expense Categories Table
create table expense_categories (
  id text primary key,
  title text not null,
  color text,
  icon text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expenses Table
create table expenses (
  id text primary key,
  amount numeric not null,
  date text not null,
  description text,
  category_id text references expense_categories(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
-- For now, we enable public access for simplicity. In production, you should restrict this.
alter table customers enable row level security;
create policy "Public access for customers" on customers for all using (true) with check (true);

alter table company_info enable row level security;
create policy "Public access for company_info" on company_info for all using (true) with check (true);

alter table expense_categories enable row level security;
create policy "Public access for expense_categories" on expense_categories for all using (true) with check (true);

alter table expenses enable row level security;
create policy "Public access for expenses" on expenses for all using (true) with check (true);
