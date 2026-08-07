# Database Backup

## Before Any Migration Or Cleanup

Use the private `DIRECT_URL` from your local `.env` and keep the backup outside version control.

```bash
mkdir -p backups
pg_dump --format=custom --no-owner --file "backups/bersu-$(date +%Y%m%d-%H%M%S).dump" "$DIRECT_URL"
```

Verify the archive before proceeding:

```bash
pg_restore --list "backups/<backup-file>.dump" | head
```

## Restore

Restoration overwrites database state and must only be performed after an explicit maintenance decision:

```bash
pg_restore --clean --if-exists --no-owner --dbname "$DIRECT_URL" "backups/<backup-file>.dump"
```

Never place `DIRECT_URL`, database passwords, or backup files in Git.
