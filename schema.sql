-- ============================================================
-- Rental Property Management System (RPMS) - Supabase Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROPERTIES
-- ------------------------------------------------------------
create table if not exists properties (
  property_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  property_name text not null,
  property_number text not null,
  address text,
  city text,
  state text,
  pincode text,
  owner_name text,
  owner_mobile text,
  property_type text not null check (property_type in ('Apartment','Villa','Individual House','Commercial')),
  rent numeric(12,2) not null default 0,
  maintenance numeric(12,2) not null default 0,
  eb_rate numeric(12,2) not null default 0,
  deposit numeric(12,2) not null default 0,
  status text not null default 'Vacant' check (status in ('Occupied','Vacant')),
  description text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  unique (owner_id, property_number)
);

create index if not exists idx_properties_owner on properties(owner_id);
create index if not exists idx_properties_status on properties(status);
create index if not exists idx_properties_city on properties(city);

-- ------------------------------------------------------------
-- TENANTS
-- ------------------------------------------------------------
create table if not exists tenants (
  tenant_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references properties(property_id) on delete set null,
  tenant_name text not null,
  photo_url text,
  mobile text not null,
  email text,
  aadhaar text,
  pan text,
  occupation text,
  company text,
  permanent_address text,
  emergency_contact text,
  move_in_date date,
  move_out_date date,
  agreement_start date,
  agreement_end date,
  advance numeric(12,2) default 0,
  rent numeric(12,2) default 0,
  status text not null default 'Active' check (status in ('Active','Inactive')),
  agreement_pdf_url text,
  id_proof_url text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists idx_tenants_owner on tenants(owner_id);
create index if not exists idx_tenants_property on tenants(property_id);
create index if not exists idx_tenants_status on tenants(status);

-- ------------------------------------------------------------
-- METER READINGS (Electricity)
-- ------------------------------------------------------------
create table if not exists meter_readings (
  reading_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references properties(property_id) on delete cascade,
  month date not null, -- store as first-of-month
  previous_reading numeric(12,2) not null,
  current_reading numeric(12,2) not null,
  units numeric(12,2) generated always as (current_reading - previous_reading) stored,
  rate numeric(12,2) not null,
  eb_bill numeric(12,2) generated always as ((current_reading - previous_reading) * rate) stored,
  reading_photo_url text,
  remarks text,
  created_date timestamptz not null default now(),
  constraint chk_reading_order check (current_reading >= previous_reading),
  unique (property_id, month)
);

create index if not exists idx_meter_owner on meter_readings(owner_id);
create index if not exists idx_meter_property_month on meter_readings(property_id, month);

-- ------------------------------------------------------------
-- MAINTENANCE
-- ------------------------------------------------------------
create table if not exists maintenance (
  maintenance_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references properties(property_id) on delete cascade,
  month date not null,
  water numeric(12,2) default 0,
  cleaning numeric(12,2) default 0,
  lift numeric(12,2) default 0,
  security numeric(12,2) default 0,
  parking numeric(12,2) default 0,
  generator numeric(12,2) default 0,
  other numeric(12,2) default 0,
  total numeric(12,2) generated always as
    (coalesce(water,0)+coalesce(cleaning,0)+coalesce(lift,0)+coalesce(security,0)+coalesce(parking,0)+coalesce(generator,0)+coalesce(other,0)) stored,
  remarks text,
  created_date timestamptz not null default now(),
  unique (property_id, month)
);

create index if not exists idx_maintenance_owner on maintenance(owner_id);
create index if not exists idx_maintenance_property_month on maintenance(property_id, month);

-- ------------------------------------------------------------
-- BILLS
-- ------------------------------------------------------------
create table if not exists bills (
  bill_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references properties(property_id) on delete cascade,
  tenant_id uuid references tenants(tenant_id) on delete set null,
  invoice_number text not null,
  month date not null,
  rent numeric(12,2) default 0,
  eb numeric(12,2) default 0,
  maintenance_amount numeric(12,2) default 0,
  previous_balance numeric(12,2) default 0,
  advance_adjustment numeric(12,2) default 0,
  total numeric(12,2) generated always as
    (coalesce(rent,0)+coalesce(eb,0)+coalesce(maintenance_amount,0)+coalesce(previous_balance,0)-coalesce(advance_adjustment,0)) stored,
  due_date date,
  status text not null default 'Pending' check (status in ('Paid','Pending','Partial')),
  created_date timestamptz not null default now(),
  unique (owner_id, invoice_number)
);

create index if not exists idx_bills_owner on bills(owner_id);
create index if not exists idx_bills_property_month on bills(property_id, month);
create index if not exists idx_bills_status on bills(status);

-- ------------------------------------------------------------
-- PAYMENTS
-- ------------------------------------------------------------
create table if not exists payments (
  payment_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  bill_id uuid not null references bills(bill_id) on delete cascade,
  payment_date date not null default current_date,
  amount_paid numeric(12,2) not null,
  method text check (method in ('Cash','UPI','Bank','Cheque')),
  reference_number text,
  balance numeric(12,2) default 0,
  remarks text,
  status text not null default 'Paid' check (status in ('Paid','Pending','Partial')),
  created_date timestamptz not null default now()
);

create index if not exists idx_payments_owner on payments(owner_id);
create index if not exists idx_payments_bill on payments(bill_id);

-- ------------------------------------------------------------
-- EXPENSES
-- ------------------------------------------------------------
create table if not exists expenses (
  expense_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references properties(property_id) on delete set null,
  expense_date date not null default current_date,
  category text check (category in ('Electrician','Plumber','Cleaning','Painting','Lift','Water','Electricity','Security','Others')),
  vendor text,
  amount numeric(12,2) not null,
  gst numeric(12,2) default 0,
  payment_mode text,
  remarks text,
  attachment_url text,
  created_date timestamptz not null default now()
);

create index if not exists idx_expenses_owner on expenses(owner_id);
create index if not exists idx_expenses_category on expenses(category);

-- ------------------------------------------------------------
-- SETTINGS (one row per owner)
-- ------------------------------------------------------------
create table if not exists settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  logo_url text,
  address text,
  phone text,
  email text,
  gst_number text,
  currency text default 'INR',
  default_eb_rate numeric(12,2),
  default_maintenance numeric(12,2),
  invoice_prefix text default 'INV',
  updated_date timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ACTIVITY LOGS
-- ------------------------------------------------------------
create table if not exists activity_logs (
  log_id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity text,
  entity_id uuid,
  details text,
  created_date timestamptz not null default now()
);

create index if not exists idx_activity_owner on activity_logs(owner_id, created_date desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table properties enable row level security;
alter table tenants enable row level security;
alter table meter_readings enable row level security;
alter table maintenance enable row level security;
alter table bills enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table settings enable row level security;
alter table activity_logs enable row level security;

-- Generic "owner can do everything with their own rows" policy per table
create policy "properties_owner_all" on properties
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "tenants_owner_all" on tenants
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "meter_readings_owner_all" on meter_readings
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "maintenance_owner_all" on maintenance
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "bills_owner_all" on bills
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "payments_owner_all" on payments
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "expenses_owner_all" on expenses
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "settings_owner_all" on settings
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "activity_logs_owner_all" on activity_logs
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ============================================================
-- Auto-update updated_date trigger (properties & tenants)
-- ============================================================
create or replace function set_updated_date()
returns trigger as $$
begin
  new.updated_date = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_properties_updated
  before update on properties
  for each row execute function set_updated_date();

create trigger trg_tenants_updated
  before update on tenants
  for each row execute function set_updated_date();
