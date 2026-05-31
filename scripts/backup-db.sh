#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# backup-db.sh
#
# Dumps the running Task Manager Postgres database to a timestamped .sql file
# inside ./backups/. Reads connection details from .env at the repo root.
#
# Usage:
#     ./scripts/backup-db.sh
#
# Output:
#     backups/task-manager-YYYY-MM-DD-HHMMSS.sql
# -----------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
BACKUPS_DIR="$REPO_ROOT/backups"
POSTGRES_CONTAINER="taskmanager-postgres"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE" >&2
    echo "Hint: copy .env.example to .env first." >&2
    exit 1
fi

# Pull POSTGRES_USER and POSTGRES_DB out of .env without leaking the rest.
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

mkdir -p "$BACKUPS_DIR"
TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
OUTPUT_FILE="$BACKUPS_DIR/task-manager-${TIMESTAMP}.sql"

echo "Backing up database '$POSTGRES_DB' as user '$POSTGRES_USER'..."
docker exec -t "$POSTGRES_CONTAINER" \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
    > "$OUTPUT_FILE"

SIZE="$(du -h "$OUTPUT_FILE" | cut -f1)"
echo "Backup complete: $OUTPUT_FILE ($SIZE)"
