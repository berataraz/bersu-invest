# Admin QA

Date: 2026-08-07

## Security boundary checks

- Anonymous access to `/dashboard` was verified to redirect to `/admin/login`.
- The public header links only to the login route; it does not expose the dashboard.
- API validation errors return safe client responses instead of stack traces.

## Admin capabilities present in the repository

- Property editor with draft/publish/archive workflow and agent assignment.
- Customer, task, appointment, request, agent/manager/user, and property CRUD routes guarded by permissions.
- Property media endpoints with cover and ordering metadata.
- Audit logging for property write operations.
- Property-level analytics panel on an existing property editor.

## Not verified without a real authorised test account

The following require a deliberate authorised session and were not simulated by creating a Super Admin or test records in the connected database:

- Property, customer, user, appointment, task, or media write persistence from the browser.
- Permission-specific controls for Manager and Agent roles.
- Password-change, 2FA, session revocation, and logout journeys.
- CMS, magazine, SEO, translations, and theme settings flows not exposed as complete visible CRUD screens in the current build.

These items must remain unaccepted until an authorised stakeholder runs them in a non-production staging dataset.
