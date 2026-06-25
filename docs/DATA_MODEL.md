# Data Model

## leads
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable until lock-down sprint |
| created_at | timestamptz | |
| name | text NOT NULL | |
| company | text | |
| email | text | |
| phone | text | |
| status | text | new / contacted / qualified / closed_won / closed_lost |
| deal_value | numeric | |
| notes | text | |
| score | numeric | **AI/rule field** |
| score_source | text | e.g. `rule-based` or `openai-gpt4o` |
| score_confidence | numeric | 0.0–1.0 |
| score_review_status | text | unreviewed / accepted / dismissed |
| last_activity_at | timestamptz | |

## activities
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| lead_id | uuid FK → leads | cascade delete |
| activity_type | text | call / email / meeting / note |
| notes | text | |
| occurred_at | timestamptz | |

## subscriptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |
| stripe_checkout_session_id | text | |
| plan | text | pro |
| status | text | active / canceled / past_due |
| current_period_end | timestamptz | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| table_name | text | |
| record_id | uuid | |
| action | text | insert / update / delete / checkout_started / payment_received |
| payload | jsonb | before/after snapshot |

## RLS
- All tables: permissive v1 policies (select + all open) — replaced by `auth.uid() = user_id` in Sprint 3.
