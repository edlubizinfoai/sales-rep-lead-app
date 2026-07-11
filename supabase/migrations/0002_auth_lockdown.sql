-- Sprint 3: replace v1's open RLS with per-user isolation now that Supabase
-- Auth is wired up. Seed rows (user_id is null) stay publicly readable as a
-- showcase but become read-only to everyone. All other rows are only
-- visible/writable by the authenticated user that owns them.

-- ── leads ───────────────────────────────────────────────────────────────────
drop policy if exists "leads_v1_read" on leads;
drop policy if exists "leads_v1_write" on leads;

create policy "leads_select" on leads
  for select using (user_id is null or auth.uid() = user_id);

create policy "leads_insert" on leads
  for insert with check (auth.uid() = user_id);

create policy "leads_update" on leads
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "leads_delete" on leads
  for delete using (auth.uid() = user_id);

-- ── activities ──────────────────────────────────────────────────────────────
drop policy if exists "activities_v1_read" on activities;
drop policy if exists "activities_v1_write" on activities;

create policy "activities_select" on activities
  for select using (auth.uid() = user_id);

create policy "activities_insert" on activities
  for insert with check (auth.uid() = user_id);

create policy "activities_update" on activities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "activities_delete" on activities
  for delete using (auth.uid() = user_id);

-- ── subscriptions ───────────────────────────────────────────────────────────
drop policy if exists "subscriptions_v1_read" on subscriptions;
drop policy if exists "subscriptions_v1_write" on subscriptions;

create policy "subscriptions_select" on subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_insert" on subscriptions
  for insert with check (auth.uid() = user_id);

create policy "subscriptions_update" on subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Note: no delete policy — subscriptions are canceled via status update, not deleted.
-- Note: inserts/updates from the Stripe webhook use the service_role key, which
-- bypasses RLS entirely (there's no user session on a server-to-server webhook call).

-- ── audit_logs ──────────────────────────────────────────────────────────────
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;

create policy "audit_logs_select" on audit_logs
  for select using (auth.uid() = user_id);

create policy "audit_logs_insert" on audit_logs
  for insert with check (auth.uid() = user_id);

-- Insert-only by design — no update/delete policy on audit_logs.
