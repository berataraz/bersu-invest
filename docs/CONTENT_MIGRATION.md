# Content Migration

## Scope

The only automated source is the company-owned legacy site configured by `LEGACY_SOURCE_URL`. The importer discovers URLs and stores one review-only `ImportRecord`; it does not create or publish properties, articles, agents, projects, translations, or media.

## Safe Workflow

1. Back up the database as described in `docs/DATABASE_BACKUP.md`.
2. Apply migrations with `npx prisma migrate deploy`.
3. Run `npm run legacy:import` to inspect the source without database writes.
4. Review the discovery output and confirm source ownership and rights for every candidate item.
5. To save the discovery as a draft review record only, run `LEGACY_IMPORT_CONFIRM=I_UNDERSTAND_DRAFTS_ONLY npm run legacy:import -- --write`.
6. Manually classify, validate, translate, and approve each item before creating any public record.

## Rules

- Never publish imported records automatically.
- Preserve the legacy source URL and retrieval date.
- Do not import stock images, names, prices, descriptions, agent profiles, testimonials, or legal claims without written approval.
- Do not generate translations until the Turkish source content is approved.
- Resolve duplicates with the source URL and SHA-256 fingerprint before creating operational records.
