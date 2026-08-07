# Import Report

Date: 2026-08-06

## Status

No production content was imported or published by this code change.

## Changes

- Removed fixture properties, regions, advisors, articles, stock image references, and fake project records from the public source. This does not delete any pre-existing Supabase record.
- Added a review-only `ImportRecord` model and an idempotent legacy discovery command.
- Public sections without approved records now show a translated review state instead of fictional content.
- The admin overview reads actual Prisma counts; fixture dashboards are no longer reachable or present in source.

## Required Review

Run the dry run and attach its output to the content review ticket before writing an import review record. Any later mapping from a discovery record to a property, profile, article, project, or translation requires a human review and publication action.
