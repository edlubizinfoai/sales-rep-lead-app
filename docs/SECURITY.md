# Security

## Secret Handling
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` — server-side env vars only, never in client bundle
- Public keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) are the only keys exposed to the browser

## Permission Model
- **v1 (demo)**: open RLS policies — any visitor can read; any visitor can write (enables demo without login)
- **Sprint 3 (lock-down)**: policies replaced with `auth.uid() = user_id`; anonymous writes blocked
- **Stripe webhooks**: validated via `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET` before any DB write

## Approved Tools Rule
- Agents and API routes use only the named tools in AGENTIC_LAYER.md
- No `run_any`, `eval`, or raw shell execution
- Every meaningful write goes through `log_audit()`

## Audit Principle
- Every lead create/update/delete, every checkout start, every payment received → row in `audit_logs`
- Audit rows are insert-only (no update/delete policy on audit_logs in lock-down sprint)
