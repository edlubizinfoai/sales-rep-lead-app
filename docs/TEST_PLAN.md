# Test Plan

## v1 Success Scenario (manual)
1. Open app at `/` — seed leads load, no login prompt
2. Click **Add Lead** → fill all fields → Save → lead appears in list with a score badge
3. Click lead → edit company name → Save → change reflected on list
4. Add 2 more leads (total 3) → all appear
5. Attempt to add a 4th lead → upgrade banner / paywall appears
6. Click **Upgrade** → Stripe Checkout opens (test card `4242 4242 4242 4242`)
7. Complete payment → redirected to `/success`
8. Return to `/` → 4th lead can now be added
9. Check Supabase `subscriptions` table → row with `status = active` exists
10. Check `audit_logs` → rows for lead inserts + `payment_received` action

## Empty State
- Delete all leads → empty state illustration + "Add your first lead" CTA shown

## Error Cases
- Submit Add Lead with blank name → inline validation error, no DB call
- Stripe webhook with invalid signature → 400 returned, no DB write
- Network offline during save → error toast, form data preserved

## Score Verification
- Lead: status=qualified, deal_value=15000, activity today → score should be ≥ 75
- Lead: status=new, deal_value=500, no activity > 7 days → score should be ≤ 15

## Post Lock-Down (Sprint 3)
- User A logs in → adds lead → logs out
- User B logs in → User A's lead is NOT visible
- Guest visits `/` → seed demo rows visible; Add Lead → redirect to `/login`
