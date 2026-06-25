create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'new',
  deal_value numeric,
  notes text,
  score numeric,
  score_source text,
  score_confidence numeric,
  score_review_status text default 'unreviewed',
  last_activity_at timestamptz
);

alter table leads enable row level security;
drop policy if exists "leads_v1_read" on leads;
create policy "leads_v1_read" on leads for select using (true);
drop policy if exists "leads_v1_write" on leads;
create policy "leads_v1_write" on leads for all using (true) with check (true);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  lead_id uuid references leads(id) on delete cascade,
  activity_type text not null,
  notes text,
  occurred_at timestamptz not null default now()
);

alter table activities enable row level security;
drop policy if exists "activities_v1_read" on activities;
create policy "activities_v1_read" on activities for select using (true);
drop policy if exists "activities_v1_write" on activities;
create policy "activities_v1_write" on activities for all using (true) with check (true);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  plan text not null default 'pro',
  status text not null default 'active',
  current_period_end timestamptz
);

alter table subscriptions enable row level security;
drop policy if exists "subscriptions_v1_read" on subscriptions;
create policy "subscriptions_v1_read" on subscriptions for select using (true);
drop policy if exists "subscriptions_v1_write" on subscriptions;
create policy "subscriptions_v1_write" on subscriptions for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  table_name text not null,
  record_id uuid,
  action text not null,
  payload jsonb
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into leads (id, name, company, email, phone, status, deal_value, notes, score, score_source, score_confidence, score_review_status, last_activity_at) values
  (gen_random_uuid(), 'Sarah Mitchell', 'Apex Logistics', 'sarah.mitchell@apexlogistics.com', '555-0101', 'qualified', 18000, 'Interested in annual plan. Demo scheduled next Tuesday.', 82, 'rule-based', 0.9, 'unreviewed', now() - interval '1 day'),
  (gen_random_uuid(), 'James Okafor', 'Brightline Media', 'james.okafor@brightlinemedia.com', '555-0192', 'contacted', 7500, 'Replied to cold email. Waiting on budget approval.', 54, 'rule-based', 0.85, 'unreviewed', now() - interval '3 days'),
  (gen_random_uuid(), 'Priya Nair', 'CloudNest Solutions', 'priya.nair@cloudnest.io', '555-0234', 'new', 12000, 'Inbound via website. Has not replied yet.', 38, 'rule-based', 0.8, 'unreviewed', now() - interval '8 days'),
  (gen_random_uuid(), 'Tom Hargreaves', 'Delta Retail Group', 'tom.h@deltaretail.com', '555-0377', 'closed_won', 22000, 'Contract signed. Onboarding starts Monday.', 100, 'rule-based', 1.0, 'unreviewed', now() - interval '2 days'),
  (gen_random_uuid(), 'Leila Vasquez', 'Ember Finance', 'leila.v@emberfinance.com', '555-0411', 'contacted', 9500, 'Had a 20-min intro call. Sent follow-up deck.', 61, 'rule-based', 0.87, 'unreviewed', now() - interval '5 days');