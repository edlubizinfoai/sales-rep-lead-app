# Agentic Layer

## Risk Levels & Actions

### Low — Auto (no approval needed)
- Compute and update lead score on every save
- Tag lead as "stale" if no activity > 7 days
- Auto-draft follow-up suggestion text (Sprint 4)

### Medium — Light Approval (rep confirms)
- Create a follow-up activity from AI suggestion
- Update lead status based on AI recommendation

### High — Always Approval
- Initiate Stripe Checkout Session (user must click Pay)
- Send outreach email on rep's behalf (Sprint 4+)

### Critical — Human Only
- Issue refund via Stripe
- Delete account + all data
- Any legal / compliance action

## Named Tools (approved list)
- `compute_lead_score(lead_id)` — rule engine, low risk
- `create_stripe_checkout(user_id, price_id)` — high risk, user-initiated
- `record_activity(lead_id, type, notes)` — low risk
- `update_lead_status(lead_id, new_status)` — medium risk
- `log_audit(table, record_id, action, payload)` — low risk, always fires

## Audit Log Fields
`id, user_id, table_name, record_id, action, payload (jsonb), created_at`

## v1 vs Later
- **v1**: compute score + log audit only
- **Sprint 4**: AI suggestion draft + rep approval flow
- **Later**: email send tool with approval queue
