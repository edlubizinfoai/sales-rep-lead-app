# Intelligence Layer

## Messy Inputs
- Rep enters free-text notes, inconsistent deal sizes, skips fields
- Status is self-reported, may lag reality
- No call/email data in v1

## Auto-Structure (rule-based score, v1)
```json
{
  "lead_id": "uuid",
  "score": 74,
  "score_source": "rule-based",
  "score_confidence": 0.9,
  "score_review_status": "unreviewed",
  "factors": {
    "status_weight": 30,
    "deal_value_band": 25,
    "recency_days": 19
  }
}
```

## Scoring Rules (v1 — deterministic)
| Factor | Points |
|---|---|
| Status = qualified | +30 |
| Status = contacted | +15 |
| Status = new | +5 |
| Deal value ≥ $10k | +25 |
| Deal value $1k–$9.9k | +15 |
| Activity in last 3 days | +20 |
| Activity in last 7 days | +10 |
| No activity > 7 days | −10 |

## Events to Track
- Lead created / status changed / deal value updated
- Activity logged
- Score computed

## v1 vs Later
| v1 | Later |
|---|---|
| Rule-based score | OpenAI-powered score + explanation |
| No suggestions | AI follow-up suggestion per lead |
| No ranking UI | Ranked "Hot leads" tab |
