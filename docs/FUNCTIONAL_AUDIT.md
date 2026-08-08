# Functional Audit

Date: 2026-08-07

## Verified against the running production build

| Flow | Result | Notes |
| --- | --- | --- |
| Localised public roots | Pass | Four locale roots returned HTTP 200. |
| Sale and rent result routes | Pass | Query strings are accepted and preserved by the server routes. |
| Contact request validation | Pass | Invalid payload returns `400 VALIDATION_ERROR` and field names; no CRM record is created. |
| Protected admin route | Pass | Anonymous `/dashboard` redirects to `/admin/login`. |
| Database migration status | Pass | `prisma migrate status` reported five migrations and an up-to-date schema. |
| Seed | Pass | `npm run prisma:seed` completed without an error. |
| Type check | Pass | `npm run typecheck`. |
| Lint | Pass | `npm run lint`. |
| Production build | Pass | `npm run build`. |

## Repairs made

- Public request API validation errors no longer surface as a generic HTTP 500.
- Property engagement is recorded only for published properties, with a 30-minute duplicate-view window per privacy-preserving visitor hash.
- Failure to record analytics cannot turn a persisted contact request into a failed user submission.
- Public property detail queries the real published-property dataset rather than fixture content.

## Pending acceptance tests

- Authenticated property create, publish, edit, archive, media upload/reorder, and CRM assignment.
- Successful public form submit and confirmation using a real authorised CRM review.
- Full AI-provider calls, as no provider configuration was supplied for this test pass.
- Device screenshots and interactive mobile navigation testing.
