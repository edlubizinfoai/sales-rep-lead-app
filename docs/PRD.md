# PRD — Sales Rep Lead Tracker

## Problem
Sales reps juggle leads in spreadsheets or bloated CRMs. They need one lightweight place to track leads, see which ones are hottest, and act fast — with no setup overhead.

## Target User
Individual sales rep or small sales team. Pays out of pocket for a tool that makes them faster.

## Core Objects
- **Lead** — the central record: person, company, status, deal value, score, notes
- **Activity** — a call, email, or meeting logged against a lead
- **Subscription** — Stripe payment record tied to a user
- **Audit Log** — every meaningful write action recorded

## MVP Checklist (v1 must-haves)
- [ ] Lead list visible without login (demo seed data)
- [ ] Add / edit / delete leads — all persist to DB
- [ ] Status workflow: New → Contacted → Qualified → Closed Won / Lost
- [ ] Rule-based lead score (0–100) shown on every lead
- [ ] Stripe Checkout — one paid tier, charges on upgrade
- [ ] Payment confirmed via webhook, stored in subscriptions table
- [ ] Free tier limited to 3 leads; paid tier unlimited

## Non-Goals (v1)
- Team / multi-user pipelines
- Email sending or CRM sync
- AI-generated content (Sprint 4)
- Mobile-native app

## Success Scenario
A sales rep lands on the app, sees live demo leads, adds their first real lead, hits the upgrade banner, pays $19/mo via Stripe, and is immediately unblocked to add unlimited leads — all in under 5 minutes.
