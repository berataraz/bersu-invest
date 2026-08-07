# Authentication and authorization

Authentication is implemented with Auth.js Credentials, short-lived access claims inside an encrypted JWT session, and rotating opaque refresh tokens. Refresh values are stored only as SHA-256 hashes in PostgreSQL; the raw value is retained inside Auth.js' encrypted HTTP-only JWT cookie.

## Roles and permissions

`SUPER_ADMIN` bypasses permission checks. `MANAGER` and `AGENT` receive seed permissions through `RolePermission`; direct `UserPermission` records allow an explicit grant or denial. An explicit denial takes precedence over role grants. Protect server routes with `requirePermission("properties.publish")` and server actions with the same utility.

## Security controls

- Argon2id password hashing with a 12-character complexity policy.
- Five invalid password attempts lock an account for 15 minutes.
- Redis-backed sliding-window rate limits are mandatory in production.
- All custom mutation endpoints require a same-origin, double-submit CSRF token from `GET /api/v1/auth/csrf`.
- Zod validates API payloads; Prisma parameterizes database operations.
- Refresh-token reuse revokes the entire token family.
- Password reset and password changes revoke all device sessions.
- TOTP secrets are AES-256-GCM encrypted using `AUTH_ENCRYPTION_KEY`; recovery codes are Argon2id hashes.
- Every login, credential change, verification, 2FA event, and session revocation is recorded in `AuditLog`.

## Required deployment configuration

Set `AUTH_SECRET` to a high-entropy secret, `AUTH_ENCRYPTION_KEY` to base64-encoded 32 random bytes, production `AUTH_URL` and `NEXT_PUBLIC_APP_URL`, PostgreSQL, and Upstash Redis credentials. Configure a Resend API key or replace `sendTransactionalEmail` with the company mail provider.
