#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# restore-db.sh
#
# Restores the Task Manager Postgres database from a .sql file produced by
# backup-db.sh. Prompts for confirmation before overwriting.
#
# Usage:
#     ./scripts/restore-db.sh backups/<filename>.sql
# -----------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
POSTGRES_CONTAINER="taskmanager-postgres"

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path-to-backup.sql>" >&2
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: backup file not found: $BACKUP_FILE" >&2
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE" >&2
    exit 1
fi

POSTGRES_USER="$(grep -E '^POSTGRES_USER=' "$ENV_FILE" | head -1 | cut -d= -f2-)"
POSTGRES_DB="$(grep -E '^POSTGRES_DB=' "$ENV_FILE" | head -1 | cut -d= -f2-)"

if [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_DB:-}" ]; then
    echo "Error: POSTGRES_USER or POSTGRES_DB missing from .env" >&2
    exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    echo "Error: container '$POSTGRES_CONTAINER' is not running." >&2
    echo "Hint: start the stack with 'docker compose up -d' first." >&2
    exit 1
fi

echo "About to RESTORE database '$POSTGRES_DB' on container '$POSTGRES_CONTAINER'"
echo "from file: $BACKUP_FILE"
echo
echo "This will OVERWRITE all current data in '$POSTGRES_DB'."
read -r -p "Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo "Restoring..."
docker exec -i "$POSTGRES_CONTAINER" \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    < "$BACKUP_FILE"

echo "Restore complete."
