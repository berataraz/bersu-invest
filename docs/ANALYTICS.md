# Property Analytics

## Data model

- `PropertyInteractionEvent` stores append-only interaction events.
- `PropertyAnalytics` stores a per-property, per-day aggregate.
- `PropertyAnalyticsVisitor` enforces one privacy-preserving unique-view record per property and calendar day.

## Recorded events

- `VIEW`
- `PHONE_CLICK`
- `WHATSAPP_CLICK`
- `CONTACT_SUBMITTED`
- `SHARE`
- `MAP_INTERACTION`
- `GALLERY_INTERACTION`
- `FAVORITE`
- `AI_IMPRESSION`
- `AI_CLICK`

## Privacy and integrity

- The browser creates a random local visitor identifier; the server stores only a one-way hash.
- Repeated views from the same visitor hash within 30 minutes do not inflate view totals.
- Metrics are only accepted for a published, non-deleted property.
- A contact record is persisted independently from analytics. Analytics failure is logged server-side but does not cause a false form failure.

## Admin visibility

The property editor displays actual 30-day totals for views, unique visitors, requests, WhatsApp clicks, and phone clicks, plus a daily trend chart. The panel intentionally displays an empty state until real activity exists; it does not create sample metrics.
