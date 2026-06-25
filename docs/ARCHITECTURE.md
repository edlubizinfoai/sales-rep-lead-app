# Architecture

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Database**: Supabase (Postgres + RLS)
- **Auth**: Supabase Auth (Sprint 3, not Sprint 1)
- **Payments**: Stripe Checkout + Webhooks
- **Hosting**: Vercel

## Now vs Later
| Now (v1) | Later |
|---|---|
| Lead CRUD + score | Activity timeline |
| Stripe checkout | AI follow-up suggestions |
| Demo mode (no login) | Auth + per-user isolation |
| Single paid tier | Team plans |

## Key User Action — "Rep adds a lead and upgrades"
1. Rep opens app → lead list loads from `leads` table (seed rows visible)
2. Rep clicks **Add Lead** → fills form → POST to `/api/leads` → row inserted → score computed server-side → UI updates
3. On 4th lead attempt → upgrade banner shown → POST to `/api/checkout` → Stripe Session created → rep completes payment
4. Stripe webhook fires → `/api/stripe-webhook` → row inserted into `subscriptions` → rep redirected to success page → full access granted

## Layer Plan
1. **Data first** — tables + RLS + seed rows
2. **App logic** — CRUD routes, score engine, Stripe integration
3. **Smart features** — AI suggestions, stale-lead alerts (Sprint 4)

## Core Without AI
Lead score is computed by deterministic rules (deal value × status weight × recency). Removing the AI layer leaves a fully functional lead tracker.
