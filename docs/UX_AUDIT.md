# UX Audit

Date: 2026-08-07

## Completed checks

| Area | Result | Evidence |
| --- | --- | --- |
| Locale entry points | Pass | `/tr`, `/en`, `/de`, and `/ru` returned HTTP 200 from the production build. |
| Property list and sale/rent URLs | Pass | Both `listingType=FOR_SALE` and `listingType=FOR_RENT` routes returned HTTP 200. |
| Contact intentions | Pass | Buy and sell CTAs now send `intent=buy` and `intent=sell` to the shared contact flow. |
| Public admin entry | Pass | `/admin/login` returned HTTP 200. |
| Anonymous dashboard access | Pass | `/dashboard` returned HTTP 307 to `/admin/login`. |
| Detail-page interface copy | Pass | Detail UI uses Turkish, English, German, and Russian message catalog entries. |
| Inactive list/grid toggle | Removed | The visual toggle had no behavior and was removed rather than left clickable. |

## Design decisions applied

- The public listing page keeps one usable result layout instead of offering a non-functional view switcher.
- Listing and request CTAs carry an explicit intent into the single CRM-backed form flow.
- The property detail has a single prominent contact action and measurable phone, WhatsApp, share, map, save, and view interactions.

## Not fully browser-verified in this run

- Visual breakpoints and mobile menu interaction could not be driven through the in-app browser automation binding in this environment.
- Authenticated admin CRUD and media upload require a real authorised test session. No temporary privileged account or fictitious production data was created.
- A public detail route can only be visually inspected when a published property exists in the connected database.
