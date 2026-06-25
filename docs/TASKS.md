# Tasks & Sprints

## Sprint 1 — DB, Lead CRUD & Demo Mode
**Goal**: App loads with seed leads, full CRUD works, no login required.

- [ ] Apply migration SQL to Supabase (leads, activities, subscriptions, audit_logs + seed data)
- [ ] Lead list page (`/`) renders seed leads from DB
- [ ] `POST /api/leads` — insert lead, compute score, write audit log
- [ ] `PATCH /api/leads/[id]` — update lead, recompute score, write audit log
- [ ] `DELETE /api/leads/[id]` — soft confirm modal, delete row, write audit log
- [ ] Status filter tabs on lead list (All / New / Contacted / Qualified / Won / Lost)
- [ ] Lead detail / edit page (`/leads/[id]`)
- [ ] Score badge (color-coded 0–100) on every lead card
- [ ] Empty state (no leads yet), loading skeleton, error toast
- [ ] **Definition of Done**: add, edit, delete all reflect in DB; score shows; page loads without login

## Sprint 2 — Stripe Checkout  ✅ v1 functional milestone
**Goal**: The app can take a real payment.

- [ ] Stripe product + price configured ($19/mo Pro)
- [ ] `POST /api/checkout` — creates Stripe Checkout Session (secret key server-only)
- [ ] Upgrade banner on lead list after 3 leads for unpaid visitors
- [ ] `/upgrade` page with plan details + checkout button
- [ ] `/success` page — confirms payment, prompts signup
- [ ] `POST /api/stripe-webhook` — validates signature, inserts into subscriptions, writes audit log
- [ ] Paid check: 4th+ lead add blocked for unpaid; unlocked after subscription row exists
- [ ] **Definition of Done**: end-to-end — visitor adds leads, hits paywall, pays, gets full access; subscription row in DB

## Sprint 3 — Auth & Lock-Down
**Goal**: Per-user data isolation; no stranger can read another rep's leads.

- [ ] Supabase Auth enabled; `/login` and `/signup` pages
- [ ] Replace open RLS with `auth.uid() = user_id` policies on all tables
- [ ] Stripe Checkout passes `client_reference_id = user_id`; webhook links subscription to user
- [ ] Unauthenticated write attempts → redirect to `/login`
- [ ] Seed demo rows kept as public showcase (user_id = null, read-only)
- [ ] **Definition of Done**: two test users each see only their own leads; seed rows still visible to guests

## Sprint 4 — Activity Log & AI Suggestions
**Goal**: Reps log touchpoints; AI drafts next-step suggestions.

- [ ] Activity log UI on lead detail (log call / email / meeting)
- [ ] `POST /api/activities` — inserts activity, updates `last_activity_at` on lead, rescores
- [ ] Timeline component on lead detail page
- [ ] `POST /api/suggest` — OpenAI call (server-side), stores suggestion in leads row (value + source + confidence + review_status)
- [ ] Rep accepts / dismisses suggestion — status written back
- [ ] Stale lead highlight (orange badge if last_activity_at > 7 days ago)
- [ ] **Definition of Done**: activity persists; AI suggestion appears with confidence; accept/dismiss updates DB

---

## Gantt (sprint → feature)
```
Sprint 1 │ DB schema · Lead CRUD · Score engine · Demo mode
Sprint 2 │ Stripe checkout · Paywall · Webhook · Subscriptions  ← v1 functional
Sprint 3 │ Auth · RLS lock-down · Per-user isolation
Sprint 4 │ Activity log · AI suggestions · Stale alerts
```
